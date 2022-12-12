/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable array-callback-return */
/* eslint-disable no-dupe-class-members */
/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  Platform,
  QBBrowserObserver,
  QBDeviceEventEmitter,
  QBTabHost,
  QBWifiModule,
  QBAccountModule,
  QBDeviceModule,
  QBSharedSettingModule,
  View,
  AsyncStorage,
  QBAlertModule,
  Image,
  QBBusinessADModule,
} from '@tencent/hippy-react-qb';

import FeedsTheme from '../FeedsTheme';
import NavItem from './FeedsTabBar';
import FeedsEventHub from '../FeedsEventHub';
import FeedsPageView from '../FeedsPageView';
import FeedsAbilities from '../FeedsAbilities';
import FeedsConst, {
  ON_ACTIVE_TAB_UPDATE_INTERVAL,
  PageModule,
  ON_ACTIVE_TAB_EXPOSED_INTERVAL,
  MODULE,
  COMPONENT,
  ENV,
  welfareCenter,
} from '../FeedsConst';

import { asyncCall, formatDate } from '../Utils';
import FeedsUtils from '../FeedsUtils';
import FeedsGlobalProps from '../FeedsGlobalProps';
import FeedsStyleManager from '../FeedsStyleManager';
import FeedsProtect from '../../mixins/FeedsProtect';
import { bundleConfig } from '../../../package.json';
import StorageUtils from '../StorageUtils';
import {
  addKeylink,
  logError,
  flushKeylinks,
  KeylinkCmd,
  reportUDS,
  STAT_USING_TIME_STEP,
  transTimeToSeconds,
  reportBeacon,
  strictExposeReporter,
  BusiKey,
  TechKey,
  setEnvInfo,
  logFirstScreen,
} from '@/luckdog';
import { DEFAULT_FEEDS_STYLE, TABLIST_CONFIG } from '../FeedsDefaultStyle';
import FeedsIcon from '../FeedsIcon';
import BottomBanner from '../../feeds-styles/common/BottomBanner';
import {
  addDefaultChangeListener,
  getLocation,
  isTopTab,
  setQbUrl,
  OpInfoType,
  collectBook,
  getUserVisitor,
  DynamicTabType,
  shouldComponentUpdate,
  getDeviceVisitor,
} from '@/luckbox';

import { ConstantUtils } from '../../feeds-styles/common/utils';
import {
  addFSPopReadyObserver,
  getFSPopPresenter,
  PopResult,
  removeFSPopReadyObserver,
  isFSRendered,
  addFSObserver,
  removeFSObserver,
  getFSData,
  getFSDataSync,
  addFSRetryObserver,
  removeFSRetryObserver,
  getTabList,
  initTabList,
  updateTabList,
  getFixedTabId,
  getTabIdParam,
  getRedDotPresenter,
  getTabpageBackgroundManager,
  isTabClicked,
  recordTabClicked,
  getWelfarePendantShowType,
  isQBVersionValidForAd,
  WelfarePendantShowType,
  welfarePendantRule,
} from '@/presenters';
import RedPack from '../../components/fspops/RedPack';
import NewUserBubble from '../../components/fspops/NewUserBubble';
import WCBubble from '../../components/fspops/WCBubble';
import WebView from '../../feeds-styles/common/WebView';
import { TabId, TabModelType, ActiveTab, CommonProps, DynamicTabItem } from '../../entity';
import OpHalfPopUp from '../../components/fspops/OpHalfPopUp';
import OpHalfWebView from '../../components/fspops/OpHalfWebView';
import { emitter, events } from '../../utils/emitter';
import { updateUserInfo } from '../utils/user';
import { activeEventObserver, deActiveEventObserver } from '../../utils/NativeEventAdapter';
import { initSharedStorage } from '../../utils/shareSettings';
import { TopTabPressure } from '../../components/fspops/top-tab-pressure';
import WelfareTreasure from '../views/welfare-treasure';

interface Props extends CommonProps {
  qbId: string;
  tabUrl: string;
  primaryKey: string;
  qbConfig: any;
  firstInstallTime: number;
  lastUpdateTime: number;
  abilities: any;
}

interface State {
  curTabId: number;
  tabList: DynamicTabItem[];
  refreshNum: number;
  skinMode: any;
  orientation: any;
  redDotCnt: number;
  /** 福利入口气泡是否展示 */
  welfareVisible: boolean;
  /** 福利入口是否可以兑奖 */
  welfarePrize: boolean;
  /** 福利入口链接地址 */
  welfareUrl: string;
  forceCloseBtmBanner: boolean;
  /** tab数据是否初始化完成 */
  isTabInit: boolean;
  isPageActive: boolean;
  shownPop?: PopResult;
  /** 福袋是否展示 */
  welfarePendantShowType: WelfarePendantShowType;
}

/** 闪屏结束终端返回事件参数中state的值 */
const SPLASH_END_TEXT = 'event_splash_state_dismiss';
const TAG = 'FeedsHomePage';

@FeedsProtect.protect
export default class FeedsHomePage extends Component<Props, State> {
  public globalConf: FeedsGlobalProps;
  public startUpType: any;
  public closeBubbleTimer: number;
  public primaryKey: any;
  public mContainerHeight: number;
  public isRefreshChangeTab: boolean;
  public customFlag: boolean;
  public tabHostFlag: boolean;
  public clickTabTimer;   // ios点击跳转定时器
  public isTabChange: boolean;
  public hasInitTabArr: number[];
  public selectedIndex: number;
  public lstTabId: number;
  public feedsListRefs: any;
  public mTabItemsView: Map<any, any>;
  public hasInitEvent: boolean;
  public loadUrlFlag: boolean;
  public updateTabsTime: number;
  public exposedReportTime: number;
  public tabExposureTimer;
  public tabChangeEndTimer;
  public isTabClicking: boolean;
  public isInitPageSelected: boolean;
  public isPreloadSiblings: boolean;
  public infoPreloadPrx: null;
  public isRecommendAlertShown: boolean;
  public afterFirstScreenIsRequested: boolean;
  public skinListener: any;
  public accountListener: any;
  public screenOrientationChange: any;
  public lifecycleListener: any;
  public optListener: any;
  public wifiConnStateListener: any;
  /** 闪屏监听器 */
  public splashStateListener: any;
  public sizeChangedListener: any;
  public firstViewListener: any;
  public deviceTimer;
  public postMessageListener: any;
  public lifecycleIframeListener: any;
  public doOnLoadUrlCallback;
  public setFeedsActiveFlag: any;
  public setFeedsActiveCount: any;
  public initiativeFeedBack: any;
  public refreshKey;
  public statUsingTimeTimer: any;
  public reportTabShowChannelTimer: any;
  public refs!: {
    [key: string]: any;
    qbtabhost: any;
  };
  public lastClickTabTime: any;
  public activeTabId: number;
  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsHomePage');

  public constructor(props) {
    super(props);
    this.globalConf = new FeedsGlobalProps(props);
    initSharedStorage(this.globalConf.qbBuild);
    initTabList(props.tabUrl).then(({ tabList, activeTabId }) => this.initTab(tabList, activeTabId));
    this.state = {
      curTabId: TabId.BOTTOM_RECOMM1,
      tabList: getTabList(),
      refreshNum: 0,
      skinMode: props.qbConfig.skinMode,
      orientation: props.qbConfig.orientation,
      redDotCnt: 0, // 红点总数
      welfareVisible: false,
      welfarePrize: false,
      welfareUrl: '',
      forceCloseBtmBanner: false, // 是否强制关闭底部运营栏
      isPageActive: false, // 是否在页面内
      shownPop: {
        // 应该显示的弹框的类型和数据
        type: OpInfoType.DEFAULT,
        data: {} as any,
      },
      isTabInit: isTopTab(),
      welfarePendantShowType: WelfarePendantShowType.HIDDEN,
    };
    this.globalConf.env = ENV.REAL;
    this.startUpType = this.globalConf.startUpType; // 1:表示全新安装 2：表示升级安装 3：普通打开
    this.closeBubbleTimer = 0; // 关闭气泡的定时器
    // 初始化参数
    this.globalConf.refreshType = -1;
    this.globalConf.appInstallTime = this.props.firstInstallTime;
    this.globalConf.appUpdateTime = this.props.lastUpdateTime;
    this.globalConf.pageActive = true;
    this.globalConf.initActive = false;
    this.globalConf.toPageModule = PageModule.UnKnow;
    this.globalConf.curTabId = TabId.BOTTOM_RECOMM1;
    this.globalConf.refreshStyleVer = props.refreshStyleVer; // 刷线条样式实验 0: 10.3以前样式，1：10.3以后样式
    this.primaryKey = this.globalConf.primaryKey; // 每一个feeds实例唯一标识
    this.mContainerHeight = ConstantUtils.getScreenHeight(); // tab页面容器的高度
    this.isRefreshChangeTab = false; // 是否是从外部进入后改变tab
    if (this.props.abilities) {
      FeedsAbilities.init(this.props.abilities);
    }
    this.globalConf.appId = isTopTab() ? 0 : 138;
    this.customFlag = true;
    this.tabHostFlag = true;
    this.globalConf.timeCost = {
      time_1: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
    };

    this.globalConf.style = new FeedsStyleManager();
    this.globalConf.idInfo = {};
    this.isTabChange = false;
    this.hasInitTabArr = [];
    this.selectedIndex = 0;
    this.lstTabId = -1;
    this.feedsListRefs = {};
    this.mTabItemsView = new Map(); // 保存tab的refs
    this.hasInitEvent = false;
    this.loadUrlFlag = false; // 规避ios首次启动未完成时收到onLoadUrl消息回调时序异常以及未知的onScroll消息的bug
    const now = +new Date();
    this.updateTabsTime = now; // 不满足时间间隔时不请求后台，以免后台过载
    this.exposedReportTime = now; // 热启动时主动上报曝光最多一天两次
    this.tabExposureTimer = -1; // tab列表曝光1秒计时timer
    this.tabChangeEndTimer = -1; // tab列表曝光1秒计时timer
    this.isTabClicking = false;
    this.isInitPageSelected = false;
    this.isPreloadSiblings = false;
    this.setDeviceIds();
    this.globalConf.isInfoCached = false;
    this.globalConf.rnVersion = `${(bundleConfig || {}).VC}`;
    this.infoPreloadPrx = null;
    this.isRecommendAlertShown = false;
    this.globalConf.barRedPointHasClicked = false; // 底bar红点是否已经被点击过
    this.globalConf.hasBarRedPointExist = false; // 底bar红点是否已经出现了
    this.afterFirstScreenIsRequested = false; // 首屏接口是否正在请求中
    Object.assign(this.globalConf.timeCost, {
      time_2: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
    });
    this.activeTabId = 0;
  }

  public UNSAFE_componentWillMount = () => {
    addKeylink('willMount() start', TAG);
    this.statUsingTimeTimer = setInterval(
      () => reportUDS(
        BusiKey.READ_DURATION__STAT_USING_TIME_BY_STEP,
        {},
        {
          act_duration: transTimeToSeconds(STAT_USING_TIME_STEP),
        },
      ),
      STAT_USING_TIME_STEP,
    );
    this.initListenEvent();
    getLocation().onChange(this.defaultUrlListener);
  };

  /** 默认url监听 */
  public defaultUrlListener = () => {
    addDefaultChangeListener({
      // 收藏书籍，收藏失败时取消书架动画
      collectBook: (resourceId) => {
        collectBook(resourceId).then((code) => {
          if (code !== 0) {
            emitter.emit(events.CANCLE_COLLECT_ANIMATION);
          }
        });
      },
    });
  };

  /**
  * 更新首屏运营数据
  */
  public updateFSData = async (): Promise<void> => {
    try {
      const { opInfos = [], dynamicTabs } = await getFSData(true);
      this.jumpSpecifyTabPageView(dynamicTabs);
      const shownPop = getFSPopPresenter().updateFSPopData(opInfos);
      addKeylink(`本次获取到的弹窗类型为：${shownPop.type}`);

      if (!shownPop) return;
      if (shownPop.type === OpInfoType.OP_HALF_WEBVIEW) {
        emitter.emit(events.HALF_WEBVIEW_RESET_STATUS);
      }
      this.setState({
        shownPop,
        forceCloseBtmBanner: false,
      });
      this.checkAndToggleWelfarePendant();
    } catch (err) {
      logError(err, `${TAG}.updateFSData`);
    }
  };

  public async componentDidMount() {
    // 初始化数据
    this.globalConf.style.loadFirstFrameStyle();
    FeedsTheme.changeSkinMode(this.props.qbConfig.skinMode);
    FeedsConst.initGlobalConf(this.globalConf);
    addKeylink(`didMount, isTopTab=${isTopTab()}`, TAG);

    try {
      const { guid, qua2 } = await getDeviceVisitor().isReady();
      setEnvInfo({ guid, qua: qua2 });

      // 首屏日志上报
      logFirstScreen();
    } catch (err) {
      logError(err, 'FeedsHomePage.didMount');
    }

    if (!isTopTab()) {
      this.initFSData();
      addFSRetryObserver(this.retryFSDataSuccHandler);
    }
  }

  /** 首屏数据初始化 */
  public initFSData = async () => {
    try {
      const { dynamicTabs = [], activeTab } = await getFSData() || {};
      this.activeTabId = activeTab?.tabId;
      // 统计用户应该定位tab的量级
      addKeylink(`initFSData-activeTabId-${this.activeTabId}`, KeylinkCmd.PR_INFO_SUM);
      // 渲染动态tab并执行指定tab跳转
      this.jumpSpecifyTabPageView(dynamicTabs, activeTab);
      this.fsDataHandler();

      // 地址改变，数据改变
      getLocation().onChange(this.updateFSData);
    } catch (error) {
      logError(error, 'FeedsHomePage.initFSData');
    }
  };

  /**
  * 首屏数据成功后的处理
  */
  public fsDataHandler = async () => {
    try {
      const { WCUserStatus = {}, opInfos } = getFSDataSync() || {};
      // 更新福利入口
      this.setWCUserStatus(WCUserStatus);
      // 初始化运营弹窗数据
      await getFSPopPresenter().initFSPopData(opInfos);
      const redDotPresenter = getRedDotPresenter();
      // 更新数字红点
      const redDotConfig = await redDotPresenter.getRedDotConfig();
      const isRedDotShow = redDotPresenter.enableRedDotShow(redDotConfig);
      /** 如果命中新样式 不展示红点 */
      addKeylink(`fsDataHandler(), 是否支持展示红点${isRedDotShow}， 当前红点数为${redDotConfig.updateNum}`, TAG);
      this.setState({
        redDotCnt: isRedDotShow ? redDotConfig.updateNum : 0,
      });
    } catch (err) {
      logError(err, 'FeedsHomePage.fsDataHandler');
    }
  };

  /**
   * 首屏接口重试成功后的处理
   * @param fsData 重试成功后的首屏数据
   */
  public retryFSDataSuccHandler = (fsData) => {
    const { dynamicTabs, WCUserStatus = {} } = fsData || {};
    updateTabList(dynamicTabs);
    this.setState({
      tabList: getTabList(),
    }, () => {
      if (this.selectedIndex !== 1) {
        setTimeout(() => {
          this.setPageIndexView(this.selectedIndex);
        }, 0);
      }
      // 更新福利入口
      this.setWCUserStatus(WCUserStatus);
    });
  };

  /**
   * 跳转到指定的tabid的pageview
   */
  public jumpSpecifyTabPageView = (dynamicTabs: DynamicTabItem[], activeTab?: ActiveTab) => {
    if (!dynamicTabs.length) {
      addKeylink('[jumpSpecifyTabPageView] dynamicTabs is empty!');
      return;
    }
    updateTabList(dynamicTabs);
    this.setState(
      {
        tabList: getTabList(),
      },
      () => {
        try {
          // 上报当前tabxList的所有id
          const { tabList = [] } = this.state;
          reportUDS(BusiKey.EXPOSE__TAB_LIST_RENDER, this.props, {
            ext_data1: (tabList || []).map(item => item.tabId).join(','),
          });
          const tabIdParam = getTabIdParam();
          const curTabId = tabIdParam || activeTab?.tabId || this.state.curTabId;
          const hasTabChange = curTabId !== this.state.curTabId;
          activeTab && addKeylink(`fs-jump-curTabId-${curTabId}`, KeylinkCmd.PR_INFO_SUM);
          if (hasTabChange) {
            // 这里要兼容一下老用户tabID还是用iId的情况
            const index = this.state.tabList.findIndex(tab => tab.tabId === curTabId || (tab as any).iId === curTabId);
            addKeylink(
              `要跳转的tabId: ${curTabId}, 在最终tabList索引值: ${index}`,
              TAG,
            );
            this.isRefreshChangeTab = true;
            this.setPageIndexView(index, true);
          }
        } catch (error) {
          logError(error, 'FeedsHomePage.jumpSpecifyTabPageView');
        }
      },
    );
  };

  public initTab = (tabList: DynamicTabItem[], activeTabId: TabId) => {
    reportBeacon(TechKey.EXPOSE__PAGE_REAL_PV, { tabId: activeTabId });
    reportUDS(BusiKey.ENTER__PAGE_INIT, { tabId: activeTabId });

    strictExposeReporter.setCurrentReporter(activeTabId);
    this.activeTabId = activeTabId;
    this.setState({
      curTabId: activeTabId,
      tabList,
      isTabInit: true,
    });
    this.lstTabId = this.state.curTabId;

    // 预加载tab头部背景图片
    getTabpageBackgroundManager().prefetchTabBgImage(tabList);
  };

  /** 更新福利入口 */
  public setWCUserStatus = (WCUserStatus = {} as any) => {
    const { visible = false, prize = false, url = '', readTime = 0 } = WCUserStatus;
    if (visible) {
      reportUDS(BusiKey.EXPOSE__WELFARE_CENTER_ICON);
    }
    this.setState({
      welfareVisible: visible,
      welfarePrize: prize,
      welfareUrl: url,
    });
    if (url !== '' && readTime !== 0) {
      reportUDS(BusiKey.EXPOSE__WELFARE_BUBBLE_TIME_ICON);
    }
    FeedsConst.setGlobalConfKV('welfareTime', {
      url,
      time: readTime,
    });
  };

  /** 切换到下一个优先级弹窗 */
  public changePopPriorityShow = () => {
    this.setState({
      shownPop: getFSPopPresenter().changeToNextPriority(),
    });
    this.checkAndToggleWelfarePendant();
  };

  public componentWillUnmount() {
    if (!isTopTab()) {
      getLocation().removeChange(this.defaultUrlListener);
      getLocation().removeChange(this.updateFSData);
      removeFSObserver(this.handleFSRendered);
      removeFSRetryObserver(this.retryFSDataSuccHandler);
      removeFSPopReadyObserver(this.fsPopReadyListener);
    }
  }

  public onDestroy() {
    addKeylink('onDestroy() enter', TAG);
    if (this.skinListener) {
      QBBrowserObserver.removeListener('skinChanged', this.skinListener);
    }
    if (this.accountListener) {
      QBBrowserObserver.removeListener('accountChanged', this.accountListener);
    }
    if (this.screenOrientationChange) {
      QBBrowserObserver.removeListener('screenOrientationChanged', this.screenOrientationChange);
    }
    if (this.lifecycleListener) {
      this.lifecycleListener.remove();
      activeEventObserver.removeEventObserver();
    }
    if (this.lifecycleIframeListener) {
      this.lifecycleIframeListener.remove();
      activeEventObserver.removeEventObserver();
    }
    if (this.optListener) {
      this.optListener.remove();
    }
    this.wifiConnStateListener && QBBrowserObserver.removeListener('wifiConnStateChange', this.wifiConnStateListener);

    this.splashStateListener && QBBusinessADModule.removeSplashStateChangeListener(this.splashStateListener);

    if (this.sizeChangedListener) {
      QBBrowserObserver.removeListener('onSizeChanged', this.sizeChangedListener);
    }

    if (this.firstViewListener) {
      this.firstViewListener.remove();
    }
    // 销毁实例时，重置当前实例标记
    FeedsConst.setGlobalConfKV('hasBarRedPointExist', false);
  }

  public setDeviceIds = () => {
    if (Platform.OS === 'android') {
      if (Object.keys(this.globalConf.idInfo || {}).length > 0) return;
      this.deviceTimer = setTimeout(() => {
        try {
          Object.assign(this.globalConf.timeCost, {
            setDeviceIdsStart: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
          });
          Promise.all([QBDeviceModule.getQADID(), QBDeviceModule.getTAID(), QBDeviceModule.getOAID()])
            .then((results) => {
              results.forEach((item) => {
                this.globalConf.idInfo = { ...this.globalConf.idInfo, ...item };
              });
              clearTimeout(this.deviceTimer);
            })
            .catch((err) => {
              logError(err, 'FeedsHomePage.setDeviceIds');
            });
        } catch (err) {
          logError(err, 'FeedsHomePage.setDeviceIds2');
        }
      }, 100);
    }
  };

  public updateInfo = async () => {
    try {
      this.globalConf.deviceInfo = await QBDeviceModule.getDeviceInfo();
      this.globalConf.accountInfo = await QBAccountModule.getAccountInfo();
      this.globalConf.connectInfo = await QBWifiModule.getConnectedAp();
      updateUserInfo(this.globalConf.accountInfo);
    } catch (e) {
      logError(e, 'FeedsHomePage.updateInfo');
    }
  };

  public initListenEvent = () => {
    if (this.hasInitEvent) return;
    this.hasInitEvent = true;
    // feeds postMessage
    this.postMessageListener = QBDeviceEventEmitter.addListener(
      FeedsEventHub.event.postMessage,
      this.handlePostMessage,
    );

    this.lifecycleIframeListener = QBDeviceEventEmitter.addListener(FeedsEventHub.event.call, this.handleIframeCall);

    this.lifecycleListener = QBDeviceEventEmitter.addListener(FeedsEventHub.event.lifecycle, this._onlifecycleChanged);
    this.optListener = QBDeviceEventEmitter.addListener(FeedsEventHub.event.opt, this._optListener);
    this.accountListener = QBBrowserObserver.addListener('accountChanged', this._onAccountChanged);
    this.skinListener = QBBrowserObserver.addListener('skinChanged', this._onSkinChanged);
    this.sizeChangedListener = QBBrowserObserver.addListener('onSizeChanged', () => {
      this.onSizeChanged();
    });
    this.wifiConnStateListener = QBWifiModule.addEventListener('wifiConnStateChange', this._handleWifiConnStateChange);

    /** 监听闪屏，处理闪屏事件 */
    /** 开启闪屏结束定时器，在指定时间之后，如果还没有收到终端闪屏结束事件，则自动将闪屏的状态置为结束 */
    getFSPopPresenter().startSplashEndTimer();
    QBBusinessADModule.checkIsSplashViewShowing().then((hasSplash: boolean) => this.handleSplashEvent(hasSplash));

    /** 添加首屏数据渲染完成的监听事件 */
    addFSObserver(this.handleFSRendered);

    /** 添加首屏弹窗可以弹出的监听事件 */
    addFSPopReadyObserver(this.fsPopReadyListener);

    setTimeout(() => {
      asyncCall(async () => {
        try {
          await this.updateInfo();
          if (this.props.firstInstallTime) {
            FeedsUtils.setAppInstallTime(this.props.firstInstallTime);
          }
          if (this.props.lastUpdateTime) {
            FeedsUtils.setAppUpdateTime(this.props.lastUpdateTime);
          }
          if (Platform.OS === 'ios') {
            // ios终端没有透传时间，这里自己处理
            const { startUpType } = this.globalConf;
            const nowTime = Date.now();
            if (startUpType === 1) {
              //  1首次安装 2升级安装
              FeedsUtils.setAppInstallTime(nowTime);
              this.globalConf.appInstallTime = nowTime;
            }
            if (startUpType === 2) {
              FeedsUtils.setAppUpdateTime(nowTime);
              this.globalConf.appUpdateTime = nowTime;
            }
          }
          if (!this.props.firstInstallTime) {
            const appInstallTime = await FeedsUtils.getAppInstallTime();
            if (appInstallTime) {
              this.globalConf.appInstallTime = appInstallTime;
            }
          }

          if (!this.props.lastUpdateTime) {
            const appUpdateTime = await FeedsUtils.getAppUpdateTime();
            if (appUpdateTime) {
              this.globalConf.appUpdateTime = appUpdateTime;
            }
          }
          this.globalConf.transitionAnim = await StorageUtils.getItem(`${FeedsEventHub.event.moduleName}:transitionAnim`);
          this.afterGetGlobalConf(); // 处理需要更新globalConf之后的事物
        } catch (e) {
          logError(e, 'FeedsHomePage.asyncCall');
        }
      });
    }, 0);
  };

  // 处理消息通知
  public handlePostMessage = (result) => {
    const currentId = getFixedTabId(result.tabId);
    if (currentId === this.state.curTabId) {
      switch (result.action) {
        case FeedsEventHub.opt.listViewRefresh:
          this.handleTabRefresh(currentId);
          break;
        default:
          break;
      }
    }
  };

  public handleIframeCall = (result) => {
    const bundle = Platform.OS === 'android' ? result.params[0].data : result.params.data;
    this._onlifecycleChanged?.(bundle);
  };

  // tab刷新
  public handleTabRefresh = (curTabId) => {
    const ref = this.getFeedsListRef(curTabId);
    if (ref) {
      const qblistviewRefreshType = this.globalConf.isKingCardUser ? 3 : 1;
      ref.startRefresh?.(qblistviewRefreshType);
    }
  };

  // 处理需要更新globalConf之后的事物
  public afterGetGlobalConf = () => {
    // 配置上报的user
    addKeylink(`afterGetGlobalConf, style=${this.globalConf.style.version}`, TAG); // 延后获取 避免-1
  };

  public onSizeChanged = () => {
    const { curTabId } = this.state;
    const curRef = this.refs[`feeds_${curTabId}`] as any;
    if (curRef) {
      curRef.resize?.();
    }
  };

  /**
   * 根据tabId执行onLoadUrl
   * @param params
   */
  public doLoadUrlTabId = (urlParams) => {
    const self = this;
    const { currentId } = urlParams;
    const { tabList, curTabId: prevCurTabId } = self.state;
    const tabIdFromParam = currentId && parseInt(currentId, 10);
    const curTabId = tabIdFromParam || prevCurTabId;
    FeedsConst.setGlobalConfKV('SELECT_TAB_PAGEID', `${curTabId}`);
    addKeylink(`doLoadUrlTabId(), curTabId=${curTabId}, param.currentId=${tabIdFromParam}, prevCurTabId=${prevCurTabId}`, TAG);
    this.globalConf.urlParams = urlParams;
    const curTabIdIndex = tabList.findIndex(item => item.tabId === curTabId);
    if (curTabIdIndex === -1) return;
    const change = curTabId !== prevCurTabId || curTabIdIndex === -1;
    addKeylink(`setState(curTabId: ${curTabId}), change: ${change}`, TAG);
    self.setState({ curTabId }, () => {
      if (change) {
        // 这里因为是纯粹切换tab，没有涉及tab的改变，所以这里去掉setTimeout
        if (curTabIdIndex > -1) {
          this.isRefreshChangeTab = true;
          addKeylink(`通过地址执行跳转, tabId=${curTabId}`, TAG);
          self.setPageIndexView(curTabIdIndex);
        }
      }
    });
  };

  /**
   * ˙执行onLoadUrl
   * CR: 备注一下, 这种意大利面条式的代码必须重构
   * @param bundle
   * @param params
   * @param mode
   */
  public doOnloadUrl = (bundle, params, mode) => {
    const self = this;
    this.globalConf.pageUrl = bundle.url;
    if (params.ch) bundle.channel = params.ch;
    if (params.scenes) {
      bundle.scenes = params.scenes;
    } else if (params.ch === '007701') {
      // wifi管家渠道号
      bundle.scenes = 1;
    }
    if (params.tabId) {
      const { tabId } = params;
      bundle.tab_id = tabId;
      // 从资讯正文页框架跳转到小说tab时候需要上报一下，渠道号是004535  at 18/11/08
      let channelId = params.ch || '004535';
      if (channelId === '007701') {
        // 只对wifi管家渠道号进行重置
        channelId = '004535';
      }
      params.refresh = true; // 小说频道需局部刷新且到顶部
    }

    if (params.refresh) {
      global.shouldTabRefreshDirect = true;
    }

    if (params.tabid) bundle.tab_id = params.tabid;
    if (params.refresh) bundle.refresh = params.refresh;
    bundle.tab_id = params.currentId === TabId.BOTTOM_RECOMM1 ? TabId.BOTTOM_RECOMM2 : params.currentId;

    // 内容闪屏feeds推送
    if (params.flashid) {
      bundle.flashId = params.flashid;
    }

    const reportParam: any = {
      eventName: 'MTT_STAT_FEEDS_DOCID_RECOMM',
      actionID: '3',
      isRealTime: true,
    };

    if (params.clickUrl && params.expUrl && params.docId) {
      bundle.growExt = {
        docId: params.docId,
        clickUrl: params.clickUrl,
        exposeUrl: params.expUrl,
      };
      Object.assign(reportParam, {
        docID: params.docId,
      });
    }

    if (params.taglist) {
      let tagList = '';
      try {
        tagList = decodeURIComponent(`${params.taglist}`);
        // 给业务分配的策略id
      } catch (err) {
        logError(err, 'FeedsHomePage.doOnloadUrl');
      }
      if (tagList) {
        bundle.tagList = tagList;
        Object.assign(reportParam, {
          taglist: tagList,
        });
      }
    }
    const args = { tabId: bundle.tabId };
    bundle.onloadUrlMode = mode;
    FeedsAbilities.getWifiInfo(args).then((p) => {
      bundle.extParam = p;
      self.handleAllTabOpt(bundle);
    });
  };

  /**
   * opt事件监听
   * @param bundle
   * @returns {Promise<void>}
   * @private
   */
  public _optListener = async (bundle) => {
    if (!bundle.type) {
      return;
    }
    switch (bundle.type) {
      case FeedsEventHub.opt.onLoadUrl: {
        this.onLoadUrlListener(bundle);
        break;
      }
      /**
       * 响应 onTabRefresh 事件，更新指定的 Tab 内容
       */
      case FeedsEventHub.opt.onTabRefresh: {
        this.onTabRefreshListener(bundle);
        return;
      }
      /** 响应queryTabExist */
      case FeedsEventHub.opt.queryTabExist: {
        this.queryTabExistListener(bundle);
        return;
      }
      case FeedsEventHub.opt.onTypelogError: {
        break;
      }
      default:
    }
  };

  /**
   * 设置tab的索引位置
   * 首屏接口失败重试后，Android不需要延时，但是冷启动需要
   * @param curTabIdIndex 索引
   * @param isDelay 针对Android是否延时执行
   */
  public setPageIndexView = (curTabIdIndex: number, isDelay = false) => {
    const qbtabhost: any = this.refs.qbtabhost;
    if (isDelay) {
      this.clickTabTimer && clearTimeout(this.clickTabTimer);

      // 如果用户有过tab主动点击，则不再执行自动切换tab
      if (isTabClicked()) return;

      if (this.loadUrlFlag || (Date.now() - global.enterTime) >= 1000) {
        qbtabhost?.setPageWithoutAnimation(curTabIdIndex);
        this.clickTabTimer = setTimeout(() => {
          qbtabhost?.updateTabView?.();
        }, 50);
      } else {
        // 初始化未完成时延迟处理消息，避免初始化的加载tab和此次url加载tab时序异常导致冲突
        const waitTime = isDelay ? 1000 : 1000 - (Date.now() - global.enterTime);
        this.clickTabTimer = setTimeout(() => {
          qbtabhost?.setPageWithoutAnimation(curTabIdIndex);
          setTimeout(() => {
            qbtabhost?.updateTabView?.();
            this.loadUrlFlag = true;
          }, 50);
        }, waitTime);
      }
    } else {
      qbtabhost?.setPageWithoutAnimation(curTabIdIndex);
    }
  };

  public _onSkinChanged = (args) => {
    FeedsTheme.changeSkinMode(args.state);
    this.setState({ skinMode: args.state });
    this.switchTabPageBgImage();
  };

  public _onlifecycleChanged = (bundle) => {
    if (bundle) {
      switch (bundle.type) {
        case FeedsEventHub.lifecycle.active: {
          // 触发active响应事件
          activeEventObserver.emitEvent();
          if (this.statUsingTimeTimer) {
            clearInterval(this.statUsingTimeTimer);
          }
          this.statUsingTimeTimer = setInterval(
            () => reportUDS(
              BusiKey.READ_DURATION__STAT_USING_TIME_BY_STEP,
              { tabId: this.globalConf.SELECT_TAB_PAGEID || this.globalConf.curTabId },
              { act_duration: transTimeToSeconds(STAT_USING_TIME_STEP) },
            ),
            STAT_USING_TIME_STEP,
          );
          this.globalConf.pageActive = true;
          this.globalConf.initActive = true;
          // 每次active需要更新下一跳状态为初始态
          this.globalConf.toPageModule = PageModule.UnKnow;
          asyncCall(async () => {
            try {
              await this._onActive();
            } catch (err) {
              logError(err, 'FeedsHomePage._onlifecycleChanged');
            }
            this.handleCurTabLifeCycle(bundle);
          });

          const now = +new Date();
          const updateInterval = now - this.updateTabsTime;

          if (updateInterval >= ON_ACTIVE_TAB_UPDATE_INTERVAL) {
            this.updateTabsTime = now;
          }
          const exposedInterval = now - this.exposedReportTime;

          if (exposedInterval >= ON_ACTIVE_TAB_EXPOSED_INTERVAL) {
            if (this.refs.qbtabhost) {
              (this.refs.qbtabhost as any).doTabExposed();
              this.exposedReportTime = now;
            }
          }

          this.setState({
            isPageActive: true,
          });

          // QB 切换模式的时候需要触发一次背景设置
          this.switchTabPageBgImage();

          // 福利挂件check
          this.checkAndToggleWelfarePendant();

          break;
        }
        case FeedsEventHub.lifecycle.deactive:
          // 触发active响应事件
          deActiveEventObserver.emitEvent();
          this.globalConf.pageActive = false;
          this.globalConf.initActive = false;
          this.handleCurTabLifeCycle(bundle);
          this._deactive();
          this.setState({
            isPageActive: false,
          });
          flushKeylinks();
          break;

        case FeedsEventHub.lifecycle.stop:
          this.handleCurTabLifeCycle(bundle);
          break;

        case FeedsEventHub.lifecycle.start:
          this.handleCurTabLifeCycle(bundle);
          break;

        case FeedsEventHub.lifecycle.destroy:
          this.globalConf.pageActive = false;
          this.globalConf.initActive = false;
          this.handleCurTabLifeCycle(bundle);
          this.setState({
            isPageActive: false,
          });
          this.onDestroy();
          break;

        case FeedsEventHub.lifecycle.reload:
          this.handleCurTabLifeCycle(bundle);

          break;
        case FeedsEventHub.lifecycle.clearcache:
          this.handleAllTabLifeCycle(bundle);
          break;

        case FeedsEventHub.lifecycle.screenOff:
          this.globalConf.pageActive = false;
          this.globalConf.initActive = false;
          this.setState({
            isPageActive: false,
          });
          break;
        case FeedsEventHub.lifecycle.onToPage:
          this.handleCurTabLifeCycle(bundle);
          break;
        default:
      }
    } else if (bundle && this.primaryKey !== bundle.primaryKey) {
      switch (bundle.type) {
        case FeedsEventHub.lifecycle.instantiated: {
          // 安卓新建多窗口实例时，停止其他实例定时器，并重置底bar红点出现标记（新建多窗口，底bar红点默认消除）
          FeedsConst.setGlobalConfKV('hasBarRedPointExist', false);
          break;
        }
      }
    }
  };

  public handleCurTabLifeCycle = (lifeBundle) => {
    const curRef = this.getFeedsListRef(this.state.curTabId, false);
    if (curRef) {
      curRef._onlifecycleChanged?.(lifeBundle);
    }
  };

  public onTabScroll = () => {
    this.setFeedsActiveInit('onTabScroll');
  };

  // 有操作的时候设置为active， 用来规避闪屏之类
  public setFeedsActiveInit = (reference) => {
    if (this.setFeedsActiveFlag) {
      return;
    }
    if (reference === 'doScrollForReport' && Platform.OS === 'android') {
      // android 首次的滚动 也会触发2次 所以屏蔽前两次
      if (!this.setFeedsActiveCount || this.setFeedsActiveCount < 2) {
        this.setFeedsActiveCount = parseInt(this.setFeedsActiveCount || 0, 10) + 1;
        return;
      }
    }
    this.setFeedsActiveFlag = true;
  };

  public showInitiativeFeedBack = () => {
    if (!this.initiativeFeedBack) return;
    QBSharedSettingModule.readSettings(['infocontent_stay_time']).then((result) => {
      if (
        result
        && result.infocontent_stay_time.consumeTime < 5000
        && result.infocontent_stay_time.expireTime > +new Date()
      ) {
        AsyncStorage.getItem(`${FeedsEventHub.event.moduleName}:LAST_CLICKED_GRAPHIC_ITEM_ID`).then((res) => {
          if (res) {
            res = JSON.parse(res);
            QBDeviceEventEmitter.emit('SHOW_INITIATIVE_FEEDBACK', { item_id: res.item_id });
          }
        });
      }
    });
  };

  public _onActive = async () => {
    const tabId = this.globalConf.SELECT_TAB_PAGEID || this.globalConf.curTabId;
    reportBeacon(TechKey.EXPOSE__PAGE_EXPOSE_PV, { tabId });
    reportUDS(BusiKey.EXPOSE__PAGE_ACTIVE, { tabId });

    (this.refs.qbtabhost as any)?.doTabExposed(); // 触发上报
    this.updateInfo();
    if (!this.initiativeFeedBack) {
      AsyncStorage.getItem(`${FeedsEventHub.event.moduleName}:LAST_CLICKED_GRAPHIC_ITEM_ID`).then((result) => {
        if (result) {
          result = JSON.parse(result);
          if (result.expireTime > +new Date()) {
            this.initiativeFeedBack = true;
            this.showInitiativeFeedBack();
          } else {
            this.initiativeFeedBack = false;
          }
        } else {
          this.initiativeFeedBack = false;
        }
      });
    } else {
      this.showInitiativeFeedBack();
    }
  };

  public _deactive = () => {
    if (this.statUsingTimeTimer) {
      clearInterval(this.statUsingTimeTimer);
    }
    this.globalConf.leaveTime = +new Date();
    AsyncStorage.setItem(`${MODULE}:leaveTime`, JSON.stringify(this.globalConf.leaveTime));
  };

  public _onAccountChanged = async (args: Record<string, any>): Promise<void> => {
    if (args) {
      if (!this.tabHostFlag) {
        // 目前无tab列表时，只有推荐tab，此时不需要检查关注tab
        return;
      }
      // 填入globalConf,更新userInfo
      updateUserInfo(args);
      this.globalConf.accountInfo = args;
      getUserVisitor().updateUserInfo(args as any);
    }
  };

  public _handleWifiConnStateChange = (args) => {
    if (args) {
      this.globalConf.connectInfo = args;
    }
  };

  public updateSelectedIndex = (tabs, curTabId) => {
    let selectedIndex = tabs.findIndex(item => item.tabId === curTabId);
    selectedIndex = selectedIndex > -1 ? selectedIndex : 1; // 默认跳推荐
    this.selectedIndex = selectedIndex;
  };

  public getFeedsListRef = (tabId, feedList = true) => {
    const curFeedsRef = this.refs[`feeds_${tabId}`];
    if (!feedList) return curFeedsRef;

    if (curFeedsRef) {
      return curFeedsRef.getQbListViewRef?.();
    }
    return null;
  };

  /**
   * 处理tab点击, feedsView返回相应节点，其余类型触发组件刷新
   */
  public tabClick = (index: number): void => {
    const now = +new Date();
    const canRefresh = !this.lastClickTabTime || now - this.lastClickTabTime > 1000;
    addKeylink(`tabClick(), 是否满足startRefresh: ${canRefresh}`, TAG);
    if (canRefresh) {
      const { tabList } = this.state;
      const currentTab = tabList[index] || {};
      const { tabType, tabId } = currentTab;
      // 判断是否是feeds节点
      let isFeedList = true;
      if (tabType === DynamicTabType.hippyview || tabType === DynamicTabType.webview) isFeedList = false;
      const ref = this.getFeedsListRef(tabId, isFeedList);
      const qblistviewRefreshType = this.globalConf.isKingCardUser ? 3 : 1;
      addKeylink(`tabClick(), ${JSON.stringify({ tabId, tabType, isFeedList, qblistviewRefreshType })}`, TAG);
      if (ref) {
        switch (tabType) {
          case DynamicTabType.feedsview:
            ref.startRefresh?.(qblistviewRefreshType);
            this.lastClickTabTime = now;
            return;
          case DynamicTabType.hippyview:
            ref.startRefresh?.();
            return;
          case DynamicTabType.webview:
            ref.startRefresh?.();
            return;
          default:
            return;
        }
      }
    }
  };

  // 只处理 1当前tab的重复点击逻辑 2红点消失的逻辑
  public handleTabClick = (index) => {
    // 记录tab主动点击
    recordTabClicked();

    if (typeof index === 'object') {
      index = index.position;
    }

    const { tabList } = this.state;
    const tabInfo = tabList[index];
    const { tabId } = tabInfo;
    addKeylink(`handleTabClick(), tabId:${tabId}, index=${index}, tabInfo: ${!!tabInfo}`, TAG);
    FeedsConst.setGlobalConfKV('SELECT_TAB_PAGEID', tabId);
    if (!tabInfo) return;

    const curTabId = tabId;

    // 点击二级菜单，底部运营栏消失
    this.onClickHomePage();
    addKeylink(`判断点击的是当前Tab吗: ${this.lstTabId === curTabId}, TabId: ${curTabId}`, TAG);
    if (this.lstTabId === curTabId) {
      this.tabClick(index);
    } else {
      strictExposeReporter.setCurrentReporter(curTabId);
      this.isTabClicking = true;
      this.reportTabShowChannel(curTabId);
      if (Platform.OS === 'ios' && this.refs.qbtabhost) this.refs.qbtabhost.scrollTo(index, true);
    }

    // IOS冷启动，快速点击圈子tab，会导致圈子tab白屏。原因是handleSwitchChange应该有两次回调，一次是tabhost初始化回调，一次是点击tab的回调
    this.setFeedsActiveInit('onTabClick');
  };

  // 清除红点
  public cancelRedDot = async (curTabId) => {
    try {
      const { redDotCnt } = this.state;
      if (curTabId === TabId.SHELF && redDotCnt > 0) {
        reportUDS(BusiKey.CLICK__BOOK_SHELF_RED_DOT);
        getRedDotPresenter().cancelRedDot();
        this.setState({
          redDotCnt: 0,
        });
        addKeylink('cancelRedDot(), 清除红点成功', TAG);
      }
    } catch (e) {
      addKeylink('cancelRedDot(), 清除红点报错', TAG);
      logError(e, 'FeedsHomePage.cancelRedDot');
    }
  };

  // 上报tab曝光渠道情况
  public reportTabShowChannel = (curTabId) => {
    if (this.reportTabShowChannelTimer) clearTimeout(this.reportTabShowChannelTimer);
    this.reportTabShowChannelTimer = setTimeout(() => {
      clearTimeout(this.reportTabShowChannelTimer);
      this.reportTabShowChannelTimer = 0;
      reportUDS(BusiKey.EXPOSE__TAB_PAGE, {}, { tab_id: curTabId });
    }, 100);
  };

  /**
   * 频道切换
   * @param index
   * @constructor
   */
  public OnTabChangeEnd = (index) => {
    if (typeof index === 'object') {
      index = index.position;
    }
    const { tabList } = this.state;
    if (!tabList[index]) {
      return;
    }
    clearTimeout(this.tabChangeEndTimer);
    this.tabChangeEndTimer = setTimeout(() => {
      this.isPreloadSiblings = true;
      this.forceUpdate(() => {
        this.isPreloadSiblings = false;
      });
    }, 80);
  };

  /**
   * 整个重点逻辑解析
   * 1 每次构建QBTabHost，会回调一下这个逻辑
   * 2 滑动切换tab，会回调这里
   * 3 点击tab分两种，一种点击非当前，先回调handleTabClick，再回调这里，一种点击当前，不会回调这里
   * 4 红点消除
   * 5 底部运营栏隐藏
   * */
  public handleSwitchChange = (index) => {
    if (typeof index === 'object') {
      index = index.position;
    }
    const { tabList } = this.state;
    if (!tabList[index]) {
      // 越界了啥都不干
      return;
    }
    const curTabId = tabList[index].tabId;

    // 首屏渲染之后tabid的改变是人为改变 应该上报一下
    if (isFSRendered()) {
      reportUDS(BusiKey.CLICK__TAB_PAGE, {}, { tab_id: curTabId });
    }
    FeedsConst.setGlobalConfKV('SELECT_TAB_PAGEID', curTabId);

    strictExposeReporter.setCurrentReporter(curTabId);

    this.isPreloadSiblings = curTabId === this.state.curTabId;
    if (!this.isTabClicking) {
      clearTimeout(this.tabExposureTimer);
      this.tabExposureTimer = setTimeout(() => {
        this.reportTabShowChannel(curTabId);
      }, 1000);
    }

    // 非首屏触发时上报
    if (isFSRendered()) {
      reportUDS(BusiKey.CLICK__TAB_SWITCH, { tabId: curTabId }, { ext_data1: !this.isTabClicking ? 1 : 2 });
    }

    this.isTabClicking = false;

    // IOS的handleSwitchChange回调不稳定啊。这真的很令人尴尬。
    const oldLstTabId = this.lstTabId;
    this.setState({ curTabId }, () => {
      this.handleSwitchTabLifeCycle(curTabId, oldLstTabId);
      // 切换成功
      this.lstTabId = this.state.curTabId;
    });

    this.switchTabPageBgImage();

    // tab时长统计
    this.cancelRedDot(curTabId); // 红点消除

    // 如果不是从url进入自动切换tab，底部运营栏隐藏
    if (!this.isRefreshChangeTab && oldLstTabId !== this.lstTabId) {
      this.hideBottomBanner();
    } else {
      this.isRefreshChangeTab = false;
    }

    // 福袋展示check
    this.checkAndToggleWelfarePendant();
  };

  public handleSwitchTabLifeCycle = (curTabId, oldLstTabId) => {
    // 通知之前的tab deactive
    this.handleLstTabDeactive(oldLstTabId);
    // 通知现在的tab active
    this.handleCurTabActive(curTabId);
  };

  // 这个方法目前只能被tab切换调用到，因为subType写死了。
  public handleCurTabActive = (curTabId) => {
    this.globalConf.curTabId = curTabId;
    const curRef = this.getFeedsListRef(curTabId, false);
    if (curRef) {
      const bundle = {
        id: '1',
        tabId: curTabId,
        type: FeedsEventHub.lifecycle.active,
        subType: FeedsEventHub.activeSubType.tab,
      };
      curRef._onlifecycleChanged?.(bundle);
    }
  };

  public handleAllTabLifeCycle = (lifeBundle) => {
    const self = this;
    this.state.tabList?.forEach((item) => {
      const curRef = self.getFeedsListRef(item.tabId, false);
      if (curRef) {
        curRef._onlifecycleChanged?.(lifeBundle);
      }
    });
  };

  public handleAllTabOpt = (optBundle) => {
    const self = this;
    this.state.tabList?.forEach((item) => {
      const curRef = self.getFeedsListRef(item.tabId, false);
      if (curRef) {
        curRef._optListener?.(optBundle);
      }
    });
  };

  public handleLstTabDeactive = (lstTabId) => {
    const lstRef = this.getFeedsListRef(lstTabId, false);
    if (lstRef) {
      const bundle = {
        id: '1',
        tabId: lstTabId,
        type: FeedsEventHub.lifecycle.deactive,
        subType: FeedsEventHub.activeSubType.tab,
      };
      lstRef._onlifecycleChanged?.(bundle);
    }
  };

  public getFeeds = (idx, tabId, selectedIndex, tabInfo, tabHeight) => {
    const { tabList } = this.state;

    let isTabChange = false;
    let rst = <View key={`feeds_${tabId}_${idx}`} />;

    const preIdx = selectedIndex > 0 ? selectedIndex - 1 : 0;
    const nextIdx = selectedIndex < tabList.length - 1 ? selectedIndex + 1 : selectedIndex - 2;

    if (idx === selectedIndex && this.isTabChange) {
      isTabChange = true;
      this.isTabChange = false;
    }
    const { tabType } = tabInfo;
    if (!tabType) return rst;

    let renderIndexArr = [selectedIndex, preIdx, nextIdx];
    if (isTopTab()) {
      renderIndexArr = [0];
    }
    renderIndexArr.forEach((item) => {
      const tabItem = tabList[item];
      if (tabItem && !this.hasInitTabArr.includes(tabItem.tabId) && selectedIndex === item) {
        this.hasInitTabArr.push(tabItem.tabId);
      }
      if (isTopTab() && this.hasInitTabArr.includes(tabItem.tabId)) {
        this.hasInitTabArr.push(tabItem.tabId);
      }
    });
    const tabKey = `${tabId}_${idx}_${this.mContainerHeight}`;
    if (this.feedsListRefs[tabKey]) {
      rst = this.feedsListRefs[tabKey].list;
    } else if (this.hasInitTabArr.includes(tabId)) {
      const tabItem = tabList[idx];
      rst = this.getFeedsItem(tabType, tabItem, tabId, idx, isTabChange, tabHeight);
      Object.keys(this.feedsListRefs).forEach((key) => {
        const keyValue = key.split('_');
        // 删除重复项
        if (keyValue[0] === tabId) {
          delete this.feedsListRefs[key];
        }
      });
      this.feedsListRefs[tabKey] = { list: rst };
    }
    return rst;
  };

  public getFeedsItem = (type, item, tabId, idx, isTabChange, tabHeight) => {
    switch (type) {
      case TabModelType.FEEDS_VIEW:
        return this.renderFeedsPageView(item, tabId, idx, isTabChange);
      case TabModelType.WEB_VIEW:
        return this.renderWebPageView(tabId, idx, tabHeight, item.webViewUrl);
      // case TabModelType.HIPPY_VIEW:
      //   return this.renderHippyPageView(tabId, idx);
      default:
        return this.renderFeedsPageView(item, tabId, idx, isTabChange);
    }
  };

  public renderWebPageView = (tabId, idx, tabHeight, url) => (
    <WebView
      ref={`feeds_${tabId}`}
      key={`feeds_${tabId}_${idx}`}
      tabId={tabId}
      width={ConstantUtils.getScreenWidth()}
      height={this.mContainerHeight - tabHeight}
      url={url}
    />
  );

  public renderFeedsPageView = (item, tabId, idx, isTabChange) => {
    const { curTabId, refreshNum } = this.state;
    const { qbId, primaryKey } = this.props;
    return (
      <FeedsPageView
        {...this.props}
        globalConf={this.globalConf}
        ref={`feeds_${tabId}`}
        key={`feeds_${tabId}_${idx}`}
        qbId={qbId}
        primaryKey={primaryKey}
        tabId={tabId}
        curTabId={curTabId}
        isNeedPreLoad={true}
        isTabChange={isTabChange}
        refreshNum={refreshNum}
        tabBean={item}
        parent={this}
        hideBottomBanner={this.hideBottomBanner}
      />
    );
  };

  // 点击页面，底部运营栏消失
  public onClickHomePage = () => {
    this.hideBottomBanner();
  };

  // 手动触发刷新
  public _manualRefresh = () => {
    const index = this.state.tabList.findIndex(item => item.tabId === this.state.curTabId);
    this.handleTabClick(index);
    this.refreshKey = 2;
  };


  /** 检查并切换福袋挂件显示状态 */
  public checkAndToggleWelfarePendant = (welfarePendantShowType?: WelfarePendantShowType): void => {
    const { curTabId, shownPop } = this.state;

    // 弹窗退避判断
    const showType = getWelfarePendantShowType(curTabId, shownPop?.type);

    // 上下滑动切换显示和贴边状态
    if (showType !== WelfarePendantShowType.HIDDEN && welfarePendantShowType) {
      this.setState({
        welfarePendantShowType,
      });
      return;
    }

    this.setState({
      welfarePendantShowType: showType,
    });
  };

  public closeBubble = () => {
    if (this.closeBubbleTimer) clearTimeout(this.closeBubbleTimer);
    this.changePopPriorityShow();
  };

  /** 隐藏底部banner */
  public hideBottomBanner = () => {
    if (!this.state.forceCloseBtmBanner) {
      this.setState({ forceCloseBtmBanner: true });
      this.changePopPriorityShow();
    }
  };

  public goWelfareCenter = (jumpUrl?: string, clickUrl?: string) => {
    let url = '';
    if (jumpUrl) {
      url = jumpUrl;
      if (clickUrl) {
        fetch(clickUrl);
      }
      reportUDS(BusiKey.CLICK__WELFARE_BUBBLE_ICON);
    } else {
      const { welfareUrl } = this.state;
      // 下发地址如果不存在采用产品给到的固定地址
      url = welfareUrl || welfareCenter;
      reportUDS(BusiKey.CLICK_WELFARE_CENTER_ICON);
    }
    this.closeBubble();
    FeedsUtils.doLoadUrl(url, `${TabId.BOTTOM_RECOMM2}`, false);
  };

  /** 关闭半屏推书弹窗 */
  public onCloseHalfPopBook = (book) => {
    this.setState({
      shownPop: undefined,
    });
    // 发布开始动画事件
    emitter.emit(events.DO_COLLECT_ANIMATION, [book, this.changePopPriorityShow]);
  };

  /** 点击半屏弹窗阅读 */
  public onClickHalfPopRead = () => {
    this.changePopPriorityShow();
    emitter.emit(events.CANCLE_COLLECT_ANIMATION);
  };

  public onContainerLayout = (nativeEvent) => {
    const { height } = nativeEvent.layout || {};
    if (height > 0) {
      this.mContainerHeight = height;
    }
  };

  /** 手动刷新当前tab */
  public reloadCurrentTab = () => {
    const event = {
      type: FeedsEventHub.lifecycle.reload,
    };
    this.handleCurTabLifeCycle(event);
  };

  public renderTabsWithAddon = () => {
    const { curTabId, tabList, welfareVisible, welfarePrize } = this.state;

    const { selectedIndex } = this;
    const styles = DEFAULT_FEEDS_STYLE.data.tabList;
    const { tabParam, tabInfo, adrTabInfo } = TABLIST_CONFIG;
    if (Platform.OS === 'ios' && tabInfo !== undefined) {
      tabInfo.tabScrollBarEnable = false;
    }
    const tabs: any[] = [];
    const feeds: any[] = [];
    const { length } = tabList;
    const { redDotCnt } = this.state;
    const tabInfoProps: any = { ...tabInfo };
    let tabCount = length;
    tabInfoProps.tabHeight = tabParam.height;
    if (isTopTab()) {
      tabInfoProps.tabHeight = 0;
      tabInfoProps.tabContainerRightMargin = 0;
      tabCount = 0;
    }

    addKeylink(`renderTabsWithAddon(), 开始渲染feeds内容 ${JSON.stringify({ curTabId, tabLen: tabList.length })}`, TAG);
    addKeylink(`是否渲染福袋条件: QBVersion:${isQBVersionValidForAd()} && hitExpert:${welfarePendantRule.isHit()}`, TAG);

    tabList.forEach((item, index) => {
      const tabId = item.tabId;
      feeds.push(this.getFeeds(index, tabId, selectedIndex, item, tabInfoProps.tabHeight));
      const redDotNum = tabId === TabId.SHELF ? redDotCnt : 0;
      tabs.push(<NavItem
        key={`nav_${tabId}_${index}`}
        tabInfo={item}
        curTabId={curTabId}
        tabsCount={length}
        left={index === 0}
        redDotNum={redDotNum}
        right={index === length - 1}
        ref={ref => this.mTabItemsView.set(`tab-${index}`, ref)}
      />);
    });

    if (Platform.OS === 'android') {
      tabInfoProps.textSelectColors = adrTabInfo.textSelectColors;
      tabInfoProps.textColors = adrTabInfo.textColors;
    }

    let rightView: any = null;
    const tabHeight = tabInfoProps.tabHeight;
    if (welfareVisible) {
      const icon = welfarePrize ? FeedsIcon.prize : FeedsIcon.welfare_center;
      Image.prefetch(FeedsIcon.welfare_center);
      Image.prefetch(FeedsIcon.prize);
      rightView = (
        <View style={styles.welfare_wrap}>
          <Image
            style={[
              styles.shadow,
              {
                height: tabHeight,
                width: tabHeight,
                left: -tabHeight,
              },
            ]}
            source={{ uri: FeedsIcon.floatShadow }}
            noPicMode={{ enable: false }}
            nightMode={{ enable: false }}
          />
          <Image
            style={{
              width: 54,
              height: 24,
              paddingRight: 16,
            }}
            source={{ uri: icon }}
            noPicMode={{ enable: false }}
            onClick={() => this.goWelfareCenter()}
          />
        </View>
      );
    }

    return (
      <View style={[styles.wrap]} onClick={this.onClickHomePage} onLayout={this.onContainerLayout}>
        {this.renderPops()}
        <QBTabHost
          style={{ flex: 1 }}
          initialPage={selectedIndex}
          ref="qbtabhost"
          shouldBindDoubleScroll
          tabInfo={tabInfoProps}
          rightView={rightView}
          renderTab={tabs}
          tabCount={tabCount}
          scrollEventThrottle={100}
          onPageSelected={event => this.handleSwitchChange(event)}
          onTabClicked={event => this.handleTabClick(event)}
          onScroll={this.onTabScroll}
          scrollEnabled={true}
          OnTabChangeEnd={position => this.OnTabChangeEnd(position)}
        >
          {feeds}
        </QBTabHost>
        {/* 福袋组件：满足QB版本要求且命中实验才出 */}
        {
          isQBVersionValidForAd() && welfarePendantRule.isHit()
            ? <WelfareTreasure showType={this.state.welfarePendantShowType} />
            : null
        }
      </View>
    );
  };

  /** 收敛弹窗的渲染方法 */
  public renderPops = () => {
    const { shownPop, forceCloseBtmBanner, isPageActive } = this.state;
    if (!shownPop) {
      return null;
    }
    return (
      <>
        {
          shownPop.type === OpInfoType.NEW_USER_BUBBLE
            ? <NewUserBubble
              onClose={this.changePopPriorityShow}
              globalConf={this.globalConf}
              bubbleInfo={shownPop.data}
            />
            : null
        }
        {shownPop.data?.opInfo ? <RedPack
          onClose={this.changePopPriorityShow}
          redPackInfo={shownPop.data}
          globalConf={this.globalConf}
          visible={shownPop.type === OpInfoType.NEWUSER_RED_PACK && isPageActive}
        /> : null}
        {shownPop.type === OpInfoType.WC_BUBBLE ? (
          <WCBubble bubbleInfo={shownPop.data} onClose={this.closeBubble} onClick={this.goWelfareCenter} />
        ) : null}
        {!isTopTab() && shownPop.type === OpInfoType.BTM_OP_INFO && !forceCloseBtmBanner ? (
          <BottomBanner globalConf={this.globalConf} bannerInfo={shownPop.data} onClose={this.hideBottomBanner} />
        ) : null}
        <OpHalfPopUp
          globalConf={this.globalConf}
          halfPopInfo={shownPop.data}
          visible={shownPop.type === OpInfoType.OP_HALF_POP && isPageActive}
          onClickClose={this.onCloseHalfPopBook}
          onClick={this.onClickHalfPopRead}
        />
        <OpHalfWebView
          globalConf={this.globalConf}
          halfInfo={shownPop.data}
          visible={shownPop.type === OpInfoType.OP_HALF_WEBVIEW && isPageActive}
          isTransparent={this.globalConf.pageUrl.indexOf('transparent') > -1}
          onClose={this.changePopPriorityShow}
          reloadCurrentTab={this.reloadCurrentTab}
        />
        {
          shownPop.type === OpInfoType.FULL_SCREEN_POP && isPageActive
            ? <TopTabPressure
              globalConf={this.globalConf}
              opData={shownPop?.data}
              onClose={this.changePopPriorityShow}
            /> : null
        }
      </>
    );
  };

  public render() {
    if (!this.state.isTabInit) return null;
    const { curTabId, tabList } = this.state;
    this.updateSelectedIndex(tabList, curTabId);
    return this.renderTabsWithAddon();
  }

  /** 处理闪屏状态变化，如果闪屏结束，改变首屏控制器中的闪屏状态 */
  private _handleSplashStateChange = (args: Record<'state', string>) => {
    if (args.state === SPLASH_END_TEXT) {
      getFSPopPresenter().setSplashEnd();
    }
  };

  /**
   * 处理闪屏事件，如果存在闪屏添加闪屏结束事件监听，如果不存在直接设置闪屏状态为完成
   * @param hasSplash 是否存在闪屏
   */
  private handleSplashEvent = (hasSplash: boolean): void => {
    if (hasSplash) {
      this.splashStateListener = QBBusinessADModule.addSplashStateChangeListener(this._handleSplashStateChange);
    } else {
      getFSPopPresenter().setSplashEnd();
    }
  };

  /** 处理首屏事件, 设置弹窗控制器中的的首屏渲染完成 */
  private handleFSRendered = (): void => getFSPopPresenter().setFSDataRendered();

  /** 所有首屏状态结束后弹窗控制器中的监听函数 */
  private fsPopReadyListener = (popData: PopResult) => {
    reportBeacon(TechKey.EXPOSE__OPINFO_SETSTATE, {}, {
      type: popData.type,
      isPageActive: this.state.isPageActive,
    });
    addKeylink(`最终运营弹窗类型为：${popData.type}`);
    this.setState({
      shownPop: popData,
    });

    // 福袋检查
    this.checkAndToggleWelfarePendant();
  };

  /** 监听onLoadUrl事件 */
  private onLoadUrlListener = (bundle) => {
    const self = this;
    Object.assign(this.globalConf.timeCost, {
      onLoadUrl: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss.S'),
    });
    if (!bundle.url) {
      return;
    }
    const scheme = `qb://tab/feedschannel?component=${COMPONENT}&module=${MODULE}&`;
    if (bundle.url.indexOf(`${scheme}version`) > -1) {
      QBAlertModule.showAlert(
        '',
        `feeds版本:${this.globalConf.rnVersion}\nQB版本:${this.globalConf.originalQbVersion}\n`,
        [{ text: '确定', style: 1 }],
      );
      return;
    }
    // eslint-disable-next-line no-shadow
    this.doOnLoadUrlCallback = (function doOnLoadUrlCallback(bundle, self) {
      setQbUrl(bundle.url);
      return function (mode) {
        const urlParams = FeedsUtils.parseQueryString(bundle.url);
        if (!urlParams.tabId && urlParams.tab) urlParams.tabId = urlParams.tab;
        const isDoOnloadUrl = bundle.url.indexOf(`${scheme}`) > -1 && urlParams.tabId;
        if (isDoOnloadUrl) {
          self.doLoadUrlTabId(urlParams);
          self.doOnloadUrl(bundle, urlParams, mode);
          return;
        }

        // CR: 后续优化: 这里应该统一收敛到location中
        if (bundle.url.indexOf('qb://home/scenes=') > -1) {
          const indexOf = bundle.url.indexOf('qb://home/scenes=');
          bundle.scenes = bundle.url.slice(indexOf);
          if (params.ch) bundle.channel = params.ch;
          if (params.scenes) bundle.scenes = params.scenes;
          if (params.tabId) bundle.tab_id = params.tabId;
          if (params.tabid) bundle.tab_id = params.tabid;
          FeedsAbilities.getWifiInfo().then((p) => {
            bundle.extParam = p;
            self.handleAllTabOpt(bundle);
          });
        }
      };
    }(bundle, self));

    let time = 0;
    let mode = FeedsAbilities.onloadUrlMode.NORMAL;
    const params = FeedsUtils.parseQueryString(bundle.url);
    if (params.now) {
      time = 0;
      mode = FeedsAbilities.onloadUrlMode.NORMAL;
    }
    setTimeout(() => {
      if (typeof self.doOnLoadUrlCallback === 'function') {
        self.doOnLoadUrlCallback(mode);
        self.doOnLoadUrlCallback = null;
      }
    }, time);
  };

  /** 监听onTabRefresh事件，更新指定的 Tab 内容 */
  private onTabRefreshListener = (bundle) => {
    if (!bundle.tabId) {
      return;
    }
    const args = { tabId: bundle.tabId };
    FeedsAbilities.getWifiInfo(args).then((params) => {
      bundle.extParam = params;
      bundle.refresh = true;
      this.handleAllTabOpt(bundle);
    });
  };

  /** 监听queryTabExist事件
   * 通过 queryTabId 查询本地缓存是否包含该 Tab
   * 返回的 retcode[ret]: 0 则为失败，1 为在本地已选择缓存中，2为在未选择缓存中
   * 这里返回retcode和ret是为了给前端的接口统一
   */
  private queryTabExistListener = (bundle) => {
    const { tabList } = this.state;
    const queryTabId = bundle.queryTabId || bundle.tabId;

    const tabId = parseInt(queryTabId, 10);
    const args = (() => {
      // 参数错误返回 -1
      if (Number.isNaN(tabId)) {
        return {
          ...bundle,
          retcode: -1,
          ret: -1,
        };
      }
      // 在已选择列表中返回 1
      if (tabList.findIndex(tab => tab.tabId === tabId) >= 0) {
        return {
          ...bundle,
          retcode: 1,
          ret: 1,
        };
      }
      // 都不在则返回 0
      return {
        ...bundle,
        retcode: 0,
        ret: 0,
      };
    })();
    FeedsAbilities.execJsApiCallback(args);
  };

  private switchTabPageBgImage = (): void => {
    const currentTabInfo = this.state.tabList?.find(({ tabId }) => tabId === this.state.curTabId);
    getTabpageBackgroundManager().setTabPageBgImage(currentTabInfo);
  };
}
