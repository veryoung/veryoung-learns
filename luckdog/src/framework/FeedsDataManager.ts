import { client } from '@tencent/hippy-rpc';
import Taf from '@tencent/hippy-stream';
import {
  QBAccountModule,
  QBDeviceModule,
  Dimensions,
  PixelRatio,
  QBWifiModule,
  Platform,
  QBPackageModule,
} from '@tencent/hippy-react-qb';
import { callNativeWithPromise } from '@tencent/hippy-react';
import { MTT } from '@tencent/luckbox-hippyjce-homepage';
import FeedsItemExtBean from '../domain/FeedsItemExtBean';
import FeedsEventHub from './FeedsEventHub';
import { bundleConfig } from '../../package.json';
import NetworkState from './NetworkState';
import { tafMapToArray, isGuidEmpty } from './Utils';

import FeedsUtils from './FeedsUtils';
import { addKeylink, KeylinkCmd, logError, reportBeacon, TechKey } from '@/luckdog';
import { TabId } from '../entity';
import { getQbUrl, isTopTab, UserLoginType } from '@/luckbox';
import { convertNewProtoStringData2Object } from './new-protocol-transform';

const prx = client.stringToProxy(MTT.HomepageFeedsForClientProxy, 'FeedsHomepage');

let SCREEN_SIZE = ''; // Dimensions.get('screen').width +"*" + Dimensions.get('screen').height;
let hwcodeclevel = null; // 机器硬解信息
const tabid = `${TabId.BOTTOM_RECOMM2}`;

const parseJceObject = function parseJceObject(jceData, def) {
  if (def === undefined) {
    return null;
  }
  try {
    const stream = new Taf.JceInputStream(jceData);
    // eslint-disable-next-line no-underscore-dangle
    return def._readFrom(stream);
  } catch (e) {
    logError(e, 'FeedsDataManager._readFrom');
  }
  return undefined;
};

const getUiStyleDef = function getUiStyleDef(uiStyle) {
  if (uiStyle < 1) {
    return undefined;
  }
  const ctor = MTT[`HomepageFeedsUI${uiStyle}`];
  if (ctor === undefined) {
    return undefined;
  }

  return ctor;
};
export default class FeedsDataManager {
  public static refreshType: any;
  /**
   * @param refreshType  REFRESH_TYPE_REFRESH = 0x01;   REFRESH_TYPE_LOAD_MORE = 0x02;
   */
  public static async requestItemList(
    refreshType,
    watchInfo = null,
    extParams,
    globalConf,
    hasCache,
  ) {
    try {
      const userInfo = globalConf.accountInfo || (await QBAccountModule.getAccountInfo());
      if (globalConf.qbid === null) {
        // eslint-disable-next-line no-param-reassign
        globalConf.qbid = userInfo.qbid;
      }
      let devInfo = globalConf.deviceInfo || (await QBDeviceModule.getDeviceInfo());
      devInfo = { ...devInfo, ...(globalConf.idInfo || {}) };

      if (isGuidEmpty(globalConf.guid)) {
        // eslint-disable-next-line no-param-reassign
        globalConf.guid = devInfo.guid;
      }
      // eslint-disable-next-line no-param-reassign
      globalConf.isKingCardUser = devInfo.isKingCardUser || false;

      if (
        !NetworkState.currentNetType
        || NetworkState.currentNetType === NetworkState.NetworkTypes.NONE
      ) {
        await NetworkState.getNewState(devInfo);
      }
      const req = new MTT.GetHomepageFeedsTabListsReq();
      req.iTabId = Number(tabid);
      req.iRefreshType = refreshType;

      if (SCREEN_SIZE === '') {
        const { width, height } = Dimensions.get('screen');
        const pr = PixelRatio.get();
        SCREEN_SIZE = `${Math.floor(width * pr)}*${Math.floor(height * pr)}`; // 屏幕宽度
      }
      req.sScreenSize = SCREEN_SIZE;
      req.iAppId = isTopTab() ? 0 : 138;
      req.sQBId = globalConf.qbid || '';
      req.sGuid = globalConf.guid;
      req.sQua = globalConf.qua2;
      req.sRnVersion = bundleConfig.RUA;
      req.sImei = devInfo.qimei || '';

      if (devInfo.qadid) {
        req.sQADID = devInfo.qadid;
      }
      if (watchInfo !== null) {
        req.mpWatchedInfo = watchInfo;
      }
      devInfo.taid && req.mpExtParams.put('DeviceInfo_TAID', devInfo.taid);
      devInfo.oaid && req.mpExtParams.put('DeviceInfo_OAID', devInfo.oaid);
      devInfo.id && req.mpExtParams.put('DeviceInfo_AndroidId', devInfo.id);
      devInfo.macAddress && req.mpExtParams.put('DeviceInfo_MacAddress', devInfo.macAddress);
      devInfo.imei && req.mpExtParams.put('origin_imei', devInfo.imei);
      globalConf.qqPkgInfo?.versionName
        && req.mpExtParams.put('qqVersionName', globalConf.qqPkgInfo.versionName);
      globalConf.wxPkgInfo?.versionName
        && req.mpExtParams.put('wxVersionName', globalConf.wxPkgInfo.versionName);
      globalConf.qqPkgInfo?.pkgStatus
        && req.mpExtParams.put(
          'isQQInstalled',
          globalConf.qqPkgInfo.pkgStatus === QBPackageModule.PACKAGE_STATUS_INSTALLED ? '1' : '0',
        );
      globalConf.wxPkgInfo?.pkgStatus
        && req.mpExtParams.put(
          'isWXInstalled',
          globalConf.wxPkgInfo.pkgStatus === QBPackageModule.PACKAGE_STATUS_INSTALLED ? '1' : '0',
        );
      req.iApnType = NetworkState.currentAPN;

      if (typeof globalConf.startUpType !== 'undefined') {
        req.mpExtParams.put('startUpType', `${globalConf.startUpType}`);
      }
      globalConf.appInstallTime
        && req.mpExtParams.put('appInstallTime', `${globalConf.appInstallTime}`);
      globalConf.appUpdateTime
        && req.mpExtParams.put('appUpdateTime', `${globalConf.appUpdateTime}`);
      const ext = new MTT.Qb2qqwxUserInfo();
      if ([UserLoginType.QQ, UserLoginType.WECHAT, UserLoginType.QQCONNECT, UserLoginType.PHONE]
        .includes(userInfo.type)) {
        ext.sQbid = userInfo.qbid;
        ext.sUserId = userInfo.uin;
        ext.iIdType = userInfo.type;
        // QQ拿的skey，微信和互联登陆QQ拿的是token
        ext.sToken = userInfo.type === UserLoginType.QQ ? userInfo.skey : userInfo.token;
        // Token类型 A2 = 1, token = 2, skey = 3
        ext.eTokenType = userInfo.type === UserLoginType.QQ ? 3 : 2;
        ext.sUnionId = userInfo.unionid || '';
      }
      req.sQbUserInfo = ext;
      // 注入进入链接的url，给后台取出ch
      req.mpExtParams.put('qbUrl', getQbUrl());
      if (extParams) {
        Object.keys(extParams).forEach((key) => {
          if ({}.hasOwnProperty.call(extParams, key)) {
            req.mpExtParams.put(key, extParams[key]);
          }
        });
        if (extParams.WIFI_SCENES_INFO) {
          // WIFI用过一次就清除
          // eslint-disable-next-line no-param-reassign
          delete extParams.WIFI_SCENES_INFO;
        }
      }

      if (Platform.OS === 'android') {
        if (!hwcodeclevel) {
          hwcodeclevel = await FeedsDataManager.getHWCodecLevel();
        }
        req.mpExtParams.put('HWCODECLEVEL', hwcodeclevel);
      }

      req.mpExtParams.put('KINGCARD', globalConf.isKingCardUser ? '1' : '0');
      req.mpExtParams.put('STYLE_VERSION', `${globalConf.style.version}`);
      const opt = FeedsEventHub.getOpt();
      req.sChannelId = opt.channel;
      req.iScenes = opt.scenes;

      const startFetchDataTime = Date.now();
      const { response, timeCode } = await FeedsUtils.promiseTimeout(
        prx.getFeedsTabLists(req),
        10 * 1000,
        false,
      );
      const timeConsuming = Date.now() - startFetchDataTime;
      addKeylink(`getFeedsTabLists=${timeConsuming}`, KeylinkCmd.RPC_COSTTIME_AVG);

      const { curTabId } = globalConf;
      // 拉取数据耗时上报灯塔
      reportBeacon(TechKey.EXPOSE__FETCH_DATA_TIME_CONSUMING, {
        tabId: curTabId === TabId.BOTTOM_RECOMM2 ? TabId.BOTTOM_RECOMM1 : curTabId,
      }, {
        act_duration: timeConsuming, // 拉取数据耗时
        ext_data1: hasCache ? 0 : 1, // 是否为isFirstScreen
      });


      if (timeCode) {
        return {
          timeCode,
        };
      }

      // eslint-disable-next-line no-param-reassign
      globalConf.refreshType = refreshType;
      return response;
    } catch (e) {
      logError(e, 'FeedsDataManager.requestItemList');
      return null;
    }
  }


  public static jceFeedsItemDataList2ExtBeanList(
    itemListData,
    tabId,
    updateTime,
    grayInfo,
    appId,
    growExt,
  ) {
    const feedsItems: any[] = [];
    itemListData.forEach((jceItemData) => {
      const bean = FeedsDataManager.jceFeedsItemData2ExtBean(
        jceItemData,
        tabId,
        updateTime,
        appId,
        growExt,
      );
      if (bean !== null) {
        bean.grayInfo = grayInfo;
        feedsItems.push(bean);
      }
    });
    return feedsItems;
  }

  public static jceFeedsItemData2ExtBean(itemData, tabId, updateTime, appId, growExt) {
    const bean: any = new FeedsItemExtBean();
    bean.app_id = appId;
    bean.item_id = itemData.sItemId;
    bean.business = itemData.iBusiness;
    bean.title = itemData.sTitle;
    bean.url = itemData.sUrl;
    bean.ui_style = itemData.iUIStyleId;
    bean.style_data = itemData.vStyleStream;
    bean.tab_id = tabId;
    bean.update_time = updateTime;
    bean.need_distort = itemData.bAdNeedDistort;

    if (itemData.vFeedback.value.length > 0) {
      bean.feedback = itemData.vFeedback.value;
    }
    if (itemData.mpReportInfo.size() > 0) {
      if (itemData.mpReportInfo.value?.FAIL_REPORT_URL) {
        bean.failReportUrl = itemData.mpReportInfo.value.FAIL_REPORT_URL || null;
      }
      bean.report_info = tafMapToArray(itemData.mpReportInfo);
    }
    if (itemData.vExposureReportUrl.value.length > 0) {
      bean.exposure_report = itemData.vExposureReportUrl.value;
    }
    if (itemData.vClickReportUrl.value.length > 0) {
      bean.click_report = itemData.vClickReportUrl.value;
    }
    if (itemData.mpExtInfo?.value) {
      bean.ext_info = itemData.mpExtInfo.value;
      if (itemData.mpExtInfo.value.debugInfo) {
        bean.debugInfo = itemData.mpExtInfo.value.debugInfo;
      }
      if (itemData.mpExtInfo.value.FEEDBACK_INFO) {
        bean.feedback_info = itemData.mpExtInfo.value.FEEDBACK_INFO;
      }
      if (itemData.mpExtInfo.value.cookie) {
        bean.cookie = itemData.mpExtInfo.value.cookie;
      }
      if (itemData.mpExtInfo.value.PreAppStoreUrl) {
        bean.preAppStoreUrl = itemData.mpExtInfo.value.PreAppStoreUrl;
      }
      if (itemData.mpExtInfo.value.INSERT_ITEMS) {
        let insertInfo: any = null;
        try {
          insertInfo = JSON.parse(itemData.mpExtInfo.value.INSERT_ITEMS);
        } catch (e) {
          logError(e, 'FeedsDataManager.jceFeedsItemData2ExtBean');
        }
        if (insertInfo) {
          Object.keys(insertInfo).forEach((docId) => {
            const itemId = insertInfo[docId];
            if (bean.item_id === itemId) {
              bean.growExt = {};
              bean.growExt.docId = docId;
              if (growExt) {
                bean.growExt.exposeUrl = growExt.exposeUrl;
                bean.growExt.clickUrl = growExt.clickUrl;
              }
            }
          });
        }
      }
      if (itemData.mpExtInfo.value.product_type) {
        bean.productType = itemData.mpExtInfo.value.product_type;
      }
      if (itemData.mpExtInfo.value.jdapp_target_url) {
        bean.jdUrl = itemData.mpExtInfo.value.jdapp_target_url;
      }
      if (itemData.mpExtInfo.value.changeBtnColor) {
        bean.changeBtnColor = itemData.mpExtInfo.value.changeBtnColor;
      }
      if (itemData.mpExtInfo.value.msBeforeBtnColorChange) {
        bean.msBeforeBtnColorChange = itemData.mpExtInfo.value.msBeforeBtnColorChange;
      }
      if (itemData.mpExtInfo.value.ABTestAdsUIKey) {
        // 【ID64269869】 【0】【浏览器-广告形态】feeds流广告按钮样式优化实验 mark by uct

        bean.adsUIKey = itemData.mpExtInfo.value.ABTestAdsUIKey;
      }
      if (itemData.mpExtInfo.value.dest_url_display_type) {
        bean.adDestUrlType = parseInt(`${itemData.mpExtInfo.value.dest_url_display_type}`, 10) || 0;
      }
      if (itemData.mpExtInfo.value.littleVideoUIType) {
        bean.littleVideoUIType = `${itemData.mpExtInfo.value.littleVideoUIType}` || '1';
      }

      // 微信小程序跳转fallback
      if (itemData.mpExtInfo.value.WxProgramRL) {
        bean.WxProgramRL = itemData.mpExtInfo.value.WxProgramRL;
      }

      if (itemData.mpExtInfo.value.videoHasWatermark) {
        // 视频是否有水印
        bean.videoHasWatermark = itemData.mpExtInfo.value.videoHasWatermark;
      }

      if (itemData.iAdSource) {
        bean.adSource = itemData.iAdSource;
      }
    }
    return bean;
  }


  /**
   * 预解析数据
   * @param feedsBean FeedsItemExtBean
   * @param clearOldData 表示parse之后要不要把老字段置空，以节省内存
   */
  public static preParseBeanData(feedsBean, clearOldData?: boolean) {
    if (feedsBean.isParsed) {
      return;
    }

    if (feedsBean.style_data !== null) {
      // eslint-disable-next-line no-param-reassign
      feedsBean.parsedObject = parseJceObject(
        feedsBean.style_data,
        getUiStyleDef(feedsBean.ui_style),
      );
      convertNewProtoStringData2Object(feedsBean);

      if (clearOldData) {
        // eslint-disable-next-line no-param-reassign
        feedsBean.style_data = null;
      }
    }
  }


  public static getHWCodecLevel() {
    return FeedsUtils.promiseTimeout(
      callNativeWithPromise('QBDeviceModule', 'getHWCodecLevel'),
      1500,
    );
  }

  public static getConnectedAp() {
    return FeedsUtils.promiseTimeout(QBWifiModule.getConnectedAp(), 1500);
  }
}

/** @type {{refresh:1;loadMore:2;autoRefresh:3;}} */
FeedsDataManager.refreshType = {
  refresh: 1,
  loadMore: 2,
  autoRefresh: 3, // 自动刷新的识别字段, 只对tabId === 1, 资讯场景有用。
};
