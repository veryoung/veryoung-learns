/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import {
  NetInfo,
  Platform,
  View,
  QBListView,
  QBBrowserObserver,
  QBToastModule,
  QBDeviceModule,
  UIManagerModule,
  Text,
  PixelRatio,
  Modal,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import FeedsPageViewModel from './FeedsPageViewModel';
import FeedsDataManager from './FeedsDataManager';
import FeedsTheme from './FeedsTheme';
import FeedsEventEmitter from './FeedsEventEmitter';
import FeedsUtils from './FeedsUtils';
import FeedsEventHub from './FeedsEventHub';
import FeedsAbilities from './FeedsAbilities';
import FeedsConst, {
  SpecialStyle,
  FeedsUIStyle,
  dtConst,
  LOAD_DATA_TYPE,
  EXT_PARAMS_MAP,
  UI_428_KEY,
  NEW_USER_BOOK_EXPOSE__KEY,
  NEW_USER_CONTENT_EXPOSE__KEY,
  WEB_HOST,
  INFINITE_CARD_KEY,
  KNOWLEDGE_INFINITE_CARD_KEY,
  INFINITE_RECOM_PRE30_BOOK_IDS,
} from './FeedsConst';
import NetworkState from './NetworkState';
import ComponentRefresh from '../communication/ComponentRefresh';

import FeedsProtect from '../mixins/FeedsProtect';
import { ConstantUtils } from '../feeds-styles/common/utils';
import FeedsTraversal from '../communication/FeedsTraversal';
import { formatDate, getErrorMessage, isSupportNewPb } from './Utils';
import {
  reportBeacon,
  reportUDS,
  strictExposeReporter,
  TechKey,
  BusiKey,
  logError,
  addKeylink,
  KeylinkCmd,
} from '@/luckdog';
import { readSharedSettings, writeSharedSettings } from '../utils/shareSettings';
import doMergeBooks from './utils/doMergeBooks';
import { pickCardExposeTimeKey } from '../feeds-styles/tab-22/FeedsViewUIStyle428';
import {
  getBundleTabId,
  setFSRendered,
  getFSDataRetry,
  canFSDataRetry,
  isFSRendered,
  getTabpageBackgroundManager,
} from '@/presenters';
import { getReaderVersion, getSearchParams, getUserVisitor, isTopTab, removeUserQbid, throttle } from '@/luckbox';
import { showLoginPanel, checkLogin } from './utils/user';
import ScrollHelper, { RefreshType } from './lib/ScrollHelper';
import { resetReportInfoByTabID } from '../utils/preFetchCard';
import { CommonProps, SkinModelType, TabId } from '../entity';
import { updateCacheBooks, deleteCacheBooks } from '../utils/bookCache';
import { FeedAppID, RequestType } from './protocol/response';
import { requestTabListData, updateTabPageNum, UpdatePageNumScene } from '../service';
import { getCardView } from './cards/card';
import FeedsItemRepository from '../repository/FeedsItemRepository';
import { emitter, events } from '../utils/emitter';
import { vectorToArray } from '../feeds-styles/tab-22/components/utils';
import { WelfarePendantShowType } from '@/presenters/welfare-floating-controller';

const { NetworkTypes } = NetworkState;
const INITIAL_PICK_EXPOSED_TIME = 0;
const TAG = 'FeedsPageView';

// 通知滚动事件ui列表
const UI_SCROLL = [1, 11, 79, 101, 116, 506, 507, 511, 512, 1101, 1102, 1103, 519, 1401, 518];
const LoadState = {
  None: 0, //
  LoadMoreDoing: 1, // 正在拉取更多
  LoadMoreFinish: 2, // 拉取完成 但是在缓存里面没消费
  RefreshDoing: 3, // 正在刷新
  // RefreshPending: 4,
  LoadLocalDoing: 5, // 正在读缓存
};
/** 旧协议推荐tab无限流卡id */
const OldProtocolInfiniteStyleId = 427;
/** 上报无限流上报最新书籍id条数 */
const LoadMoreRecomBookCount = 30;

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    flex: 1,
  },
  listView: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: ConstantUtils.getScreenWidth(),
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomItem: {
    flex: 1,
    height: 50,
    lineHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomItemText: {
    fontSize: FeedsUIStyle.T3,
    colors: FeedsTheme.SkinColor.N1,
  },
  confirmWrap: {
    marginTop: 320,
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    width: 292,
    height: 170,
    borderRadius: 3,
    flexDirection: 'column',
  },
  confirmTipWrap: {
    flex: 1,
    width: 292,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTip: {
    fontSize: FeedsUIStyle.T4,
    colors: FeedsTheme.SkinColor.N1,
  },
  confirmBtnWrap: {
    height: 50,
    width: 292,
    flexDirection: 'row',
  },
  confirmBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1 / PixelRatio.get(),
    borderColors: ['#EDEDED'],
  },
  confirmBtnText: {
    fontSize: FeedsUIStyle.T3_6,
    colors: FeedsTheme.SkinColor.N1,
  },
});

let IDENTITY = 1;

const genKey = function genKey(tabid) {
  IDENTITY += 1;
  return { key: tabid, genKey: IDENTITY };
};

interface Props extends CommonProps {
  tabId: number;
  qbId: string;
  curTabId: number;
  primaryKey: string;
  isNeedPreLoad: boolean;
  isTabChange: boolean;
  refreshNum: number;
  tabBean: any;
  updateMode?: string;
  customTabs?: any;
  extParam?: string;
  hideBottomBanner: () => void;
  onTabPropsChange?: (...args) => void;
}

interface State {
  dataSource: any;
  skinMode: number;
  enableLoadingFooter: boolean;
  scrollEnabled: boolean;
  isEdit: boolean;
  bPageEnd: boolean;
  deleteModal: boolean;
  deleteCancel: boolean;
  hasRenderFromCache: boolean;
}

@FeedsProtect.protect
export default class FeedsPageView extends Component<Props, State> {
  public mIsRefreshRequesting = false; // 是否正在请求数据中，尚未获得结果
  public mIsLoadMoreRequesting = false; // 是否正在请求数据中，尚未获得结果
  public mLastRequestTime = 0;
  public mLoadState = LoadState.None;
  public mTabId = this.props.tabId;
  public parent = this.props.parent;
  public mIsActive = this.props.tabId === this.props.curTabId; // 是否可见
  public deactiveTime = -1; // 首屏切出时间
  public forceRefresh = false;
  public useReport = false;
  public jsExceuse = false;
  public symbolKey = genKey(this.props.tabId); // list唯一键 防止多窗口多个list
  public activeCount = 0; // onAcitve触发的次数
  public isColdStart = true; // 默认是true, 由onActive来扭转状态
  public autoRefresh = false; // 自动刷新的识别字段，对所有tab有效，1. 每隔60（50）分钟冷启动/页面激活会自动刷新 2.onloadurl方式刷新 3.清掉缓存后刷新
  public lastExposureItems = new Set<any>(); // 最近一次真实曝光的item
  public exposureList = new Set(); // 曝光队列
  public dataEnd = false; // 数据是否还有更多
  public longExposureList = new Set<any>(); // 真实曝光队列
  public planAExposureCheckTime = -1; // 对齐看点，曝光检测时间
  public planBExposureCheckTime = -1; // 对齐快报，曝光检测时间
  public initItemCount = 0;
  public autoRefreshTimes = 0; // 新安装用户刷新计数使用
  public onDeactiveTime = 0;
  public startEdgePos = 0;
  public measureInWindow = 0;
  public firstVisibleRowIndex = 0;
  public lastVisibleRowIndex = 0;
  public refreshCallbackCompleted = false;
  public refreshAnimationStart = 0;
  public feedsListPageViewRefs: any[] = [];
  public isLoadMoreDataEnabled = false;
  public isOnloadUrlRefresh = false;
  public mContainerHeight = 0;
  public initialListSize = 0;
  // 用户当前的位置
  public scrollCurrentPos = -1;
  // 当前已经曝光过的最大卡片索引
  public scrollCurrentMaxIndex = -1;
  public noTopDataFlag = {
    isReloadBtnClick: false,
    isAutoRefresh: false,
  };
  public mTabBean = this.props.tabBean;
  public updateMode = this.props.updateMode || '1';
  public globalConf = this.props.globalConf;
  public isFirstScroll = true;
  public isSupportNewPb = isSupportNewPb(this.mTabId);
  public mRepository = new FeedsItemRepository(
    isTopTab() ? FeedAppID.TOP : FeedAppID.BOTTOM,
    this.mTabId,
    this.isSupportNewPb,
  );
  public mViewModel: any = new FeedsPageViewModel(this.mTabId, this.mTabBean, this.symbolKey, this);
  public hasRendered = false;
  public accountListener: any;
  public skinListener: any;
  public netInfoListener: any;
  public novelScreenExposed: any = {};
  public lastKingCardStatus: any;
  public astNetInfoReach: any;
  public _detectCount;
  public _detectId: any;
  public doReportOnCacheLoadedTimer;
  public containWindowHeight: any;
  public scrollState: any;
  public endEdgePos: any;
  public interestLoading;
  public onEndReachedAniStart;
  public isFooterAppeared;
  public pendingResult: any;
  public hasFollowed: any;
  /** 是否第一次来书架 */
  public isFirstTimeInBookShelf = true;
  public lastNetInfoReach: any;

  public refs!: {
    feedsList: any;
  };
  public NOVEL_422_SELECTED: any;
  public NOVEL_422_ITEMBEAN: any;
  public isEdit;
  public gotToFloat;
  public hasScroll;
  public initScrollIndexNumber;
  public isActive;
  public callOnScrollTimer;
  public welfarePendantTimer: any;

  public constructor(props) {
    super(props);

    if (this.props.customTabs) {
      const { customTabs } = this.props;
      this.mViewModel.setExtParams('USER_SELECT_TAB', customTabs);
    }

    if (this.props.extParam) {
      try {
        const extParams = JSON.parse(this.props.extParam);
        Object.keys(extParams).forEach((key) => {
          if ({}.hasOwnProperty.call(extParams, key)) {
            if (key === 'WIFI_SCENES_INFO') {
              const opt = FeedsEventHub.getOpt();
              opt.channel = '007701';
              this.forceRefresh = true;
            }
            this.mViewModel.setExtParams(key, extParams[key]);
          }
        });
      } catch (e) {
        logError(e, 'FeedsPageView.initExtParam');
      }
    }

    this.state = {
      dataSource: this.mViewModel.mDataHolders,
      skinMode: FeedsTheme.skinMode,
      enableLoadingFooter: true,
      scrollEnabled: true, // feeds是否支持上下滚动，默认为true
      isEdit: false,
      bPageEnd: false, // 数据是否加载完成
      deleteModal: false, // 是否展示删除框
      deleteCancel: false, // 是否是取消框
      hasRenderFromCache: false, // 是否已经经过loadcache渲染
    };
    this.accountListener = QBBrowserObserver.addListener('accountChanged', this._onAccountChanged);
    this.skinListener = QBBrowserObserver.addListener('skinChanged', this._onSkinChanged);
    this.netInfoListener = NetInfo.addEventListener('change', this._onNetInfoChanged);
    emitter.on(events.UPDATE_PAGEVIEW_DATASOURCE, this.updateLocalDataSouce);
    FeedsEventEmitter.addListDelegate(this.symbolKey, this.onEventToList);
    if (!this.jsExceuse) {
      this.jsExceuse = true;
    }
  }

  public UNSAFE_componentWillMount() {
    addKeylink(`WillMount, tabId=${this.mTabId}`, TAG);
    // 设置是否冷启动
    FeedsConst.setGlobalConfKV('loadDataType', LOAD_DATA_TYPE.NULL);
    this.loadCache(true);
  }

  // 注意，这个回调是在收到新props时才会触发。而在初始化渲染的时候不会自动触发。
  public UNSAFE_componentWillReceiveProps(nextProps) {
    // 页面进入、离开事件
    if (nextProps.type && nextProps.type !== '') {
      this._onlifecycleChanged(nextProps);
    }
    this.isFirstScroll = true;
  }

  // 要被摧毁了，移除QBDeviceEventEmitter
  public componentWillUnmount() {
    if (this.skinListener) {
      QBBrowserObserver.removeListener('skinChanged', this.skinListener);
    }

    if (this.accountListener) {
      QBBrowserObserver.removeListener('accountChanged', this.accountListener);
    }
    if (this.netInfoListener) {
      NetInfo.removeEventListener('change', this.netInfoListener);
    }

    FeedsEventEmitter.removeListDelegate(this.symbolKey);

    emitter.off(events.UPDATE_PAGEVIEW_DATASOURCE, this.updateLocalDataSouce);
  }

  public _onSkinChanged = (args) => {
    FeedsTheme.changeSkinMode(args.state);
    this.setState({ skinMode: args.state });
  };

  public _onAccountChanged = (args) => {
    if (args) {
      // 更新用户登录状态及登录信息
      if (args.type === 0) {
        this.globalConf.qbid = null;
        this._refreshData();
      } else {
        this.globalConf.qbid = args.qbid;
      }
    }
  };

  // 刷新相关tab数据
  public _refreshData = () => {
    const { dataSource } = this.state;
    this.setState({
      dataSource,
      enableLoadingFooter: this.isFooterEnable(dataSource),
    });
  };

  public _onNetInfoChanged = async (reachObj) => {
    try {
      const reach = reachObj.network_info || 'NONE';
      this.lastKingCardStatus = this.globalConf.isKingCardUser;
      if (this.lastNetInfoReach !== reach) {
        // 网络状态变化
        this.globalConf.NetInfoReach = reach;
        this.globalConf.deviceInfo = await QBDeviceModule.getDeviceInfo();
        if (reach === 'MOBILE' || reach === 'CELL' || reach === 'NONE') {
          this._detectCount = 0;
          this.detectKingCard();
        } else {
          if (this._detectId) {
            clearTimeout(this._detectId);
            this._detectId = null;
          }
          this.globalConf.isKingCardUser = false;
          this.forceUpdate();
        }
      }
      NetworkState.updateStateByReach(reach);
      if (reach !== 'NONE' && this.lastNetInfoReach === 'NONE') {
        this._checkRefresh();
      }
      this.lastNetInfoReach = reach;
    } catch (error) {
      logError(error, 'FeedsPageView._onNetInfoChanged');
    }
  };

  public detectKingCard = async () => {
    const detectCardAction = async () => {
      try {
        if (this._detectCount < 5) {
          this._detectCount += 1;
          this.globalConf.deviceInfo = await QBDeviceModule.getDeviceInfo();
          const devInfo = this.globalConf.deviceInfo;

          this.globalConf.isKingCardUser = devInfo.isKingCardUser || false;
          if (!this.globalConf.isKingCardUser) {
            this.detectKingCard();
          } else if (this.lastKingCardStatus !== this.globalConf.isKingCardUser) {
            this.forceUpdate();
          }
        }
      } catch (error) {
        logError(error, 'FeedsPageView.detectKingCard');
      }
    };
    detectCardAction();
    this._detectId = setTimeout(() => detectCardAction(), 3000);
  };

  public notifyToUi(bundle) {
    if (Number(bundle.tabId) === this.mTabId) {
      const params = FeedsUtils.parseQueryString(bundle.url);
      FeedsEventEmitter.sendEventToItem(this.symbolKey, FeedsEventEmitter.event.onLoadUrl, {
        tabId: this.mTabId,
        ...params,
      });
    }
  }

  public async _optListener(bundle) {
    if (bundle) {
      this.notifyToUi(bundle);
      // 如果 bundle 中带有刷新参数的话
      if (bundle.refresh && !this.globalConf.preventRefresh4TopView) {
        this.autoRefresh = true;
        const propsTabId = getBundleTabId(this.props.tabId);
        if (Number(bundle.tabId) === propsTabId || Number(bundle.tab_id) === propsTabId) {
          if ([TabId.BOTTOM_RECOMM2].indexOf(propsTabId) >= 0 && ['onLoadUrl', 'onTabRefresh'].indexOf(bundle.type) >= 0) {
            ComponentRefresh.push(bundle); // 此处不立即刷新，等收到tab激活(返回)再刷新
            return;
          }
          this.isOnloadUrlRefresh = true;
        }
      }
    }
  }

  public _onlifecycleChanged = async (bundle: Record<string, any>): Promise<void> => {
    if (!bundle) return;

    switch (bundle.type) {
      case FeedsEventHub.lifecycle.active: {
        this.mIsActive = true;
        const subType = bundle.subType || FeedsEventHub.activeSubType.homepage;
        let refreshType;
        this._onActive(subType);
        this.globalConf.subType = bundle.subType || '';
        FeedsEventEmitter.sendEventToItem(this.symbolKey, FeedsEventEmitter.event.lifecycle, {
          lifecycleType: FeedsEventEmitter.lifecycle.active,
          subType: bundle.subType,
          refreshType,
          pageView: this,
        });
        this.updateCacheBooks();

        // 移除sharedSettings中的qbid
        removeUserQbid();

        // 非书架tab或者首屏没渲染完不用触发合并书架操作
        if (![TabId.BOTTOM_RECOMM2, TabId.SHELF].includes(this.mTabId) || !isFSRendered()) return;

        try {
          // 检查登录态的变更
          const { qbid } = await getUserVisitor().isUserReady();
          addKeylink(`获取qbid: ${qbid}，用于书籍合并操作`, TAG);
          if (!qbid) return;

          // 如果登录不为空 才需要判断和上一次登陆态的变化
          doMergeBooks(this.globalConf, this.symbolKey, qbid);
        } catch (err) {
          logError(err, `${TAG}._onlifecycleChanged.active`);
        }
        return;
      }
      case FeedsEventHub.lifecycle.deactive:
        this.mIsActive = false;
        // 未渲染完成时切出，记录切出时间
        if (!isFSRendered()) {
          this.deactiveTime = Date.now() - global.enterTime;
        }
        FeedsEventEmitter.sendEventToItem(this.symbolKey, FeedsEventEmitter.event.lifecycle, {
          lifecycleType: FeedsEventEmitter.lifecycle.deactive,
          subType: bundle.subType,
          backToFloat: !this.gotToFloat,
        });
        this._onDeactive(bundle);
        return;
      case FeedsEventHub.lifecycle.clearcache:
        this._onClearCache();
        return;
      case FeedsEventHub.lifecycle.redPointShow:
        this.forceRefresh = true;
        return;
      case FeedsEventHub.lifecycle.reload:
        if (this.refs.feedsList) {
          const qblistviewRefreshType = this.globalConf.isKingCardUser ? 3 : 1;
          // 标注刷新类型
          ScrollHelper.refreshType = RefreshType.ICON_CLICK;
          this.refs.feedsList.startRefresh(qblistviewRefreshType);
        }
        return;
      case FeedsEventHub.lifecycle.onToPage:
        FeedsEventEmitter.sendEventToItem(this.symbolKey, FeedsEventEmitter.event.toPage, {
          lifecycleType: FeedsEventEmitter.lifecycle.toPage,
          bundle,
        });
        return;
    }
  };

  public onEventToList = (event, obj) => {
    switch (event) {
      case FeedsEventEmitter.event.refresh:
        this.refresh();
        break;
      case FeedsEventEmitter.event.spreadmore:
      case FeedsEventEmitter.event.switchtabs:
      case FeedsEventEmitter.event.gotToFloat:
        this._onHandleEvent(event, obj);
        break;
      case FeedsEventEmitter.event.tabProps:
        this.props.onTabPropsChange?.(Object.assign(obj, { tabId: this.mTabId }));
        break;
      case FeedsEventEmitter.event.clearCache:
        this._onClearCache();
        break;
      default:
    }
  };

  public _onCallOnScrollOnce = (timeout = 500) => {
    try {
      if (this.refs.feedsList?.callOnScroll) {
        const self = this;
        clearTimeout(this.callOnScrollTimer);
        this.callOnScrollTimer = setTimeout(() => {
          self.refs.feedsList?.callOnScroll();
        }, timeout);
      }
    } catch (e) {
      logError(e, 'FeedsPageView._onCallOnScrollOnce');
    }
  };

  public _onHandleEvent = (event, obj) => {
    if (obj.code && obj.code === -1) {
      QBToastModule.show('网络已断开，连接后重试', '', 2000);
      return;
    }
    if (obj.code && obj.code === -2) {
      QBToastModule.show('网络异常，请稍后重试', '', 2000);
      return;
    }
    if (event === FeedsEventEmitter.event.gotToFloat) {
      this.gotToFloat = true;
      return;
    }
  };

  /**
   * 页面激活
   * @private
   */
  public _onActive = async (activeSubType) => {
    if (activeSubType === 'startup' || activeSubType === 'homepage') {
      this.isFirstScroll = true;
    }
    if (this.mTabId === TabId.SHELF) {
      // 如果未登录用户进入书架页，尝试进行登录引导
      const { fullscreen_pop: fullScreenPop } = getSearchParams();
      if (!fullScreenPop || !this.isFirstTimeInBookShelf) {
        setTimeout(() => this.tryLoginGuide(), 500);
      }
      this.isFirstTimeInBookShelf = false;
      this.mViewModel.deleteExtParam('CUR_BOOK_ID');
      this.mViewModel.deleteExtParam('PAGE_NUM');
      this.props.globalConf.firstInBookshelf = true;
    }
    this.parent.reportTabShowChannel(this.mTabId);
    this.activeCount += 1;

    if (this.activeCount !== 1) {
      this.isColdStart = false;
    }

    try {
      this._checkRefresh(activeSubType);
    } catch (err) {
      logError(err, 'FeedsPageView._onActive');
    }

    if (!this.useReport) {
      this.useReport = true;
    }
  };

  public setMeasureInWindow = () => {
    if (this.measureInWindow !== 0) return;
    try {
      if (this.refs.feedsList) {
        UIManagerModule.measureInWindow(this.refs.feedsList, (r) => {
          if (!r || typeof r !== 'object') return;
          this.measureInWindow = r.y;
        });
      }
    } catch (error) {
      logError(error, 'FeedsPageView.setMeasureInWindow');
    }
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public checkStrictExpose = throttle((startEdgePos) => {
    strictExposeReporter.updateViewportRect({
      top: startEdgePos,
      left: 0,
    } as any);
  }, 500);

  // 滑动触发事件
  public onScroll = (event) => {
    const { startEdgePos = 0 } = event;
    this.startEdgePos = startEdgePos;
    this.checkStrictExpose(startEdgePos);
    this.setMeasureInWindow();
    if (!this.isFirstScroll) {
      this.cancleBottomShow(event); // 滑动隐藏运营栏
    } else {
      this.isFirstScroll = false;
    }
  };

  // 底部运营banner消失
  public cancleBottomShow = (event) => {
    const { startEdgePos = 0 } = event;
    const { hideBottomBanner = () => null } = this.props;
    // 如果用户滑动，则底部运营banner消失，此处兼容顶部提示框触发onScroll情况
    if (startEdgePos > 0) {
      hideBottomBanner();
    }
  };

  public getScrollInfo = (event) => {
    const firstIndex = event.firstVisibleRowIndex;
    const lastIndex = event.lastVisibleRowIndex;
    const { visibleRowFrames } = event;
    const { endEdgePos } = event;
    const { startEdgePos } = event;
    const dataHolders = this.state.dataSource;
    if (!visibleRowFrames || visibleRowFrames.length === 0) return;
    if (dataHolders) {
      for (let i = firstIndex; i < lastIndex + 1; i += 1) {
        const dataHolder = dataHolders[i];
        const visibleInfo = visibleRowFrames[i - firstIndex];
        if (visibleInfo && dataHolder && UI_SCROLL.indexOf(dataHolder.mItemRowType) > -1) {
          try {
            if (
              this.mViewModel.mFeedsItemView &&
              this.mViewModel.mFeedsItemView.size > 0 &&
              this.mViewModel.mFeedsItemView.get(`${this.mTabId}-${i}`) &&
              this.mViewModel.mFeedsItemView.get(`${this.mTabId}-${i}`).scrollAd
            ) {
              this.mViewModel.mFeedsItemView.get(`${this.mTabId}-${i}`).scrollAd(visibleInfo, endEdgePos, startEdgePos);
            }
          } catch (e) {
            logError(e, 'FeedsPageView.getScrollInfo');
          }
        }
      }
    }
  };

  /**
   * 重置滑动判断参数
   */
  public resetOnScrollParam = () => {
    this.hasScroll = false;
    // 初始化已经曝光的卡片数目
    this.initScrollIndexNumber = 0;
    // 滑动经过的卡片数目
    this.initScrollIndexNumber = 0;
  };

  /**
   * 页面非激活
   * @private
   */
  public _onDeactive = (bundle) => {
    this.onDeactiveTime = +new Date();
    // modal关闭
    this.gotToFloat = false;
    // FIXME: ios不会每次新建窗口触发handleLstTabDeactive  adr每次会触发handleLstTabDeactive 这里暂时这样处理
    if (bundle.primaryKey === this.parent.primaryKey) {
      this.isColdStart = false;
    }
  };

  public resize = () => {
    const { dataSource } = this.state;
    this.setState({
      dataSource,
      enableLoadingFooter: this.isFooterEnable(dataSource),
    });
  };

  public _onClearCache = () => {
    this.mViewModel.clearData();
    if (this.parent.db) {
      this.parent.db.clearCache();
    }
    if (this.globalConf?.style?.clearCache) {
      this.globalConf.style.clearCache();
    }
    const { dataSource } = this.state;
    this.setState({
      dataSource,
      enableLoadingFooter: this.isFooterEnable(dataSource),
    });
  };

  public handleOnStartRefresh = (evt) => {
    const { refreshFrom } = evt;
    // 上报刷新
    ScrollHelper.reportReload(refreshFrom, this.mTabId);
    addKeylink('handleOnStartRefresh() start', TAG);
    // 重置已曝光标记
    strictExposeReporter.resetExposeStatus();
    // 重置局部刷新上报信息
    resetReportInfoByTabID(String(this.mTabId));
    if (this.mTabId === TabId.SHELF) {
      if (this.props.parent?.getWelfareUserStatus) {
        this.props.parent.getWelfareUserStatus().then((res) => {
          if (res.ok && res.body) {
            const data = JSON.parse(res.body);
            let url = '';
            let time = 0;
            if (data.ret === 0) {
              const { URL = '', ReadTime = 0 } = data;
              url = URL;
              time = ReadTime;
            }
            FeedsConst.setGlobalConfKV('welfareTime', {
              url,
              time,
            });
            if (url !== '' && time !== 0) {
              reportUDS(BusiKey.EXPOSE__WELFARE_BUBBLE_TIME_ICON);
            }
          }
        });
      }
      // 每次刷新都更新一下缓存书籍
      this.mViewModel.deleteExtParam('CUR_BOOK_ID');
      this.mViewModel.deleteExtParam('PAGE_NUM');
    }
    let isSpecialRefresh = false;
    if (this.isOnloadUrlRefresh) {
      isSpecialRefresh = true;
      this.isOnloadUrlRefresh = false;
    }
    this.onStartRefresh(isSpecialRefresh);
  };

  public handleEdit = () => {
    const { isEdit } = this.state;
    this.isEdit = isEdit;
    this.setState({
      isEdit: !isEdit,
      deleteCancel: false,
    });
    const eventKey = isEdit ? BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_CANCEL : BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_BUTTON;
    reportUDS(eventKey, this.props);
  };

  /** 推书 */
  public pushNovelBook = () => {
    if (!this.NOVEL_422_SELECTED || this.NOVEL_422_SELECTED.length <= 0) {
      QBToastModule.show('请至少选择一本书', '', 2000);
      return;
    }
    const bids = this.NOVEL_422_SELECTED;
    const { tab_id: tabId } = this.NOVEL_422_ITEMBEAN;
    const url = `qb://ext/novel/store?url=${WEB_HOST}/discovery.html?bids=${bids.join('-')}&ch=001203&chainfrom=novelreadcollect&chainpage=mycollect#!/booklist`;
    FeedsUtils.doLoadUrl(url, tabId, false, this.NOVEL_422_ITEMBEAN);
    addKeylink(`选中书籍进行推书, bookIds = ${this.NOVEL_422_SELECTED.join(',')}`, TAG);
    reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_PUSH, this.props, { ext_data1: this.NOVEL_422_SELECTED.join(',') });
  };

  /** 删除小说书 */
  public deleteNovelBook = () => {
    const localBooks: any[] = [];
    const netBooks: any[] = [];
    this.NOVEL_422_SELECTED?.forEach((i) => {
      // 判断本地书逻辑
      if (isNaN(i)) {
        // 盗版转码资源id格式为p_xxxxx
        if (/^p_/.test(i)) {
          netBooks.push(i);
        } else {
          localBooks.push(i);
        }
      } else {
        netBooks.push(i);
      }
    });
    const obj = {
      func: 'DelBookshelf',
      book: netBooks,
    };
    const { tab_id: tabId } = this.NOVEL_422_ITEMBEAN;
    const netDelArray =
      netBooks.length > 0
        ? Promise.resolve(FeedsTraversal.traversal(tabId, 45, obj, this.globalConf))
        : Promise.resolve({ success: true });
    const delResult = FeedsAbilities.deleteNovelLocalBooks(localBooks);
    const localDelArray = localBooks.length > 0 ? Promise.resolve(delResult) : Promise.resolve(true);
    Promise.all([netDelArray, localDelArray]).then((res) => {
      if (res[0].success && res[1]) {
        QBToastModule.show('删除成功', '', 1500);
        // 删除缓存书籍
        deleteCacheBooks(netBooks);
        reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_DELETE, this.props, { ext_data1: this.NOVEL_422_SELECTED.join(',') });
        this.setState(
          {
            deleteModal: false,
            deleteCancel: false,
            isEdit: false,
          },
          () => {
            addKeylink(`删除成功, bookIds = ${this.NOVEL_422_SELECTED.join(',')}`, TAG);
            setTimeout(() => {
              this.refresh();
              this.NOVEL_422_SELECTED = [];
            }, 100);
          },
        );
      } else if (!res[0].success) {
        addKeylink('网络书籍删除失败', TAG);
        QBToastModule.show('网络错误,请稍后重试', '', 1500);
      } else if (!res[1]) {
        addKeylink('本地书籍删除失败', TAG);
        QBToastModule.show('本地书删除失败,请稍后重试', '', 1500);
      }
    });
    reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_DELETE, {}, { ext_data1: this.NOVEL_422_SELECTED.join(',') });
  };

  // 判断长按所选择的书籍中是否含有盗版书
  public hasPiraticBook = (books) => {
    let hasPirate = false;
    if (books && books.length >= 0) {
      books.forEach((bookId) => {
        if (bookId && bookId.length >= 2 && bookId.slice(0, 2) === 'p_') {
          hasPirate = true;
          return;
        }
      });
    }
    return hasPirate;
  };

  /** 添加藏书到我的藏书 */
  public addCollectBook = () => {
    if (!this.NOVEL_422_SELECTED || this.NOVEL_422_SELECTED.length <= 0) {
      QBToastModule.show('请至少选择一本书', '', 2000);
      return;
    }
    const obj = {
      func: 'MoveToCollect',
      book: this.NOVEL_422_SELECTED,
    };
    const { tab_id: tabId } = this.NOVEL_422_ITEMBEAN;
    FeedsTraversal.traversal(tabId, 45, obj, this.globalConf).then((res) => {
      const hasPirate = this.hasPiraticBook(this.NOVEL_422_SELECTED);
      if (res.success) {
        setTimeout(() => {
          this.refresh(); // 延迟100ms刷新，否则展示不出最新内容
          if (hasPirate) {
            QBToastModule.show('添加成功，网页暂不支持', '', 1500);
          } else {
            QBToastModule.show('添加成功', '', 1500);
          }
        }, 100);
        this.NOVEL_422_SELECTED = [];
      } else {
        if (hasPirate) {
          QBToastModule.show('网页暂不支持加入藏书', '', 1500);
        } else {
          QBToastModule.show('网络错误,请稍后重试', '', 1500);
        }
      }
    });
    addKeylink(`添加藏书到我的书架, bookIds = ${this.NOVEL_422_SELECTED.join(',')}`, TAG);
    reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_COLLECT, this.props, { ext_data1: this.NOVEL_422_SELECTED.join(',') });
  };

  public hide = () => {
    this.setState({
      deleteModal: false,
      deleteCancel: true,
    });
  };

  public showDeleteModal = () => {
    if (!this.NOVEL_422_SELECTED || this.NOVEL_422_SELECTED.length <= 0) {
      QBToastModule.show('请至少选择一本书', '', 2000);
      return;
    }
    this.setState({
      deleteModal: true,
      deleteCancel: false,
    });
  };

  public onContainerLayout = (event) => {
    const { width, height } = event.layout;
    strictExposeReporter.updateViewportRect({
      width,
      height,
    } as any);
  };

  public onScrollBeginDrag = (evt) => {
    const { contentOffset = {} } = evt;
    const { y = 0 } = contentOffset;
    this.scrollCurrentPos = y;

    // 福袋贴边
    this.welfarePendantTimer && clearTimeout(this.welfarePendantTimer);
    this.parent?.checkAndToggleWelfarePendant(WelfarePendantShowType.ASIDE);
  };

  public onMomentumScrollEnd = (evt) => {
    ScrollHelper.reportVerticalScroll(evt, this.mTabId);
  };

  public onScrollEndDrag = (evt) => {
    ScrollHelper.reportVerticalScroll(evt, this.mTabId);

    // 福袋展示
    this.welfarePendantTimer && clearTimeout(this.welfarePendantTimer);
    this.welfarePendantTimer = setTimeout(() => {
      this.parent?.checkAndToggleWelfarePendant(WelfarePendantShowType.SHOW);
    }, 500);
  };

  /** 是否对齐底部样式 */
  public useBottomStyle = () => {
    const { isBottomBg } = this.mViewModel.extInfo || {};
    return !isTopTab() || isBottomBg === '1';
  };

  public render() {
    const { isEdit, enableLoadingFooter, deleteModal, scrollEnabled, dataSource } = this.state;
    strictExposeReporter.updateDataSource(dataSource);
    const layoutDataList = dataSource || [];
    if (layoutDataList.length) {
      this.hasRendered = true;
    }
    const hackProps = Platform.OS === 'android' ? { scrollEnabled } : null;
    const CurrentPreloadItemNumber = this.mTabId === TabId.SHELF ? 1 : 2;
    let isEnableLoadingFooter = enableLoadingFooter;
    if (this.mTabId === TabId.SHELF && dataSource && dataSource.length > 0) {
      const dataHost = dataSource[0];
      if (!dataHost) return null;
      const { parsedObject = {} } = dataHost.mData;
      let data = [];
      if (parsedObject?.vDetailData) {
        data = vectorToArray(parsedObject.vDetailData);
      }
      const { length = 0 } = data;
      if (length < 12) isEnableLoadingFooter = false;
    }
    this.initialListSize = dataSource && dataSource.length > 4 ? 4 : dataSource.length;

    return (
      <View
        collapsable={false}
        style={[
          styles.container,
          this.useBottomStyle() ? getTabpageBackgroundManager().getTabPageBackgroundColors() : {
            backgroundColors: FeedsTheme.SkinColor.D5,
          },
        ]}
        onLayout={this.onContainerLayout}
        dt_pgid={dtConst.dt_pgid}
        dt_pg_params={FeedsUtils.getDtParams({
          channel_id: this.mTabId,
          rnVersion: this.globalConf.rnVersion,
        })}
      >
        <QBListView
          ref="feedsList"
          style={styles.listView}
          renderRow={this.renderRowItem}
          numberOfRows={layoutDataList.length}
          getRowType={this.getRowTypeNew}
          getRowHeight={0}
          getRowKey={this.getRowKey}
          onRefresh={this.handleOnStartRefresh} // 组件开始加载的时候，如果没有缓存，就会触发这个方法去拉取数据 by uct
          onExposureReport={this.doScrollForReport}
          onEndReached={this.loadMoreData}
          // 每隔多少ms执行onScroll回调，但是因为安卓的UI 507太占用资源了，所以间隔时间弄长了点才可以，iOS 设为60帧的效果
          scrollEventThrottle={Platform.OS === 'ios' ? 16 : 60}
          onScroll={event => this.onScroll(event)}
          onMomentumScrollEnd={this.onMomentumScrollEnd}
          onScrollBeginDrag={this.onScrollBeginDrag}
          onScrollEndDrag={this.onScrollEndDrag}
          seperatorStyle="None"
          onFooterAppeared={this.onFooterAppeared}
          enableLoadingFooter={isEnableLoadingFooter}
          initialListSize={10} // 指定在组件刚挂载的时候渲染多少行数据,首屏优化
          preloadItemNumber={CurrentPreloadItemNumber}
          {...hackProps}
        />
        {
          // 书架tab编辑栏
          isEdit ? (
            <View style={styles.bottomContainer} collapsable={false}>
              <View style={styles.bottomItem} onClick={this.addCollectBook}>
                <Text style={styles.bottomItemText}>加入藏书</Text>
              </View>
              <View style={styles.bottomItem} onClick={this.pushNovelBook}>
                <Text style={styles.bottomItemText}>推书</Text>
              </View>
              <View style={styles.bottomItem} onClick={this.showDeleteModal}>
                <Text
                  style={[
                    styles.bottomItemText,
                    {
                      colors: FeedsTheme.SkinColor.PRIZE_TEXT,
                    },
                  ]}
                >
                  删除
                </Text>
              </View>
            </View>
          ) : null
        }
        <Modal
          animationType="fade"
          visible={deleteModal}
          onRequestClose={this.hide}
          supportedOrientations={['portrait']}
          transparent
        >
          <View
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', backgroundColors: ['rgba(0,0,0,0.4)'] }}
          >
            <View style={styles.confirmWrap}>
              <View style={styles.confirmTipWrap}>
                <Text style={styles.confirmTip}>确定删除所选书籍？</Text>
              </View>
              <View style={styles.confirmBtnWrap}>
                <View
                  style={[
                    styles.confirmBtn,
                    {
                      borderRightWidth: 1 / PixelRatio.get(),
                      borderColors: ['#EDEDED'],
                    },
                  ]}
                  onClick={this.hide}
                >
                  <Text style={styles.confirmBtnText}>取消</Text>
                </View>
                <View style={styles.confirmBtn} onClick={this.deleteNovelBook}>
                  <Text
                    style={[
                      styles.confirmBtnText,
                      {
                        colors: ['#F44837'],
                      },
                    ]}
                  >
                    确认
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  public renderRowItem = (index) => {
    const { isEdit } = this.state;
    const dataHolders = this.state.dataSource;
    if (dataHolders.length - 1 === index) {
      // 所有item渲染完，作为【首屏内容渲染完成】
      if (!isFSRendered()) {
        this.reportContentFirstFrame();
      }
    }
    let rst;
    const data = dataHolders[index]; // layoutData应该是LayoutDataHolder
    // 书架tab不能静默返回 因为书架本身需要更新状态
    const isBookShelf = this.mTabId === TabId.SHELF;
    if (this.feedsListPageViewRefs[index] && !isBookShelf) {
      rst = this.feedsListPageViewRefs[index];
    } else {
      if (this.isSupportNewPb) {
        rst = this.createFeedsItemView(index);
      } else {
        rst = this.mViewModel.createFeedsItemView(
          data,
          this.isColdStart,
          this.mTabId,
          index,
          this.initItemCount,
          this,
          isEdit,
          dataHolders.length,
        ) || <View key={`feedsPageView_${this.mTabId}_${index}`} />;
      }
      this.feedsListPageViewRefs.push(rst);
    }
    return rst;
  };

  /** 分类别渲染卡片 */
  public createFeedsItemView = (index: number) => {
    const { dataSource } = this.state;
    const data = dataSource[index];
    if (data.cardKey) {
      const { uiType } = data;
      const { tabId } = this.props;
      const Card = getCardView(uiType);
      if (!Card) return <View />;
      return <View
        collapsable={false}
        onLayout={event => this.onCardContainerLayout(event, index)}
      >
        <Card
          key={`${tabId}_${index}`}
          index={index}
          globalConf={this.globalConf}
          totalLength={dataSource.length}
          curTabId={this.mTabId}
          data={data}
        />
      </View>;
    }
    return <View key={`feedsPageView_${this.mTabId}_${index}`} />;
  };

  /** 卡片容器生成后的响应 */
  public onCardContainerLayout = (event, index) => {
    strictExposeReporter.updateCardRect(index, event.layout);
  };

  public getRowKey = index => index;

  public getRowTypeNew = (index) => {
    const dataHolders = this.state.dataSource;
    if (dataHolders.length > index) {
      if (dataHolders[index].mItemRowType) {
        return dataHolders[index].mItemRowType;
      }
    }
    return 99999;
  };

  public _checkRequesting = () => {
    const now = Date.now();
    // 最近一次请求超过6秒时 => 非正在请求
    if (now - this.mLastRequestTime > 6000) {
      // 超时逻辑
      return false;
    }
    // 不在进行加载更多请求且不在刷新请求时 => 非正在请求
    if (!this.mIsLoadMoreRequesting && !this.mIsRefreshRequesting) {
      return false;
    }
    return true;
  };

  // 设置当前为主数据加载请求态
  // mLastRequestTime 当前请求态开始时间
  // refresh true: 标识为加载请求态为【新加载类型】mIsRefreshRequesting
  // refresh false: 标识加载请求态为【加载更多类型】mIsLoadMoreRequesting
  public _setRequesting = (refresh) => {
    this.mLastRequestTime = Date.now();
    if (refresh) {
      this.mIsRefreshRequesting = true;
    } else {
      this.mIsLoadMoreRequesting = true;
    }
  };

  // refresh标识清除哪种请求态
  public _clearRequesting = (refresh) => {
    if (refresh) {
      this.mIsRefreshRequesting = false;
    } else {
      this.mIsLoadMoreRequesting = false;
    }
  };

  public _getScrollTopIndex = (items: any[] = [], freshInfo) => {
    if (!this.globalConf.topAutoHide) {
      return 0;
    }
    if (this.mTabId !== 1) {
      return 0;
    }
    // 首刷不隐藏
    if (this.globalConf.top_hide_first_refresh !== 1 && freshInfo && freshInfo.freshCnt === 1) {
      return 0;
    }
    try {
      const topLength = items.filter(item => item.mData.orderType === 1).length;
      if (topLength) {
        let noTopIndex = 0;
        for (let i = 0, { length } = items; i < length; i += 1) {
          if (items[i].mData.orderType === 1) {
            break;
          }
          noTopIndex += 1;
        }
        return topLength + noTopIndex;
      }
    } catch (e) { /* nothing */ }
    return 0;
  };

  /** 内容首屏渲染完成相关上报 */
  public reportContentFirstFrame = () => {
    // 添加链路日志
    const timeCost = Date.now() - global.enterTime;
    addKeylink(`fs_render_time=${timeCost}`, KeylinkCmd.FS_COSTTIME_AVG);
    addKeylink(`首次内容渲染 timeCost=${timeCost} mIsActive=${this.mIsActive}`, TAG);
    setFSRendered();

    // 渲染超过10s并且用户以不在页面时取消首屏渲染时长上报，算作打开失败
    if (timeCost > 10000) {
      addKeylink('fs_render_time_than10s', KeylinkCmd.FS_COSTTIMESLOW_SUM);
      return;
    }
    // 首进加载如果不超过3秒，则取消超首进3秒上报
    if (global.timerOfDoBeaconByEnterOver3s) {
      clearTimeout(global.timerOfDoBeaconByEnterOver3s);
    }
    // 首屏加载耗时灯塔上报
    reportBeacon(
      TechKey.EXPOSE__FIRST_SCREEN_RENDER,
      { selectTabID: this.mTabId === TabId.BOTTOM_RECOMM2 ? TabId.BOTTOM_RECOMM1 : this.mTabId },
      {
        act_duration: timeCost, // 渲染耗时 time_consuming
        ext_data1: this.globalConf.pageActive ? '1' : '0', // 是否在激活状态，用户是否还停留在底tab频道 isActive
        ext_data2: this.deactiveTime, // 离开页面的时间 deactiveTime
        ext_data3: FeedsConst.getGlobalConfKV('loadDataType'), // 是否为冷启动 isColdStart
      },
    );
  };

  public onStartRefresh = (isSpecialRefresh) => {
    addKeylink('onStartRefresh() enter', TAG);
    this.novelScreenExposed = {}; // 清空屏幕曝光标记
    // 下拉刷新真实逻辑
    this.doStartRefresh(isSpecialRefresh);

    // 首屏接口失败重试
    addKeylink(`onStartRefresh(), canFSDataRetry:${canFSDataRetry()}, currentNetType: ${NetworkState.currentNetType}`, TAG);
    if (canFSDataRetry() && [NetworkTypes.WIFI, NetworkTypes.MOBILE].includes(NetworkState.currentNetType)) {
      addKeylink('onStartRefresh(), 首屏接口失败，开始重试', TAG);
      getFSDataRetry();
    }
  };

  /** 开始执行刷新 */
  public doStartRefresh = async (isSpecialRefresh) => {
    addKeylink('doStartRefresh() enter', TAG);
    try {
      this.mLoadState = LoadState.RefreshDoing;
      if (!this._checkRequesting() || isSpecialRefresh === true) {
        this._setRequesting(true);
        // 获取刷新数据
        const result = await this.getRefreshData('onRefresh', isSpecialRefresh);
        addKeylink(`doStartRefresh() end, success=${result?.success}`, TAG);
        if (result !== null) {
          this.feedsListPageViewRefs = [];
          await this.refreshCompleted(result.success, result.count, result.code, result);
        } else {
          await this.refreshCompleted(false, 0, 501);
        }
      } else {
        this.directCompleted(true, -3); // 兼容一下频繁请求,给一个提示
        this.mLoadState = LoadState.None;
      }
    } catch (error) {
      logError(error, 'FeedsPageView.doStartRefresh');
    }
  };

  public isFooterEnable = (dataSource, slideUp = true) => {
    if (dataSource) {
      let isFooterEnable = true;
      if (!slideUp) {
        isFooterEnable = false;
      } else if (dataSource.length > 0) {
        const dataHolder = dataSource[dataSource.length - 1];
        isFooterEnable = dataHolder.mItemViewType !== SpecialStyle.MoreEntrance;
      }
      return isFooterEnable;
    }
    return true;
  };

  // false -1 表示没有网络连接
  public refreshCompleted = (success, count, code = 0, result?: any) => {
    addKeylink('refreshCompleted, 拉到数据开始渲染', TAG);
    this.mLoadState = LoadState.None;
    this._clearRequesting(true);
    if (this.refs.feedsList) {
      if (success) {
        let message;
        const { refreshText = '', refreshIcon = '' } = result?.refreshObj || {};
        this.hasFollowed = false; // 重置0关注标志位
        if (refreshText && count) {
          message = '已更新为最新内容';
        } else if (count <= 0) {
          message = '没有更多数据';
        } else {
          message = '已更新为最新内容';
          if (this.interestLoading) {
            this.interestLoading = false;
          }
        }
        // 渲染
        if (result) {
          addKeylink('refreshCompleted setDataAfterRefresh 拉到数据开始渲染', TAG);
          this.setDataAfterRefresh(result);
        }
        this.refs.feedsList?.refreshCompletedWithFrontImage?.(this.getRefreshType({
          code: 0,
          message,
          refreshIcon,
        })); // 新的刷新提示
        // 通知终端进行了下拉刷新
        FeedsAbilities.notifyDownPullRefresh();
        emitter.emit(events.REFRESH_COMPLETE, this.mTabId);
      } else {
        this.directCompleted(true, code);
        // 通知终端进行了下拉刷新
        FeedsAbilities.notifyDownPullRefresh();
      }
    }

    if (Platform.OS === 'ios') {
      // 当顶部刷新时，为了解决iOS预加载的问题，对footer状态进行一次重置
      if (this.pendingResult && this.pendingResult.count > 0) {
        if (this.refs.feedsList) {
          this.refs.feedsList.endReachedCompleted(QBListView.QBListViewLoadingStatus.LOADING_STATUS_SUCCESS);
        }
      }
    }

    setTimeout(() => {
      this.parent?.updateInfo();
    }, 500);
    this.autoRefresh = false; // 初始化
  };

  public doScrollForReport = (arg) => {
    this._doScrollForReport(arg);
    // 设置已操作
    this.parent.setFeedsActiveInit('doScrollForReport');
  };

  // 加入真实曝光队列
  public addLongExposureToList = (data) => {
    this.longExposureList.add(data);
  };

  // 获取曝光队列
  public getExposureList = () => this.exposureList;

  // 获取真实曝光队列
  public getLongExposureList = () => this.longExposureList;

  // 清除曝光队列
  public clearExposureList = () => {
    this.exposureList.clear();
  };

  // 清除真实曝光队列
  public clearLongExposureList = () => {
    this.longExposureList.clear();
  };

  public loadCache = (isColdStart) => {
    this._doLoadCache(isColdStart);
  };

  public loadDataFromCache = async () => {
    try {
      let isRefreshForced = false;
      // 两次模式相同，才加载缓存，否则清空刷新
      let dataSource;
      if (this.isSupportNewPb) {
        const result = await this.mRepository.loadItemsAndSetting();
        dataSource = result.items || [];
      } else {
        dataSource = await this.mViewModel.loadCache();
      }
      if (dataSource?.length) {
        addKeylink(`loadDataFromCache(), 有缓存的渲染, hasRenderFromCache=${this.state.hasRenderFromCache}`, TAG);
        // 设置是否冷启动
        FeedsConst.setGlobalConfKV('loadDataType', LOAD_DATA_TYPE.FROM_CACHE);
        // 清空真实曝光的flag和真实曝光初始时间
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < dataSource.length; i += 1) {
          if (dataSource[i]?.mData?.longExposureStartTime) {
            dataSource[i].mData.longExposureStartTime = null;
            dataSource[i].mData.longExposureFlag = null;
          }
        }
        if (!this.state.hasRenderFromCache) {
          updateTabPageNum(this.mTabId, 2, UpdatePageNumScene.LOCAL);
          this.setState({
            dataSource,
            hasRenderFromCache: true,
            enableLoadingFooter: this.isFooterEnable(this.state.dataSource),
          });
        }
      } else {
        addKeylink('loadDataFromCache(), 无缓存的渲染', TAG);
        this.refreshSilent(this.mTabId);
        isRefreshForced = true;
      }
      this.mLoadState = LoadState.None;
      addKeylink('_doLoadCache 已经渲染了有数据,核对一下是否需要刷新', TAG);
      await this._checkRefresh(FeedsEventHub.activeSubType.startup, isRefreshForced);
      addKeylink('_checkRefresh() end', TAG);
    } catch (error) {
      logError(error, 'FeedsPageView.loadDataFromCache');
    }
  };

  public _doLoadCache = async (isColdStart) => {
    try {
      addKeylink(`_doLoadCache, isColdStart = ${isColdStart}`, TAG);
      if (isColdStart) {
        this.isLoadMoreDataEnabled = false;
      }
      if (this.state.dataSource.length === 0) {
        this.mLoadState = LoadState.LoadLocalDoing;
        await this.loadDataFromCache();
      }
    } catch (error) {
      logError(error, 'FeedsPageView._doLoadCache');
    }
  };

  /**
   * 缓存加载后调用
   */
  public doReportOnCacheLoaded = () => {
    clearTimeout(this.doReportOnCacheLoadedTimer);
    this.doReportOnCacheLoadedTimer = setTimeout(() => {
      if (this.mLoadState !== LoadState.RefreshDoing) {
        this._onCallOnScrollOnce(0);
      }
    }, 800);
  };

  public _checkRefresh = async (subType?: string, isRefreshForced = false) => {
    addKeylink(`_checkRefresh() start, mIsActive=${this.mIsActive}`, TAG);
    const self = this;
    if (self.mIsActive) {
      try {
        if (self.forceRefresh || isRefreshForced) {
          self.refresh();
          return;
        }
        addKeylink('_checkRefresh getRefreshType start', TAG);
        let refreshType = await self.mViewModel.getRefreshType(subType, self.updateMode, undefined);
        if (this.isSupportNewPb && this.state.dataSource.length > 0) {
          // 如果是新tab,并且已经有数据了，不用主动刷新
          refreshType = 0;
        }
        this._setSecondRefreshKey(refreshType); // 新用户刷新需求的Key值设
        // 冷启动或者页面激活，非自动刷新时，触发滑动统计首屏内容
        if (refreshType !== FeedsPageViewModel.AutoRefreshType.Normal) {
          this.doReportOnCacheLoaded();
        }
        switch (refreshType) {
          case FeedsPageViewModel.AutoRefreshType.None:
            if ((!this.hasRendered && this.state.dataSource.length) || this.mTabId === TabId.SHELF) {
              if (this.mTabId === TabId.SHELF) {
                // 书架的时候要切换成无感知,这里还是请求之前就先置顶吧 要不然渲染会有明显卡顿
                this.refs.feedsList?.scrollToContentOffset(0, 0, true);
                this.refreshSilent(TabId.SHELF);
              } else {
                this.forceUpdate();
              }
            }
            break;
          case FeedsPageViewModel.AutoRefreshType.Normal:
            self.refresh();
            break;
          default:
        }
      } catch (err) {
        logError(err, 'FeedsPageView._checkRefresh');
      }
    }
  };

  /**
   * 无感知刷新
   * @param type 需要刷新的tabID
   */
  public refreshSilent = async (type: number) => {
    // 清空索引
    let from = '';
    switch (type) {
      case TabId.SHELF: // 书架
        this.mViewModel.deleteExtParam('CUR_BOOK_ID');
        this.mViewModel.deleteExtParam('PAGE_NUM');
        from = 'bookshelf';
        this.props.globalConf.firstInBookshelf = true;
        break;
      case TabId.BOTTOM_RECOMM2: // 推荐
        from = 'recommend';
        break;
      default:
        break;
    }
    try {
      const result = await this.getRefreshData(from);
      // 渲染
      if (result?.success) {
        this.feedsListPageViewRefs = [];
        this.setDataAfterRefresh(result);
      }
      /**
       * 静默刷新的时候可能loadmore还在进行中
       * 默认静默成功刷新好就可以提示刷新完毕 不用等待所有loadmore数据准备好
       */
      this._clearRequesting(false);
    } catch (error) {
      logError(error, 'FeedsPageView.refreshSilent');
    }
  };

  // 刷新数据之前需要补充进req里的额外参数
  public setExtParamsBeforeRefresh = async () => {
    addKeylink('刷新数据之前需要补充进req里的额外参数', TAG);
    try {
      // 新用户退避策略
      const NEW_USER_CONTENT = this.mViewModel.getExtParam(NEW_USER_CONTENT_EXPOSE__KEY) || null;
      if (!NEW_USER_CONTENT) {
        const keys = FeedsConst.getGlobalConfKV(NEW_USER_CONTENT_EXPOSE__KEY)
          || (await readSharedSettings(NEW_USER_CONTENT_EXPOSE__KEY));
        if (keys) {
          const time = keys.firstTime ? Math.floor((new Date().getTime() - keys.firstTime) / 1000) : 0;
          if (time < 24 * 60 * 60) {
            let res = '';
            if (keys.repeatValue) {
              Object.keys(keys.repeatValue).forEach((i) => {
                if (keys.repeatValue[i] >= 3) {
                  res += `${i},`;
                }
              });
            }
            this.mViewModel.setExtParams(NEW_USER_CONTENT_EXPOSE__KEY, res);
          } else {
            FeedsConst.setGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY, null);
          }
        } else {
          FeedsConst.setGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY, null);
        }
      }
      // 判断是否使用ui428 pick角色/技能卡片 的退避策略
      let exposedTime = FeedsConst.getGlobalConfKV(pickCardExposeTimeKey);
      if (exposedTime === undefined) {
        exposedTime = (await readSharedSettings(pickCardExposeTimeKey)) || INITIAL_PICK_EXPOSED_TIME;
      }
      this.mViewModel.setExtParams(UI_428_KEY, String(exposedTime + 1));
      // 如果未曝光过设为0
      if (exposedTime === INITIAL_PICK_EXPOSED_TIME) {
        FeedsConst.setGlobalConfKV(pickCardExposeTimeKey, INITIAL_PICK_EXPOSED_TIME);
      }
      this.updateRecomBookIds();
    } catch (error) {
      logError(error, 'FeedsPageView.setExtParamsBeforeRefresh');
    }
  };

  // 获取刷新数据
  public getRefreshData = async (from, isSpecialRefresh = false) => {
    let result;
    try {
      addKeylink(`从${from}开始调用拉取feeds`);
      /** 刷新时候重置标记 */
      this.dataEnd = false;
      // 判断一下有没有设置过novelReader的版本号
      let readerVersion = this.mViewModel.getExtParam(EXT_PARAMS_MAP.novelReader);
      if (!readerVersion) {
        readerVersion = await getReaderVersion();
        this.mViewModel.setExtParams(EXT_PARAMS_MAP.novelReader, readerVersion);
      }
      // 设置额外参数
      await this.setExtParamsBeforeRefresh();
      if (this.isSupportNewPb) {
        // 获取刷新数据
        result = await requestTabListData({
          tabId: this.mTabId,
          requestType: RequestType.REFRESH,
        });
        result.slideUp = result.success;
      } else {
        result = await this.mViewModel.loadDataSource(
          FeedsDataManager.refreshType.refresh,
          false,
          isSpecialRefresh,
          this.mTabBean.iTabReqMode,
        );
      }
    } catch (e) {
      logError(e, 'FeedsPageView.getRefreshData');
    }
    return result;
  };

  public setDataAfterRefresh = (result) => {
    const { dataSource } = this.state;
    const enableLoadingFooter = this.isFooterEnable(dataSource, result.slideUp);
    const data = this.isSupportNewPb ? result.data.cards : result.items;
    // 设置是否冷启动
    FeedsConst.setGlobalConfKV('loadDataType', LOAD_DATA_TYPE.FROM_API);
    this.setState({
      dataSource: data,
      bPageEnd: result.bPageEnd,
      enableLoadingFooter,
      isEdit: false,
    }, () => {
      if (this.isSupportNewPb) {
        this.mRepository.saveItemsAsync(data, true, true);
      }
    });
  };

  /** 更新当前tab的本地dataSource，下次进入展示局部刷新卡的新数据 */
  public updateLocalDataSouce = async (params: any): Promise<void> => {
    try {
      const { tabId, cardData, position } = params || {};
      if (tabId !== this.mTabId) return;

      const { items = [] } = await this.mRepository.loadItemsAndSetting() || {};
      if (!(cardData?.cardKey && position > -1 && position < items.length)) return;

      items.splice(position, 1, cardData);
      this.mRepository.saveItemsAsync(items, true, true);
    } catch (err) {
      logError(err, `${TAG}.updateLocalDataSouce`);
    }
  };

  /**
   * 设置刷新次数
   * @param {String} refreshType
   */
  public _setSecondRefreshKey = (refreshType) => {
    if (
      (refreshType === FeedsPageViewModel.AutoRefreshType.Normal && this.parent.startUpType === 1) ||
      (refreshType === FeedsPageViewModel.AutoRefreshType.Normal && this.autoRefreshTimes === 1)
    ) {
      this.autoRefreshTimes += 1;
    }
  };

  /** 更新缓存书籍 */
  public updateCacheBooks = () => {
    // 需要满足在书架tab下
    this.mTabId === TabId.SHELF && updateCacheBooks();
  };

  /**
   * 主动刷新
   */
  public refresh = async () => {
    this.forceRefresh = false;
    const updated = this.mViewModel.hideRefreshTip();
    if (updated) {
      this.setState({
        dataSource: this.state.dataSource,
      });
    }
    this.updateCacheBooks();
    if (this.refs.feedsList) {
      this.autoRefresh = true;
      if (this.interestLoading && Platform.OS === 'ios') {
        if (!this.globalConf.preventRefresh4TopView) {
          this.refs.feedsList.startRefresh(this.globalConf.isKingCardUser ? 3 : 2);
        }
      } else {
        const qblistviewRefreshType = this.globalConf.isKingCardUser ? 3 : 1;
        if (!this.globalConf.preventRefresh4TopView) {
          this.refs.feedsList.startRefresh(qblistviewRefreshType);
        }
      }
    }
  };

  /**
   * 从DataSource取无限流最近30本书籍，添加到扩展参数带到后台
   */
  public updateRecomBookIds = () => {
    const { dataSource = [] } = this.state;
    const reverseDataSource = [...dataSource].reverse();
    const bookIds = reverseDataSource.reduce((arr, dataItem) => {
      if (arr.length >= LoadMoreRecomBookCount) return arr;

      const { cardKey, layoutList = [], mData } = dataItem || {};
      if (this.isSupportNewPb && [INFINITE_CARD_KEY, KNOWLEDGE_INFINITE_CARD_KEY].includes(cardKey)) {
        // 新协议无限流卡，从layoutList[0].dataList中取书籍id
        const reverseDataList = [...layoutList[0]?.dataList].reverse();
        reverseDataList.forEach((bookItem) => {
          arr.length < 30 && bookItem.resourceId && arr.push(bookItem.resourceId);
        });
      } else if (mData?.ui_style === OldProtocolInfiniteStyleId) {
        // 新协议无限流卡，从mData.parsedObject.vDetailData中取书籍id
        const reverseDataList = [...vectorToArray(mData.parsedObject?.vDetailData)].reverse();
        reverseDataList.forEach((bookItem) => {
          arr.length < 30 && bookItem.sBookId && arr.push(bookItem.sBookId);
        });
      }
      return arr;
    }, []);

    this.mViewModel.setExtParams(INFINITE_RECOM_PRE30_BOOK_IDS, bookIds.join(','));
  };

  // 预加载触发方法
  public loadMoreData = () => {
    // 如果是书架 是要阻挡第一次更新的 因为会自动触发loadmore
    if (this.mTabId === TabId.SHELF && this.globalConf.firstInBookshelf) {
      this.mViewModel.deleteExtParam('CUR_BOOK_ID');
      this.mViewModel.deleteExtParam('PAGE_NUM');
    }
    const { isEdit, bPageEnd } = this.state;
    if (this.mTabId === TabId.SHELF && isEdit) {
      QBToastModule.show('编辑状态下无法加载更多书籍', '', 4000);
      return;
    }
    // 书架的loadmore只有在最后一刷才会触发关闭动画，解决书架refresh动画频繁刷新会快速关闭问题
    if (this.mTabId === TabId.SHELF && bPageEnd) {
      // 设置状态
      this._onEndReachedCompleted(true, 0, 0, true);
      return;
    }
    if (!this.isLoadMoreDataEnabled) return;
    this._doLoadMoreData();
  };

  public _doLoadMoreData = async () => {
    /** 当前页面数据已经全部加载完成，不支持加载更多 */
    if (this.dataEnd) return;
    // 用户上滑主动刷新上报
    if (!this.mIsActive || this.mLoadState === LoadState.RefreshDoing) {
      if (Platform.OS === 'ios') {
        this.directCompleted(false, 0); // 解决ios下加载更多的一个bug
      }
      return;
    }
    this.mLoadState = LoadState.LoadMoreDoing;
    this.onEndReachedAniStart = true;
    if (!this._checkRequesting()) {
      this._setRequesting(false);
      try {
        const refreshType = FeedsDataManager.refreshType.loadMore;
        let result: any = {};
        addKeylink('从loadMore处调用拉取feeds');
        this.updateRecomBookIds();
        if (this.isSupportNewPb) {
          result = await requestTabListData({
            tabId: this.mTabId,
            requestType: RequestType.LOAD_MORE,
          });
          result.slideUp = result.success;
        } else {
          result = await this.mViewModel.loadDataSource(refreshType, undefined, undefined, this.mTabBean.iTabReqMode);
        }
        result.clear = true;
        this._clearRequesting(false);
        this._onEndReachedEnd(result);
      } catch (err) {
        logError(err, 'FeedsPageView.doLoadMoreData');
        this._clearRequesting(false);
        this._onEndReachedCompleted(false, -1, -10000);
      }
    } else {
      this.mLoadState = LoadState.None;
    }
  };

  /**
   * 判断是否需要缓存LoadMore数据
   * @param result
   * @private
   */
  public _onEndReachedEnd = result => this._callEndReached(result);

  /**
   * 追加数据
   * @param result
   * @private
   */
  public _callEndReached = (result, refreshType?: number) => {
    if (result) {
      const { success, count, slideUp, code, bPageEnd, items } = result;
      if (success) {
        const { dataSource } = this.state;
        if (this.mTabId === TabId.SHELF) {
          const data = refreshType === 1 ? dataSource : items;
          this.setState({
            dataSource: data,
            bPageEnd,
            enableLoadingFooter: bPageEnd ? false : this.isFooterEnable(dataSource, slideUp),
          });
          // 书架因为只有整卡,不走统一的关闭逻辑
          return;
        }
        if (this.isSupportNewPb) {
          const { data } = result;
          const { pageEnd, cards } = data;
          const { dataSource } = this.state;
          const enableLoadingFooter = this.isFooterEnable(dataSource, !pageEnd);
          dataSource.push(...cards);
          this.setState({
            dataSource,
            enableLoadingFooter,
          });
        } else {
          this.setState({
            dataSource,
            bPageEnd,
            enableLoadingFooter: this.isFooterEnable(dataSource, slideUp),
          });
        }
      }
      this._onEndReachedCompleted(success, count, code, bPageEnd);
    } else {
      this._onEndReachedCompleted(false, -1, 501);
    }
  };

  /**
   * Footer可见
   */
  public onFooterAppeared = () => {
    this.isFooterAppeared = true;
    if (this.mLoadState === LoadState.LoadMoreFinish) {
      const result = this.pendingResult;
      this.pendingResult = null;
      this._callEndReached(result);
      this.isLoadMoreDataEnabled = true; // 恢复
    } else {
      // 如果Footer已经加载了

      // 冷启动的时候会不正常的触发加载更多，在冷启动结束后恢复
      if (!this.isLoadMoreDataEnabled) {
        this.isLoadMoreDataEnabled = true; // 恢复
        if (this.mLoadState === LoadState.None) {
          this.loadMoreData();
        } else {
          this.directCompleted(false, 0); // 防止和自动刷新同时触发
        }
      }
    }
  };

  public directCompleted = (refresh, code) => {
    if (refresh) {
      this.refs.feedsList.refreshCompletedWithFrontImage(this.getRefreshType({ code }));
    } else if (this.refs.feedsList?.endReachedCompleted) {
      // ios qblistview在加载更多失败时尽量少调用endReachedCompleted，不然可能会导致两次终端动画冲突而卡死
      if (Platform.OS === 'android' || (Platform.OS === 'ios' && code !== -4 && code !== -3)) {
        this.refs.feedsList.endReachedCompleted(
          QBListView.QBListViewLoadingStatus.LOADING_STATUS_ERROR,
          getErrorMessage(code, this.lastNetInfoReach),
        );
      }
    }
  };

  public _onEndReachedCompleted = (success, count, code, bPageEnd = false) => {
    this.mLoadState = LoadState.None;
    // 动画结束标识，否则用ADR滚动参数判断上下滑有问题
    setTimeout(() => {
      this.onEndReachedAniStart = false;
    }, 1000);
    /** 当前tab没有更多数据了 */
    if (bPageEnd) this.dataEnd = true;
    if (this.refs.feedsList) {
      // 没有数据了
      if (success) {
        if (count === 0 || bPageEnd) {
          if (this.refs.feedsList) {
            let msg = '';
            bPageEnd ? (msg = '没有更多数据') : (msg = '正在加载中');
            // iOS瀑布流如果传了没有数据参数（3），无法再进行onEndReached触发，做个兼容
            this.refs.feedsList.endReachedCompleted(
              Platform.OS === 'ios'
                ? QBListView.QBListViewLoadingStatus.LOADING_STATUS_ERROR
                : QBListView.QBListViewLoadingStatus.LOADING_STATUS_NOMORE_DATA_DISABLECLICK,
              msg,
            );
          }
        } else {
          this.isFooterAppeared = false; // 仅在成功且有数据的时候
          if (this.refs.feedsList) {
            this.refs.feedsList.endReachedCompleted(QBListView.QBListViewLoadingStatus.LOADING_STATUS_SUCCESS);
          }
        }
      } else {
        this.directCompleted(false, code);
      }
      Object.assign(this.globalConf.timeCost, {
        loadMore_endReachedCompletedEnd: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
      });
      // 通知终端进行了上拉刷新
      FeedsAbilities.notifyUpPullRefresh();
    }
  };

  /** 获得刷新内容提示类型 */
  public getRefreshType({ code = 0, message = '', refreshIcon = '', scrollIndex = 0 }) {
    const colors = FeedsUtils.getSkinData([FeedsTheme.REFRESH_THEME.light, FeedsTheme.REFRESH_THEME.dark]);
    let msg;
    let status;
    if (message !== '' && code === 0) {
      msg = message;
      status = 0;
    }
    if (message === '' && code !== 0) {
      msg = getErrorMessage(code, this.lastNetInfoReach);
      status = 1;
    }
    const isNightMode = FeedsTheme.skinMode === SkinModelType.NIGHT;
    let tColor = FeedsTheme.REFRESH_THEME.textColor;
    let tSize = 12;
    if (isNightMode) {
      tColor = Platform.OS === 'android' ? '#415b82' : '#6c9de5';
    } else {
      tColor = '#136ce9';
    }
    if (Platform.OS === 'ios') {
      tSize = 13;
    }
    let mainTab = 0;
    const curTabId = this.mTabId;
    if (curTabId === TabId.BOTTOM_RECOMM2 || curTabId === this.globalConf.locatedTabId) {
      mainTab = 1;
    }
    if (scrollIndex < 0) {
      scrollIndex = 0;
    }
    return {
      status,
      text: msg,
      duration: 2000,
      textColor: tColor,
      textSize: tSize,
      bgBeginColor: colors[0],
      bgEndColor: colors[1],
      frontImgUrl: refreshIcon,
      mainTab,
      scrollIndex,
    };
  }

  //   listview在滑动时的曝光回调（速度过快时不回调），回调内容如下
  // - startEdgePos: number - list当前在屏幕内的上边界（dp单位）
  // - endEdgePos: number - list当前在屏幕内的下边界（dp单位）
  // - firstVisibleRowIndex: number - list当前在屏幕内的第一个可见item的index
  // - lastVisibleRowIndex: number - list当前在屏幕内的最后一个可见item的index
  // - velocity: number - list当前的滑动速度
  // - visibleRowFrames: 当前屏幕上可见行的frame
  // - scrollState: number 滚动状态，0表示停止状态，1表示手动拖拽状态，2表示松手后的滑动状态
  public _doScrollForReport = async (args) => {
    try {
      const event = args;
      const { scrollState } = event;
      const { visibleRowFrames } = event;
      if (typeof event.startEdgePos !== 'undefined') {
        this.mViewModel.lastScrollPos = event.startEdgePos;
      }

      if (!visibleRowFrames || !visibleRowFrames.length) {
        // 靠这个属性visibleRowFrames来上报
        return;
      }
      if (Platform.OS === 'android' && (scrollState === undefined || scrollState === 1)) {
        // QBListView.QBListViewScrollStatus.SCROLL_STATUS_DRAG)
        return;
      }
      const { dataSource } = this.state;

      if (
        event.firstVisibleRowIndex >= dataSource.length ||
        event.lastVisibleRowIndex >= dataSource.length ||
        event.lastVisibleRowIndex < 0 ||
        event.firstVisibleRowIndex < 0
      ) {
        return;
      }

      if (
        scrollState === 0 ||
        this.firstVisibleRowIndex !== event.firstVisibleRowIndex ||
        this.lastVisibleRowIndex !== event.lastVisibleRowIndex
      ) {
        this.scrollState = scrollState;
        this.startEdgePos = event.startEdgePos;
        this.endEdgePos = event.endEdgePos;
        this.firstVisibleRowIndex = event.firstVisibleRowIndex;
        this.lastVisibleRowIndex = event.lastVisibleRowIndex;
        const isScrollStop = scrollState === 0;
        // 静止情况才曝光
        if (isScrollStop) {
          const longExposureList = this.getLongExposureList();
          // 真实曝光队列批量操作
          if (longExposureList && longExposureList.size > 0) {
            longExposureList.forEach((v) => {
              reportUDS(BusiKey.LONG_EXPOSE__CARD, { itemBean: v }, v?.reportInfo || {});
            });
            // 上报完清除队列
            this.clearLongExposureList();
          }
          // 小说首屏曝光、第二屏曝光、第三屏曝光
          if (!this.containWindowHeight) this.containWindowHeight = event.endEdgePos - event.startEdgePos;
          const curTabId = this.mTabId === TabId.BOTTOM_RECOMM2 ? TabId.BOTTOM_RECOMM1 : this.mTabId;
          // 曝光首屏
          if (!this.novelScreenExposed.first && event.startEdgePos < this.containWindowHeight) {
            reportUDS(BusiKey.EXPOSE__FIRST_SCREEN, { tabId: curTabId });
            this.novelScreenExposed.first = true;
          } else if (
            !this.novelScreenExposed.second &&
            event.startEdgePos > this.containWindowHeight &&
            event.startEdgePos < this.containWindowHeight * 2
          ) {
            this.novelScreenExposed.second = true;
            // 曝光第二屏
            reportUDS(BusiKey.EXPOSE__SECOND_SCREEN, { tabId: curTabId });
          } else if (
            !this.novelScreenExposed.third &&
            event.startEdgePos > this.containWindowHeight * 2 &&
            event.startEdgePos < this.containWindowHeight * 3
          ) {
            this.novelScreenExposed.third = true;
            // 曝光第三屏
            reportUDS(BusiKey.EXPOSE__THIRD_SCREEN, { tabId: curTabId });
          }
        }
        // 真实曝光
        // 数组是需要排队检查是否曝光超过3s的item
        // 如果下次检查曝光时间超过3s后，执行曝光操作，改item的真实曝光字段为true，并且从该数组移除已真实曝光的item
        const nowTime = new Date().getTime();
        if (this.lastExposureItems && this.lastExposureItems.size > 0) {
          // 已经有上一次曝光的数组
          this.lastExposureItems.forEach((v) => {
            if (
              dataSource[v]?.longExposureStartTimed &&
              nowTime - dataSource[v].longExposureStartTime >= 3000 &&
              !dataSource[v].longExposureFlag
            ) {
              // 判断开始时间是否距离3s以上了，并且没有真实曝光过
              dataSource[v].longExposureFlag = true;
              this.addLongExposureToList(dataSource[v].mData || dataSource[v]);
            } else {
              // 这次没有达到真实曝光需求的数据
              let eraseStartTimeFlag = true;
              // 检验下是否队列中的item未曝光的是否在新一次曝光也出现了，如无出现将其曝光时间置空，下次重新计算3s
              for (let k = this.firstVisibleRowIndex; k <= this.lastVisibleRowIndex; k += 1) {
                if (v === k) {
                  eraseStartTimeFlag = false;
                  break;
                }
              }
              if (eraseStartTimeFlag && dataSource[v] && !dataSource[v].longExposureFlag) {
                dataSource[v].longExposureStartTime = null;
              }
            }
          });
        }
        // 查看这一次还需要真实曝光
        const newLastExposureItems = new Set();
        for (let i = this.firstVisibleRowIndex; i <= this.lastVisibleRowIndex; i += 1) {
          if (
            dataSource[i]?.longExposureStartTime &&
            nowTime - dataSource[i].longExposureStartTime >= 3000 &&
            !dataSource[i].longExposureFlag
          ) {
            // 判断开始时间是否距离3s以上了，并且没有真实曝光过
            dataSource[i].longExposureFlag = true;
            this.addLongExposureToList(dataSource[i].mData || dataSource[i]);
          } else if (dataSource[i] && !dataSource[i].longExposureFlag) {
            // 还没有真实曝光
            if (!dataSource[i].longExposureStartTime) {
              // 还没有曝光时间
              dataSource[i].longExposureStartTime = new Date().getTime();
            }
            newLastExposureItems.add(i);
          }
        }
        this.lastExposureItems = newLastExposureItems;
      }
    } catch (error) {
      logError(error, 'FeedsPageView._doScrollForReport');
    }
  };

  public getQbListViewRef = () => {
    let rst: any = null;
    if (this.refs.feedsList) {
      rst = this.refs.feedsList;
    }
    return rst;
  };

  public tryLoginGuide = async () => {
    try {
      addKeylink('tryLoginGuide start', TAG);
      const isLogin = await checkLogin();
      if (isLogin) return; // 已经登录，不进行登录引导
      addKeylink('开启进入书架的收藏引导', TAG);
      const curTime = new Date().getTime();
      const lastRefuseTime = parseInt((await readSharedSettings('bookshelfLastRefuseLoginTime')) || '0', 10);
      // 未登录下如果三天内拒绝过登录，则不进行登录引导
      if (lastRefuseTime + 259200000 < curTime) {
        // 限频，成功或拒绝登录后三天内不再提醒
        writeSharedSettings('bookshelfLastRefuseLoginTime', curTime);
        addKeylink('tryLoginGuide writeSharedSettings end', TAG);
        reportUDS(BusiKey.EXPOSE__BOOK_SHELF_TAB_LOGIN_GUIDE_BAR, this.props);
        showLoginPanel({ loginTitle: '登录可同步书籍', keyFromWhere: 10054 }).then((res) => {
          const { result = 0 } = res;
          if (result === 0) {
            reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_LOGIN_CANCEL, this.props);
            return;
          }
          // 登录完成后延迟一点再刷新数据
          setTimeout(() => this.refreshSilent(TabId.SHELF), 1000);
          reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_LOGIN_SUCC, this.props);
        });
      }
    } catch (err) {
      logError(err, 'FeedsPageView.tryLoginGuide');
    }
  };

  /**
   * 插入到当前点击Item ++index之后, 可通过offset偏移量调整
   * @param {int} tab_id
   * @param app_id
   * @param {int} item_id
   * @param {int} item_index 比item_id优先取item_item_index去处理
   * @param {Object} data
   * @param delCount
   * @param offset
   * @param isRecommend // 这个接口默认的isRemmend为true,会加入你可能还想看的UI，允许传入修改
   * @param animDurTme 后台对UI bDynamicEffect设置为true之后可以通过这个参数控制空白时间
   * @param skipGroup group数据在holder里面但是不显示，会影响插入数据，如果index我手动输入（而非查找）的时候确认是否需要group,一般都需要，
   * @author uct
   */
  public _onInsertAfterAction = ({
    tabId,
    appId,
    itemId,
    itemIndex,
    data,
    delCount = 0,
    offset = 0,
    isRecommend,
    animDurTme,
    skipGroup = false,
  }) => {
    try {
      let holder;
      if (data instanceof Array) {
        data.forEach((item) => {
          if (!holder) {
            holder = [];
          }
          const holderData = FeedsPageViewModel.preParseOne(item, tabId, appId, this.symbolKey);
          holderData && (holderData.isRecommend = isRecommend);
          if (holderData?.mData) {
            holderData.mData.animDurTme = animDurTme;
          }
          holder.push(holderData);
        });
      } else if (data) {
        holder = FeedsPageViewModel.preParseOne(data, tabId, appId, this.symbolKey);
        if (holder.mData) {
          holder.mData.animDurTme = animDurTme;
        }
      }

      // group数据在holder里面但是不显示，会影响插入数据，如果index我手动输入（而非查找）的时候确认是否需要group,一般都需要，
      if (itemIndex && skipGroup) {
        for (let dIndex = 0; dIndex < this.mViewModel.mDataHolders.length && dIndex <= itemIndex; dIndex += 1) {
          const itemTemp = this.mViewModel.mDataHolders[dIndex]?.mData;
          if (itemTemp && itemTemp.extend === 1) {
            offset += 1;
          }
        }
      }
      if (holder !== null) {
        let index = itemIndex || this.mViewModel.mDataHolders.findIndex(item => item.mData.item_id === itemId);
        if (index !== -1 && index < this.mViewModel.mDataHolders.length) {
          // index可能是传递过来的这里做个保护
          index += 1;
          if (holder instanceof Array) {
            const calcIndex = index + offset;
            calcIndex < this.mViewModel.mDataHolders.length &&
              this.mViewModel.mDataHolders.splice(calcIndex, delCount, ...holder);
          } else {
            holder.isRecommend = isRecommend;
            const calcIndex = index + offset;
            calcIndex < this.mViewModel.mDataHolders.length &&
              this.mViewModel.mDataHolders.splice(calcIndex, delCount, holder); // 这里index为何要++
          }
        }
        this.setState({ dataSource: this.mViewModel.mDataHolders });
        this.forceUpdate();
      }
    } catch (err) {
      logError(err, 'FeedsPageView._onInsertAfterAction');
    }
  };
}
