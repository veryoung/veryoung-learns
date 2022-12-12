/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
/**
 * Created by piovachen on 2017/3/28.
 * 管理Feeds的数据的类
 */
import React from 'react';
import {
  View,
  Platform,
  QBDeviceModule,
  AsyncStorage,
} from '@tencent/hippy-react-qb';
import FeedsItemDataHolder from './FeedsItemDataHolder';
import FeedsItemExtBean from '../domain/FeedsItemExtBean';
import FeedsDataManager from './FeedsDataManager';
import getFeedsView from '../feeds-styles/index';

import FeedsConst, {
  Debug,
  SpecialStyle,
  SplitHistoryType,
  TRANSITION_ANIM_MAP,
  MODULE, fixedTabId, fixedTabChildId,
} from './FeedsConst';
import FeedsItemRepository from '../repository/FeedsItemRepository';
import FeedsSetting from '../repository/FeedsSetting';
import FeedsEventHub from './FeedsEventHub';
import NetworkState from './NetworkState';
import {
  MINUTE,
  DAY,
  AUTO_REFRESH_DURATION,
  UpdateModeType,
  RefreshType,
} from '../utils/constants';
import { FeedsUtils, vectorToArray } from '../feeds-styles/tab-22/components/utils';

import StorageUtils from './StorageUtils';
import { asyncCall, formatDate, isSupportNewPb } from './Utils';
import { logError, addKeylink, KeylinkCmd, reportBeacon, strictExposeReporter, TechKey } from '@/luckdog';
import { TabId } from '../entity';
import RecommBookChecker from '../utils/recomm-book-checker';

// polyfill for ios8
// see: http://mcculloughwebservices.com/2016/11/29/adding-support-es2015-number-methods/
Number.isInteger = Number.isInteger
  || function (value: any) {
    return value === parseInt(value, 10);
  };

const TAG = 'PageViewModel';
/**
 * 批量计算高度
 * @param dataHolders
 */
// const test = [];
const fillItemsHeight = function fillItemsHeight(dataHolders) {
  dataHolders.every((dataHolder) => {
    let StyleUI;
    switch (dataHolder.mItemViewType) {
      case SpecialStyle.GroupMore:
        dataHolder.mItemRowType = SpecialStyle.GroupMore;
        return true;
      case SpecialStyle.SplitHistory:
        dataHolder.mItemRowType = SpecialStyle.SplitHistory;
        return true;
      case SpecialStyle.RefreshTip:
        dataHolder.mItemRowType = SpecialStyle.RefreshTip;
        return true;
      case SpecialStyle.MoreEntrance:
        dataHolder.mItemRowType = SpecialStyle.MoreEntrance;
        return true;
      case SpecialStyle.MessagePush:
        dataHolder.mItemRowType = SpecialStyle.MessagePush;
        return true;
      default:
        StyleUI = getFeedsView(dataHolder.mItemViewType);
        break;
    }
    if (StyleUI === undefined) {
      return true;
    }

    if (dataHolder.mData && dataHolder.mData !== null) {
      try {
        if (StyleUI.getRowType) {
          dataHolder.mItemRowType = StyleUI.getRowType();
          return true;
        }
      } catch (err) {
        logError(err, 'FeedsPageViewModel.fillItemsHeight');
      }
    } else {

    }
    return true;
  });
};

const filterBottomLine = function filterBottomLine(separateArr) {
  separateArr.forEach((item) => {
    // 在此处计算各卡片分隔线样式
    item.mData.bottomLineStyle = 0;
    // 如果测试开头打开，则直接在标题中显示对应的卡片样式编号
    if (Debug.uiDebug === true && item.mDebug !== true) {
      item.mData.title = `${item.mData.ui_style}->${item.mData.title}`;
      item.mDebug = true;
    }
  });
};

// 清除置顶UI
const clearTopUI = function clearTopUI(mDataHolders, topHolder, index) {
  if (!mDataHolders || mDataHolders.length === 0 || !topHolder || !topHolder.mData || index < 0) {
    return;
  }
  const topItem = topHolder.mData;
  const deleteIndexList = [index]; // 本身索引置入
  if (topItem.ui_style === SpecialStyle.Top) {
    // UI12需要把展开的子UI也要清除掉
    mDataHolders.forEach((item, i) => {
      if (topHolder.children[item.item_id]) {
        deleteIndexList.push(i); // 子索引置入
      }
    });
  }

  deleteIndexList.forEach((i) => {
    mDataHolders.splice(i, 1);
  });
};

/**
 * 设置真实曝光上报任务
 * @param symbolKey
 * @param newItems 新请求数据
 * @param mDataHoldersRealInfo 待处理真实曝光数据
 * @param freshInfo 刷新次数
 */
const setRealExposeTask = function setRealExposeTask(
  newItems: any[] = [],
  mDataHoldersRealInfo: any = {},
  freshInfo: any = {},
) {
  if (!newItems.length) return;

  mDataHoldersRealInfo.realExposeList.push({
    freshTime: freshInfo.freshTime,
    itemArr: newItems,
  });
  Object.assign(mDataHoldersRealInfo.freshTimeMap, {
    [freshInfo.freshTime]: 0,
  });
};

class UpdateFlag {
  public clearHistory = false; // 清空历史
  public showHistory = false; // 显示历史数据
  public clearTop = false; // 清空置顶（loadMore的时候无效)
  public showPortal = false; // 进入专区
  public splitHistory = false; // 上次阅读到这里
  public RefreshTip = false; // 刷新提示
  public slideUp = true; // 支持下拉
  public splitHistoryType;
}

export default class FeedsPageViewModel {
  public static AutoRefreshType = {
    None: 0,
    Tips: 1,
    Normal: 2,
  };
  /**
   * 只解析一个item的数据 , 直接解析成Holder
   * @param {Object} item
   * @author uct
   * @returns FeedsItemDataHolder
   */
  public static preParseOne(itemData, tabId, appId, symbolKey) {
    try {
      const now = new Date().getTime();
      const item = FeedsDataManager.jceFeedsItemData2ExtBean(itemData, tabId, now, appId, null); // 解析Bean
      FeedsDataManager.preParseBeanData(item); // 解析style_data
      const holder = new FeedsItemDataHolder(); // 对齐handle_items里面的处理逻辑
      // eslint-disable-next-line @typescript-eslint/naming-convention
      let { ui_style } = item;
      const grayInfo = item.grayInfo || {};
      if (grayInfo.ui?.[ui_style]) {
        ui_style = 20000 + parseInt(grayInfo.ui[ui_style], 10);
      }
      holder.mItemViewType = ui_style;
      item.ui_style = ui_style;
      item.refreshType = 1;
      item.symbolKey = symbolKey;
      holder.mData = item;
      return holder; // 返回 FeedsItemDataHolder 对象
    } catch (err) {
      logError(err, 'FeedsPageViewModel.preParseOne');
      return null;
    }
  }
  public mDataHolders: FeedsItemDataHolder[] = [];
  public mWatchInfo: any = null;
  public flashId;
  public growExt: any = null;
  public growFilterExt: any = null;
  public extParams: any = {};
  public lastScrollPos = 0;
  public mTabId: any;
  public mTabBean: any;
  public symbolKey: any;
  public mStoreNumber: any;
  public mRepository: FeedsItemRepository;
  public parentView: any;
  public messagePushCacheKey: string;
  public mDataHoldersRealInfo = {
    freshTimeMap: {},
    realExposeList: [] as any[],
  };
  public firstLoadedHoldersLength = 15;
  // 搜索词刷数退避map
  public searchWordFreshCtnMap = {};
  // 导流刷数退避map
  public ugDiversionFreshCtnMap = {};
  public topAndRreshNum = 0; // 置顶和刷新条数
  public lastLoadDataTime = 0;
  public fileInsertInfo: any;
  private mSetting: any = null;
  // 推荐书籍检查器
  private recommBookChecker: RecommBookChecker;
  /** 是否是有推荐内容的卡 */
  private isRecommTab = false;

  public constructor(tabId, tabBean, symbolKey, parentView) {
    this.mTabId = tabId;
    this.mTabBean = tabBean;
    this.symbolKey = symbolKey;
    if (this.mTabBean?.iStoreNumber) {
      this.mStoreNumber = tabBean.iStoreNumber;
    } else {
      this.mStoreNumber = 10;
    }
    const { globalConf } = parentView;
    this.mRepository = new FeedsItemRepository(globalConf.appId, tabId, isSupportNewPb(tabId));
    this.parentView = parentView;
    this.messagePushCacheKey = `${FeedsEventHub.event.moduleName}:messagePush:${globalConf.appId}_qbid_${globalConf.qbid}`;
    /** 推荐书籍检查器 */
    this.recommBookChecker = new RecommBookChecker(tabId);
    /** todo: 暂时只有书架tab不出推荐内容卡片 */
    this.isRecommTab = tabId !== TabId.SHELF;
  }

  public setReqTabIds = () => {
    this.setExtParams('SELECT_TAB_IDS', '[22]');
  };

  public setExtParams = (key, customTabs) => {
    this.extParams[key] = customTabs;
  };

  public deleteExtParam = (key) => {
    delete this.extParams[key];
  };

  public getExtParam = key => this.extParams[key] || null;

  /** 获取扩展信息 */
  public get extInfo() {
    return FeedsUtils.getSafeProps(this.mSetting, 'mExtInfo.value', {});
  }

  public setFlashId = (flashId) => {
    this.flashId = flashId;
  };

  // extParam赋值了onloadurl参数的标记 1.growExt 2.growFilterExt 3.fileInsertInfo
  public setOnLoadUrlFlag = (key, value) => {
    this[key] = value;
  };

  public resetOnloadUrlExtParams = (flag: any = {}) => {
    if (this.growExt) {
      if (flag.clearHistory === false) {
        flag.clearHistory = true; // 避免拉活场景被去重
      }
      this.growExt = null;
      this.deleteExtParam('INSERT_ITEMS_WITH_TAG_LIST');
      this.deleteExtParam('INSERT_ITEMS');
    }

    if (this.growFilterExt) {
      this.growFilterExt = null;
      this.deleteExtParam('INSERT_FILTER_ITEMS');
    }

    // 文件资讯引导标识，用过一次就清除
    if (this.fileInsertInfo) {
      this.fileInsertInfo = null;
      this.deleteExtParam('FILE_INSERT_INFO');
    }
  };

  public onContainerLayout = (event, index) => {
    strictExposeReporter.updateCardRect(index, event.layout);
  };

  public createFeedsItemView = (dataHolder, _isColdStart, tabId, index, initCount, self, isEdit, totalLength) => {
    // 通用逻辑
    const pandoraComponentNum = 0;
    const StyleUI = getFeedsView(dataHolder.mItemViewType || 0);
    const { globalConf } = this.parentView;
    if (StyleUI === undefined) {
      logError(`createFeedsItemView -> ${JSON.stringify(dataHolder)} tabID =${tabId}`, 'FeedsPageViewModel.createFeedsItemView');
      return <View key={`${tabId}_${index}`} />; // return null会导致 lastVisibleRowIndex和dataHolder里面对应不起来
    }
    return (
      <View
        collapsable={false}
        onLayout={event => this.onContainerLayout(event, index)}
      >
        <StyleUI
          key={`${tabId}_${index}`}
          index={index}
          itemBean={dataHolder.mData}
          parentModel={this}
          globalConf={globalConf}
          initCount={initCount}
          parent={self}
          isEdit={isEdit}
          pandoraComponentNum={pandoraComponentNum}
          totalLength={totalLength}
          selectTabID={tabId}
        />
      </View>
    );
  };

  /**
   * 获取缓存
   * @returns {Promise.<*>} 缓存列表
   */
  public loadCache = async () => {
    const items: any[] = [];

    try {
      // 冷启动后需要先获取王卡信息
      const devInfo = FeedsConst.getGlobalConfKV('deviceInfo') || (await QBDeviceModule.getDeviceInfo());
      this.parentView.globalConf.isKingCardUser = devInfo.isKingCardUser || false;

      addKeylink('loadCache() 获取缓存内容', TAG);
      const result = await this.mRepository.loadItemsAndSetting();
      if (!result.setting) return null;
      this.mSetting = result.setting;
      FeedsConst.setGlobalConfKV('extInfo', FeedsUtils.getSafeProps(this.mSetting, 'mExtInfo.value', {}));
      if (result.items && result.items instanceof Array) {
        result.items.forEach((item) => {
          // cardKey 为新协议字段
          // parsedObject 为老协议字段
          // 423新用户选择阅读喜好卡片 parsedObject 为null
          if (item.parsedObject || item.cardKey || item.ui_style === 423) {
            items.push(item);
          }
        });
      }
      if (items.length <= 0) {
        return null;
      }
      // eslint-disable-next-line no-underscore-dangle
      const holders = await this._handleItems(items);
      let firstLoadedHoldersLength = 0;
      items.forEach((item) => {
        if (item?.refreshType && item.refreshType !== FeedsDataManager.refreshType.loadMore) {
          firstLoadedHoldersLength += 1;
        }
      });

      // 获取第一刷数据长度
      this.firstLoadedHoldersLength = firstLoadedHoldersLength || 10;

      addKeylink(`loadCache end, ui_style: ${items.map(i => i?.ui_style)}`, TAG);
      return holders;
    } catch (error) {
      logError(error, 'FeedsPageViewModel.loadCache');
    }
  };

  /**
   * 显示刷新提升
   * @returns boolean 是否需要更新
   */
  public showRefreshTip = (title) => {
    const self = this;
    const index = self.mDataHolders.findIndex(p => p.mItemViewType === SpecialStyle.RefreshTip);
    if (index < 0) {
      const holder = new FeedsItemDataHolder();
      holder.mItemViewType = SpecialStyle.RefreshTip;
      holder.mData = new FeedsItemExtBean();
      holder.isSpecial = true;
      holder.isDeleted = false;
      holder.mData.title = title;
      self.mDataHolders.splice(0, 0, holder);
      return true;
    }
    if (index === 0) {
      const holder = self.mDataHolders[index];
      if (holder.isDeleted) {
        holder.isDeleted = false;
        return true;
      }
      return false;
    }
    const holder = self.mDataHolders[index];
    self.mDataHolders.splice(index, 1);
    self.mDataHolders.splice(0, 0, holder);
    holder.isDeleted = false;
    return true;
  };

  /**
   * 隐藏刷新提示
   * @returns {Promise.<boolean>} 是否需要更新
   */
  public hideRefreshTip = () => {
    const self = this;
    const index = self.mDataHolders.findIndex(p => p.mItemViewType === SpecialStyle.RefreshTip);
    if (index < 0) {
      return false;
    }
    self.mDataHolders.splice(index, 1);
    return true;
  };

  /**
   * 处理watchInfo
   * @param iTabReqMode
   * @returns {Promise<null>}
   */
  public handleWatchInfo = async () => {
    const self = this;
    // 读不到缓存读本地
    try {
      if (self.mSetting === null) {
        self.mSetting = await self.mRepository.loadSetting();
      }

      return FeedsSetting.getWatchInfo(self.mSetting?.mWatchInfo);
    } catch (e) {
      logError(e, 'FeedsPageViewModel.handleWatchInfo');
    }
    return null;
  };

  /**
   * 添加插入参数
   */
  public setInsertParams = () => {
    if (this.growExt?.docId) {
      if (this.growExt.isTag) {
        this.extParams.INSERT_ITEMS_WITH_TAG_LIST = JSON.stringify([
          {
            docId: this.growExt.docId,
            pos: 0,
          },
        ]);
      } else {
        this.extParams.INSERT_ITEMS = JSON.stringify([
          {
            docId: this.growExt.docId,
            pos: 0,
          },
        ]);
      }
    }

    if (this.growFilterExt?.itemList && this.growFilterExt.strategyId) {
      const insertFilterItemsParams = {
        strategyId: this.growFilterExt.strategyId,
        itemList: this.growFilterExt.itemList,
        pos: 0,
      };
      if (this.growFilterExt.noFilter) {
        Object.assign(insertFilterItemsParams, {
          noFilter: 1,
        });
      }
      this.extParams.INSERT_FILTER_ITEMS = JSON.stringify(insertFilterItemsParams);
    }

    // 文件引导资讯
    if (this.fileInsertInfo) {
      this.extParams.FILE_INSERT_INFO = this.fileInsertInfo;
    }
  };

  /**
   * 根据后台字段设置实验参数
   * @param mpExtInfo
   * @param globalConf
   */
  public setLabParams = (mpExtInfo, globalConf) => {
    if (this.mTabId === 1) {
      if (mpExtInfo.cache_multi_refresh === '3') {
        // 策略3：冷启动保持置顶+1条安全内容+最后一刷露出+提示刷新
        // 保留第一刷+最后一刷
        globalConf.multiCacheAndTopValue = 3;
        asyncCall(() => {
          FeedsSetting.setMultiCacheAndTopValue(3);
        });
      } else {
        // 默认策略：保留最后一刷，不提示刷新
        globalConf.multiCacheAndTopValue = 0;
        asyncCall(() => {
          FeedsSetting.setMultiCacheAndTopValue(0);
        });
      }

      // 距离上次刷新时间阈值
      // mpExtInfo.last_refresh_duration_threshold = 0.2;
      if (mpExtInfo.last_refresh_duration_threshold) {
        asyncCall(() => {
          globalConf.lastRefreshDurationThreshold = Number.parseFloat(mpExtInfo.last_refresh_duration_threshold);
          StorageUtils.setItem(
            `${FeedsEventHub.event.moduleName}:lastRefreshDurationThreshold`,
            globalConf.lastRefreshDurationThreshold,
          );
        });
      } else {
        asyncCall(() => {
          globalConf.lastRefreshDurationThreshold = null;
          StorageUtils.setItem(
            `${FeedsEventHub.event.moduleName}:lastRefreshDurationThreshold`,
            globalConf.lastRefreshDurationThreshold,
          );
        });
      }
    }
    // 置顶隐藏实验
    globalConf.topAutoHide = Number(mpExtInfo.top_auto_hide || '0');

    if (mpExtInfo.top_hide_first_refresh === '1') {
      globalConf.top_hide_first_refresh = 1;
    } else {
      globalConf.top_hide_first_refresh = 0;
    }

    // 过渡动画实验
    globalConf.transitionAnim = [0, 0, 0, 0];
    globalConf.transitionAnim[TRANSITION_ANIM_MAP.INFO] = 1;
    if (mpExtInfo.transition_anim_ugcfloat === '1') {
      globalConf.transitionAnim[TRANSITION_ANIM_MAP.UGCFLOAT] = 1;
    }
    if (mpExtInfo.transition_anim_videofloat === '1') {
      globalConf.transitionAnim[TRANSITION_ANIM_MAP.VIDEOFLOAT] = 1;
    }
    if (mpExtInfo.transition_anim_shortfloat === '1') {
      globalConf.transitionAnim[TRANSITION_ANIM_MAP.SHORTFLOAT] = 1;
    }
    asyncCall(() => {
      FeedsConst.setGlobalConfKV('transitionAnim', globalConf.transitionAnim);

      StorageUtils.setItem(
        `${FeedsEventHub.event.moduleName}:transitionAnim`,
        globalConf.transitionAnim,
      );
    });
  };

  /**
   * 拉取数据
   * @param refreshType
   * @param __autoRefresh
   * @param isSpecialRefresh
   * @param iTabReqMode
   * @returns {Promise<{code: number, success: boolean, count: number}|{code: *, success: boolean, count: number}
   * |{slideUp: boolean, code: number, freshInfo: {freshTime: number},
   * success: boolean, count: number, clear: boolean, hasFollowed: boolean, refreshObj: null, items: []}>}
   */
  public loadDataSource = async (refreshType, __autoRefresh, isSpecialRefresh = false, iTabReqMode = 0) => {
    const self = this;
    addKeylink('loadDataSource(), 开始拉取feeds数据', TAG);
    Object.assign(this.parentView.globalConf.timeCost, {
      loadDataSourceStart: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
    });
    // 保护逻辑
    const startTime = new Date().getTime();
    if (startTime - self.mTabBean.protect_time <= 0) {
      addKeylink('命中保护逻辑, 直接返回', TAG);
      return { success: false, code: 2, count: 0 };
    }
    self.mTabBean.protect_time = 0;
    const hasCache = self.mDataHolders.length > 0;
    const mDataHoldersMemoryCount = self.mDataHolders.length;

    try {
      let { mWatchInfo } = self;
      if (mWatchInfo === null) {
        // 读不到缓存读本地
        mWatchInfo = await this.handleWatchInfo();
      }

      // 内容闪屏feeds推送
      if (
        this.flashId
        && mWatchInfo
        && mWatchInfo.value
        && mWatchInfo.value[1]
        && mWatchInfo.value[1].mpExtInfo.value
      ) {
        mWatchInfo.value[1].mpExtInfo.value.flashTagId = this.flashId;
      }
      this.setInsertParams();
      this.setReqTabIds();
      Object.assign(this.parentView.globalConf.timeCost, {
        requestItemListStart: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
        tabId: self.mTabId,
      });
      let listLength = 0;
      try {
        const topLength = this.getTopItemLength();
        if (refreshType === FeedsDataManager.refreshType.loadMore) {
          listLength = self.mDataHolders.length - topLength;
        }
      } catch (err) {
        logError(err, 'FeedsPageViewModel.loadDataSource');
      }
      this.extParams.last_feeds_position = String(listLength);
      let PageId = `${self.mTabId}`;
      if (PageId === `${fixedTabId}`) PageId = `${fixedTabChildId}`;
      this.extParams.SELECT_TAB_PAGEID = PageId;
      if (PageId !== `${TabId.SHELF}`) {
        this.deleteExtParam('CUR_BOOK_ID');
        this.deleteExtParam('PAGE_NUM');
      }
      if (PageId === `${TabId.SHELF}` && this.parentView.globalConf.firstInBookshelf) {
        this.deleteExtParam('CUR_BOOK_ID');
        this.deleteExtParam('PAGE_NUM');
        this.parentView.globalConf.firstInBookshelf = false;
      }
      addKeylink('requestItemList() start', TAG);
      const rsp = await FeedsDataManager.requestItemList(
        refreshType,
        mWatchInfo,
        this.extParams,
        this.parentView.globalConf,
        hasCache,
      );
      addKeylink('完成拉取feeds', TAG);

      Object.assign(this.parentView.globalConf.timeCost, {
        requestItemListEnd: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
      });
      // 清除内容闪屏feeds推送参数
      if (this.flashId) {
        this.flashId = '';
        if (
          mWatchInfo?.value?.[1]?.mpExtInfo.value.flashTagId
        ) {
          mWatchInfo.value[1].mpExtInfo.value.flashTagId = '';
        }
      }

      const now = new Date().getTime();
      if (rsp === null) {
        addKeylink('响应的rsp=null, code=-1', TAG);
        reportBeacon(TechKey.EXPOSE__FETCH_DATA_FAIL, {}, {
          errorCode: -1,
          errorMsg: '响应的rsp=null',
        });
        this.resetOnloadUrlExtParams();
        return { success: false, code: -1, count: 0 };
      }
      if (rsp.timeCode) {
        addKeylink('响应存在rsp.timeCode, code=-4', TAG);
        reportBeacon(TechKey.EXPOSE__FETCH_DATA_FAIL, {}, {
          errorCode: -4,
          errorMsg: '响应存在rsp.timeCode',
        });
        this.resetOnloadUrlExtParams();
        return { success: false, code: -4, count: 0 };
      }
      if (rsp.return === 0) {
        const { globalConf } = this.parentView;
        // noinspection JSAnnotator
        const resp = rsp.arguments.rsp;
        if (resp === undefined) {
          addKeylink('响应的rsp.return=0, 但resp为空, code=-1', TAG);
          reportBeacon(TechKey.EXPOSE__FETCH_DATA_FAIL, {}, {
            errorCode: -1,
            errorMsg: '响应的rsp.return=0, 但resp为空',
          });
          this.resetOnloadUrlExtParams();
          return { success: false, code: -1, count: 0 };
        }
        if (resp.iRet !== 0) {
          addKeylink(`响应的rsp.return=0, 但resp.iRet !== 0, code=${resp.iRet}`, TAG);
          reportBeacon(TechKey.EXPOSE__FETCH_DATA_FAIL, {}, {
            errorCode: resp.iRet,
            errorMsg: '响应的rsp.return=0, 但resp.iRet !== 0',
          });
          this.resetOnloadUrlExtParams();
          if (resp.iRet === 2 && self.mTabBean.iStopRequest) {
            self.mTabBean.protect_time = now + (MINUTE * self.mTabBean.iStopRequest);
          }
          return { success: false, code: resp.iRet, count: 0 };
        }
        // 设置flag
        const flag = new UpdateFlag();
        flag.clearHistory = resp.bClearHistory;
        flag.showHistory = resp.bShowHistory;
        flag.showPortal = resp.bShowPortal;
        flag.clearTop = resp.stFixedTop.bDelete;
        flag.splitHistory = false; // 屏蔽上次看到这
        flag.splitHistoryType = SplitHistoryType.Normal;
        flag.slideUp = resp.bSlideUp;
        const grayInfo = { config: 'default', ui: {} };
        if (resp.stGrayInfo) {
          const { stGrayInfo } = resp;
          if (stGrayInfo.sGlobalConfig) {
            grayInfo.config = stGrayInfo.sGlobalConfig;
          }
          if (stGrayInfo.mpUIMap) {
            grayInfo.ui = stGrayInfo.mpUIMap.value || {};
          }
        }
        // onloadurl相关刷新插入参数清除
        if (isSpecialRefresh) {
          this.resetOnloadUrlExtParams(flag);
        }
        if (resp.mpExtInfo) {
          const mpExtInfo = resp.mpExtInfo.value || {};
          this.setLabParams(mpExtInfo, globalConf);
        }

        // 针对关注tab - 09/08/07
        const hasFollowed = true;

        let refreshObj: any = null;
        // 针对刷新提示文案的处理逻辑 by uct
        if (resp?.stStatusBarInfo) {
          const refreshText = resp.stStatusBarInfo.sRefreshTipsText; // 刷新文案
          const refreshIcon = resp.stStatusBarInfo.sRefreshTipsIcon; // 刷新图标
          const refreshEgg = resp.stStatusBarInfo.stRenderBeforeRefresh; // 彩蛋信息
          refreshObj = { refreshText, refreshIcon, refreshEgg };
        }
        const items = FeedsDataManager.jceFeedsItemDataList2ExtBeanList(
          resp.vItemListData.value,
          resp.iTabId,
          now,
          grayInfo,
          resp.iAppId,
          this.growExt,
        );
        addKeylink(`成功拉取到${items.length}条feeds，ui_style: ${items?.map(i => i?.ui_style)}`, TAG);
        if (refreshType === FeedsDataManager.refreshType.refresh) {
          if (resp.stFixedTop.stItem.sItemId !== '') {
            // 处理置顶元素
            const topItem = FeedsDataManager.jceFeedsItemData2ExtBean(
              resp.stFixedTop.stItem,
              resp.iTabId,
              now,
              grayInfo,
              resp.iAppId,
            );
            if (topItem !== null) {
              topItem.orderType = FeedsItemExtBean.OrderType.Top;
              items.splice(0, 0, topItem);
            }

            const index = self.mDataHolders.findIndex(p => p.mData.orderType === FeedsItemExtBean.OrderType.Top);
            if (index >= 0) {
              clearTopUI(self.mDataHolders, self.mDataHolders[index], index);
            }
          }
          // 刷新时候重置推荐书籍检查器
          this.recommBookChecker.reset();
        }
        // 去重逻辑
        const refresh = refreshType === FeedsDataManager.refreshType.refresh;
        const vDeleteCacheList = resp.vDeleteCacheList.value;
        self.preParse(items);
        if (self.mTabId === TabId.BOTTOM_RECOMM1) {
          if (this.extParams.LOCAL_REFRESH) {
            delete this.extParams.LOCAL_REFRESH;
          }
        }
        const freshInfo: any = {
          freshTime: Date.now(),
        };
        // 获取下拉刷新时间和次数
        if (
          resp.mpWatchedInfo?.value?.[0]?.mpExtInfo?.value
        ) {
          const { reqInfo } = resp.mpWatchedInfo.value[0].mpExtInfo.value;
          try {
            const reqInfoObj = JSON.parse(reqInfo);
            const refreshDay = reqInfoObj.ver || ''; // 下拉刷新日期，格式11月4日： 11/4
            const downPullFreshCnt = reqInfoObj['1'] || -1; // 下拉刷新次数
            const upPullFreshCnt = reqInfoObj['2'] || -1; // 上拉刷新次数
            Object.assign(freshInfo, {
              refreshDay,
              downPullFreshCnt,
              upPullFreshCnt,
            });
          } catch (err) {
            logError(err, 'FeedsPageViewModel.parseReqInfoError');
          }
        }
        // 刷新次数
        if (resp.mpExtInfo) {
          const mpExtInfo = resp.mpExtInfo.value || {};
          if (mpExtInfo.freshCnt) {
            Object.assign(freshInfo, {
              freshCnt: parseInt(mpExtInfo.freshCnt, 10),
            });
          } else {
            Object.assign(freshInfo, {
              freshCnt: -1,
            });
          }
          Object.assign(this.parentView.globalConf.timeCost, {
            freshCnt: freshInfo.freshCnt,
          });
        }

        addKeylink('_handleItems() start, 设置刷新对象', TAG);
        // 该方法执行完后，self.mDataHolders 会变成最新的值
        // eslint-disable-next-line no-underscore-dangle
        await self._handleItems(
          items,
          null,
          refresh,
          flag,
          vDeleteCacheList,
          refreshType,
          freshInfo,
        );
        addKeylink('handleItems() done', TAG);
        self.mWatchInfo = resp.mpWatchedInfo;

        if (self.mSetting === null) {
          self.mSetting = new FeedsSetting();
        }
        self.mSetting.updatedTime = now;
        // self.mSetting.mWatchInfo = FeedsSetting.setWatchInfo(resp.mpWatchedInfo);
        self.mSetting.mWatchInfo = resp.mpWatchedInfo;
        self.mSetting.mExtInfo = resp.mpExtInfo;
        self.mSetting.clearCache = resp.bClearCache;
        self.mSetting.iTabReqMode = iTabReqMode;
        self.mRepository.saveSettingAsync(self.mSetting);

        let needSaveItems: any[] = [];

        if (refreshType === FeedsDataManager.refreshType.loadMore && flag.clearHistory) {
          // TODO: loadMore时要去掉clearHistory
          // 旧策略：下滑加载更多需要清除缓存时，保留置顶feeds
          const topFeeds = self.mDataHolders
            .filter(holder => holder.mData.orderType === FeedsItemExtBean.OrderType.Top);
          // 只保留最后一屏数据加上置顶feeds
          const lastLoadedDataHolders = self.mDataHolders.slice(mDataHoldersMemoryCount);
          needSaveItems = [
            ...topFeeds.map(h => h.mData),
            ...lastLoadedDataHolders.map(h => h.mData),
          ];
        } else {
          needSaveItems = self.mDataHolders.map(holder => holder.mData);
        }

        // 下拉刷新，重置搜索计数标记
        if (refreshType !== FeedsDataManager.refreshType.loadMore) {
          self.searchWordFreshCtnMap = {};
          self.ugDiversionFreshCtnMap = {};
        }
        self.mRepository.saveItemsAsync(needSaveItems, refresh, flag.clearHistory);
        let itemCnt = items.length;
        if (resp.stFixedTop.stItem.sItemId && itemCnt > 1) {
          itemCnt -= 1; // 置顶UI暂不算推荐条数
        }

        setRealExposeTask(items, self.mDataHoldersRealInfo, freshInfo);
        // 判断是否触底
        const FeedsItemExtBeans = items[0] || {};
        const { parsedObject = {} } = FeedsItemExtBeans;
        let { bPageEnd = false } = parsedObject || {};
        // 我的书籍需要合并数据
        if (PageId === `${TabId.SHELF}` && refreshType !== 1) {
          let baseData: any = '';
          if (self.mDataHolders && self.mDataHolders.length > 1) {
            const newDataSource = JSON.parse(JSON.stringify(self.mDataHolders));
            // eslint-disable-next-line prefer-destructuring
            baseData = newDataSource[0];
            const lastBaseData = newDataSource[newDataSource.length - 1];
            const baseDataParsedObject = baseData.mData.parsedObject;
            const lastDataParsedObject = lastBaseData.mData.parsedObject;
            const newDataSourceParsedObject = Object.assign({}, baseDataParsedObject, lastDataParsedObject);
            const array: any[] = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < newDataSource.length; i++) {
              const data = vectorToArray(newDataSource[i].mData.parsedObject.vDetailData);
              array.push(data);
            }
            newDataSourceParsedObject.bIsShouldBeMerge = true;
            newDataSourceParsedObject.vDetailData.value = array;
            baseData.mData.parsedObject = newDataSourceParsedObject;
          }
          return {
            success: true,
            items: [baseData],
            count: itemCnt,
            code: 0,
            clear: flag.clearHistory,
            slideUp: flag.slideUp,
            refreshObj,
            hasFollowed, // 0关注标志位
            freshInfo,
            bPageEnd,
          };
        }
        // 如果推荐数据返回少于预期 则需要上报一个告警
        if (this.mTabId === TabId.BOTTOM_RECOMM1 && self.mDataHolders.length < 3) {
          reportBeacon(TechKey.EXPOSE__RECOMMEND_DATA_ERROR);
        }

        // 如果最新上架也加数据返回一组数据则认为没有更多数据了
        if (this.mTabId === TabId.LATEST && self.mDataHolders.length <= 1) {
          bPageEnd = true;
        }
        if (itemCnt === 0) bPageEnd = true;
        addKeylink(`最后返回正常的feeds数据, ${JSON.stringify({
          items: self.mDataHolders.length,
          count: itemCnt,
          clear: flag.clearHistory,
          slideUp: flag.slideUp,
          pageEnd: bPageEnd,
        })}`, TAG);
        if (this.isRecommTab) {
          this.checkRecommCard(refreshType, items);
        }
        return {
          success: true,
          items: self.mDataHolders,
          count: itemCnt,
          code: 0,
          clear: flag.clearHistory,
          slideUp: flag.slideUp,
          refreshObj,
          hasFollowed, // 0关注标志位
          freshInfo,
          bPageEnd,
        };
      }
      addKeylink(`loadDataSource(), 最后的返回失败情况, code=${rsp.code}`, TAG);
      return { success: false, code: rsp.code, count: 0 };
    } catch (e) {
      addKeylink('loadDataSource(), 拉取feeds抛出异常', TAG);
      logError(e, 'FeedsPageViewModel.loadDataSourceError');
      return { success: false, code: -10000, count: 0 };
    }
  };

  /** 检查推荐数据 */
  public checkRecommCard = (refreshType, cards) => {
    /** 推荐数据不存在或者没拉取到需要添加上报 */
    if (!cards || cards.length === 0) {
      const key = `getFeedsTabLists-${refreshType === RefreshType.LOAD_MORE ? 'LOAD_MORE' : 'REFRESH'}`;
      addKeylink(key, KeylinkCmd.RPC_EMPTYDATA_SUM);
      return;
    }
    /** 检查无限流卡片内容 */
    const index = refreshType === RefreshType.LOAD_MORE ? 0 : cards.length - 1;
    const bookIds = FeedsUtils.getSafeProps(cards[index], 'parsedObject.vDetailData.value', []).map(book => book.sBookId);
    this.recommBookChecker.checkBookIds(bookIds);
  };

  /**
   * 处理列表
   * @param {any[]} items 列表数据
   * @param _orientation 没有用了
   * @param {boolean} refresh 刷新(true) or 追加(false)
   * @param {UpdateFlag} flag 特殊处理
   * @param {any[]} deleteCacheList
   * @param {number} [refreshType] 刷新类型
   * @param {Object} freshInfo 刷新信息
   * @returns {Promise.<*>} holder列表
   * @private
   */
  public _handleItems = async (
    items,
    _orientation?: any,
    refresh = true,
    flag = new UpdateFlag(),
    deleteCacheList = [],
    refreshType?: any,
    freshInfo = {},
  ) => {
    const self = this;
    if (items === null) {
      return null;
    }
    /** @type {FeedsItemDataHolder[]} */
    addKeylink('_handleItems() start', TAG);
    const dataHolders: any[] = [];
    try {
      items.forEach((item) => {
        const holder = new FeedsItemDataHolder();
        let { ui_style } = item;
        const grayInfo = item.grayInfo || {};
        if (grayInfo.ui?.[ui_style]) {
          ui_style = 20000 + parseInt(grayInfo.ui[ui_style], 10);
        }
        holder.mItemViewType = ui_style;
        item.ui_style = ui_style;
        item.freshInfo = freshInfo;
        if (typeof item.refreshType === 'undefined') {
          item.refreshType = refreshType || 1;
        }
        holder.mData = item;
        item.symbolKey = self.symbolKey;
        dataHolders.push(holder);
      });

      const noMoreData = false;
      const vDeleteIndexList: any[] = [];
      // 刷新
      if (refresh) {
        if (flag.clearHistory && items.length) {
          self.mDataHolders.splice(0, self.mDataHolders.length);
        }
        // deleteCacheList
        if (deleteCacheList.length > 0 && self.mDataHolders.length > 0) {
          // const vDeleteIndexList = [];
          self.mDataHolders.forEach((item, index) => {
            deleteCacheList.forEach((itemId) => {
              if (item.mData.item_id === itemId) {
                vDeleteIndexList.push(index);
              }
            });
          });
        }
        // rice增加条件items.length > 1，如果后台未下发数据，那么不进行处理
        if (flag.clearTop && self.mDataHolders.length > 1 && items.length > 1) {
          const topHolder = self.mDataHolders[0];
          const topItem = topHolder.mData;
          if (topItem !== null && topItem.orderType === FeedsItemExtBean.OrderType.Top) {
            clearTopUI(topHolder, self.mDataHolders, 0);
          }
        }

        // 先过滤置顶feeds，避免中间重复出现置顶的feeds
        if (self.mDataHolders.length) {
          let spliceNum = 0;

          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < self.mDataHolders.length; i += 1) {
            if (self.mDataHolders[i].mData.orderType !== FeedsItemExtBean.OrderType.Top) {
              break;
            }
            spliceNum += 1;
          }

          self.mDataHolders.splice(0, spliceNum);
        }

        if (self.mStoreNumber > 0 && self.mDataHolders.length > self.mStoreNumber) {
          self.mDataHolders.splice(self.mStoreNumber, self.mDataHolders.length - self.mStoreNumber);
        }
      }
      // 对数据进行预处理
      if (!noMoreData) {
        // 如果删除了数据，要重新计算分割线
        let separateArr = dataHolders;
        if (vDeleteIndexList.length > 0) {
          separateArr = self.mDataHolders;
        }
        filterBottomLine(separateArr);
        fillItemsHeight(dataHolders);
      }

      if (refresh) {
        // 这里做分割线的修正, 最后一个是"上次看到这里，点击刷新"，下一个item不需要分割线
        const insertIndex = 0;
        Array.prototype.splice.apply(self.mDataHolders, [insertIndex, 0].concat(dataHolders) as any);
        if (insertIndex) {
          filterBottomLine(self.mDataHolders); // 改变了顺序 需要重新处理分割线
        }
      } else {
        Array.prototype.splice.apply(
          self.mDataHolders,
          [self.mDataHolders.length, 0].concat(dataHolders) as any,
        );
      }
    } catch (error) {
      logError(error, 'FeedsPageViewModel.handleItems');
    }
    return self.mDataHolders;
  };

  // 返回feeds时刷新
  public backToFeedsRefresh = async (timespan, refreshTime) => {
    try {
      let { leaveTime } = this.parentView.globalConf;
      if (typeof leaveTime === 'undefined') {
        // 首次启动的时候 从缓存中取时间
        leaveTime = +await AsyncStorage.getItem(`${MODULE}:leaveTime`) || 0;
        addKeylink('backToFeedsRefresh() leaveType end', TAG);
        this.parentView.globalConf.leaveTime = leaveTime;
      }
      // QBToastModule.show(`backToFeedsRefresh${this.parentView.parent.state.firstInit ?
      //   'init|' : '|3'}${leaveTime}`, '', 2000);
      if (!(leaveTime > 0)) return null;
      let timeDiff = +new Date() - leaveTime;
      if (timespan < timeDiff) timeDiff = timespan;// 兜底一下  如果刷新时间更短用刷新时间

      const { leftTimeRefreshA: testA, leftTimeRefreshC: testC } = FeedsUtils.getSafeProps(this, 'mSetting.mExtInfo.value') || {};
      // QBToastModule.show(`${!testA && !testC ? 'no test' : testA ? 'TEST A' : 'TEST C'}`, '', 3000);
      if (!testA && !testC) return null;
      if (timeDiff > refreshTime) {
        // if (timeDiff > 5 * 1000) {

        // 实验A： 进入feeds置顶态，提示刷新条
        if (testA) {
          return FeedsPageViewModel.AutoRefreshType.Tips;
        }
        if (testC) {
          // 实验C: 直接进入feeds置顶态，且自动刷新
          return FeedsPageViewModel.AutoRefreshType.Normal;
        }
      } else { // 小于
        if (timeDiff > 10 * MINUTE) {
          return FeedsPageViewModel.AutoRefreshType.Tips;
        }
      }
      return null;
    } catch (error) {
      logError(error, 'FeedsPageViewModel.backToFeedsRefresh');
    }
  };

  public getRefrehTypeByTime = (earlyTime, refreshTime, subType) => {
    let refreshType = 0;
    if (earlyTime > refreshTime) {
      // 如果大于1小时
      if (
        subType
        && (subType === FeedsEventHub.activeSubType.startup
          || subType === FeedsEventHub.activeSubType.tab)
      ) {
        // 如果启动和切换tab刷新
        refreshType = FeedsPageViewModel.AutoRefreshType.Normal;
      } else {
        // 其他情况, 例如正文页返回
        refreshType = FeedsPageViewModel.AutoRefreshType.Tips;
      }
    } else {
      refreshType = FeedsPageViewModel.AutoRefreshType.None;
    }
    return refreshType;
  };

  public getRefreshType = async (subType = '', updateMode = '1', isColdStart) => {
    /**
     * updateMode:
     * adr: "1"表示wifi以及移动网络下更新 "2"表示仅wifi下更新；
     * ios: "0"表示wifi以及移动网络下更新 "1"表示仅wifi下更新；
     */

    const self = this;

    if (self.mDataHolders.length === 0) {
      return FeedsPageViewModel.AutoRefreshType.Normal;
    }
    try {
      if (self.mSetting === null) {
        self.mSetting = await self.mRepository.loadSetting();
      }

      const cur = new Date();
      const now = cur.getTime();
      const lastUpdateTime = self.mSetting?.updatedTime;
      const timespan = now - lastUpdateTime;

      let refreshType = FeedsPageViewModel.AutoRefreshType.None;

      const serverRefreshTime = parseInt(self.mTabBean.iAutoRefreshTime, 10);
      const refreshTime = serverRefreshTime > 0 ? serverRefreshTime * MINUTE : AUTO_REFRESH_DURATION; // 取不到默认是60分钟
      refreshType = this.getRefrehTypeByTime(timespan, refreshTime, subType);
      addKeylink('getRefreshType() invoke backToFeedsRefresh', TAG);
      const leaveType = await this.backToFeedsRefresh(timespan, refreshTime);
      // QBToastModule.show('leaveType'+leaveType, '', 3000)
      if (leaveType) {
        refreshType = leaveType;
      }


      const isChangedDay = now - lastUpdateTime >= DAY;
      if (isChangedDay) {
        // 换天自动刷新
        refreshType = FeedsPageViewModel.AutoRefreshType.Normal;
      }

      // 仅wifi更新, iOS的updateMode是1
      if (
        ((Platform.OS === 'android' && updateMode === UpdateModeType.WIFI)
          || (Platform.OS === 'ios' && updateMode === '1'))
        && refreshType === FeedsPageViewModel.AutoRefreshType.Normal
      ) {
        // 检查非wifi下提示刷新
        if (NetworkState.currentNetWork === NetworkState.NetworkTypes.NONE) {
          await NetworkState.getNewState();
        }

        if (NetworkState.currentNetType !== NetworkState.NetworkTypes.WIFI) {
          refreshType = FeedsPageViewModel.AutoRefreshType.Tips;
        }
      }

      if (
        isColdStart
        && refreshType !== FeedsPageViewModel.AutoRefreshType.Normal
        && self.parentView
        && self.parentView.globalConf.multiCacheAndTopValue
      ) {
        refreshType = FeedsPageViewModel.AutoRefreshType.Tips;
      }
      if (global.shouldTabRefreshDirect) {
        refreshType = FeedsPageViewModel.AutoRefreshType.Normal;
        global.shouldTabRefreshDirect = false; // 设置一次就够了
      }
      return refreshType;
    } catch (error) {
      logError(error, 'FeedsPageViewModel.getRefreshType');
    }
  };

  public hideItemInListById = (itemId) => {
    let holder;
    let removed = false;
    let index = -1;
    let removeIndex = -1;
    for (let i = 0; i < this.mDataHolders.length; i += 1) {
      index = i;
      holder = this.mDataHolders[i];
      if (holder.mData.item_id === itemId) {
        removeIndex = i;
        // this.mDataHolders[i].isDeleted = true;
        // 防止删除一个item之后 后面的item分割线样式有问题
        this.resetBottomLine(this.mDataHolders[i - 1], this.mDataHolders[i + 1]);
        removed = true;
        break;
      }
    }
    if (removeIndex !== -1) {
      this.mDataHolders.splice(removeIndex, 1);
    }
    if (removed) {
      const self = this;
      if (index < self.mRepository.storeCount) {
        const count = Math.min(self.mRepository.storeCount, self.mDataHolders.length);
        const items = self.mDataHolders
          .slice(0, count)
          .filter(p => !p.isDeleted)
          .map(p => p.mData);
        self.mRepository.saveItems(items, true);
      }
    }
    return removed;
  };

  public hideItemInList = (itemBean) => {
    let holder;
    let removed = false;
    let index = -1;
    let removeIndex = -1;
    for (let i = 0; i < this.mDataHolders.length; i += 1) {
      index = i;
      holder = this.mDataHolders[i];
      if (holder.mData === itemBean) {
        switch (itemBean.groupType) {
          case FeedsItemExtBean.GroupType.Parent: {
            const count = itemBean.parsedObject.subBeanList.length;
            for (let j = 0; j <= count + 1; j += 1) {
              // this.mDataHolders[i + j].isDeleted = true;
              removeIndex = i + j;
            }
            removed = true;
            break;
          }
          case FeedsItemExtBean.GroupType.Child: // 子项目不支持负反馈
            return false;
          default:
            removeIndex = i;
            // this.mDataHolders[i].isDeleted = true;
            // 防止删除一个item之后 后面的item分割线样式有问题
            if (this.mDataHolders[i - 1] && this.mDataHolders[i + 1]) {
              this.resetBottomLine(this.mDataHolders[i - 1], this.mDataHolders[i + 1]);
            }
            removed = true;
            break;
        }
      }
      if (removed) {
        break;
      }
    }
    if (removeIndex !== -1) {
      this.mDataHolders.splice(removeIndex, 1);
    }
    if (removed) {
      const self = this;
      if (index < self.mRepository.storeCount) {
        const count = Math.min(self.mRepository.storeCount, self.mDataHolders.length);
        const items = self.mDataHolders
          .slice(0, count)
          .filter(p => !p.isDeleted)
          .map(p => p.mData);
        self.mRepository.saveItems(items, true);
      }
    }
    return removed;
  };

  public resetBottomLine = (_preItem, currentItem) => {
    currentItem.mData.bottomLineStyle = 0;
  };

  public changeVoteItem = (itemId) => {
    this.mDataHolders.forEach((item) => {
      if (
        item?.mData
        && item.mData.tab_id === 1
        && item.mData.parsedObject
        && item.mData.item_id === itemId
      ) {
        const { parsedObject } = item.mData;
        parsedObject.vote = true;
      }
    });
  };

  public clearData = () => {
    this.mSetting = new FeedsSetting(); // 清空缓存和刷数
    this.mWatchInfo = null;
    this.mDataHolders.splice(0, this.mDataHolders.length);
    this.mRepository.clear();
  };

  // eslint-disable-next-line class-methods-use-this
  public preParse = (items, clearOldData = true) => {
    let item;
    for (let i = items.length - 1; i >= 0; i -= 1) {
      item = items[i];
      try {
        FeedsDataManager.preParseBeanData(item, clearOldData);
      } catch (err) {
        items.splice(i, 1);
        logError(err, 'FeedsPageViewModel.preParse');
      }
    }
  };

  // 置顶数量+加载更多的数量
  public getTopItemLength = () => {
    let topAndRreshNum = 0;
    topAndRreshNum = this.mDataHolders.filter(item => item.mData.orderType === 1 || item.mData.ui_style <= 0).length;
    this.topAndRreshNum = topAndRreshNum;
    return topAndRreshNum;
  };
}

