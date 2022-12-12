/**
 * Created by damonruan on 2017/4/30.
 */

import { Platform } from '@tencent/hippy-react-qb';
import FeedsTheme from './FeedsTheme';
import { TabId } from '../entity';
import { TagsStyle } from '../types/card';

let GlobalConf: Record<string, any> = {};

/**
 * @deprecated
 * 接下来要优化掉这个globConf, 按照数据的不同放到不同的地方
 */
export default class FeedsConst {
  public static initGlobalConf(globalConf: Record<string, any>) {
    GlobalConf = globalConf;
  }

  public static getGlobalConf() {
    return GlobalConf;
  }

  public static setGlobalConfKV(key: string, value: any) {
    GlobalConf[key] = value;
  }

  public static getGlobalConfKV(key: string) {
    return GlobalConf[key];
  }

  public static getGlobalConfHasOwnProperty(key: string) {
    return key in GlobalConf || false;
  }
}

export const MODULE = 'novelsingletab';
export const COMPONENT = 'FeedsNovelPage';
export const isFeedsChannelMode = false;
export const fixedTabId = TabId.BOTTOM_RECOMM2;
export const fixedTabChildId = TabId.BOTTOM_RECOMM1;
/** 底tab 事务ID */
export const BOTTOM_BUSINESS_ID = 45;
export const singChannelAppId = 138;
/** 曝光/点击上报BOTTOM_BUSINESS_ID */
export const REPORT_BUSINESS_ID = 10;
export const MAX_FEEDS_PAGEVIEW_ITEMS_LENGTH = 13;

export const EXT_PARAMS_MAP = {
  ui426: 'NEW_USER_BOOK_EXPOSE__KEY',
  novelReader: 'novelReaderVersion',
};

export const UI_426_KEY = 'NEW_USER_BOOK_EXPOSE__KEY';
export const UI_428_KEY = 'PICK_CARD_EXPOSE_TIME_EXPOSE__KEY';
export const NEW_USER_CONTENT_EXPOSE__KEY = 'NEW_USER_CONTENT_EXPOSE__KEY';
export const NEW_USER_BOOK_EXPOSE__KEY = 'NEW_USER_BOOK_426_BOOKS_KEY';
export const USER_QBID = 'NEW_USER_BOOK_426_BOOKS_KEY';
export const INFINITE_RECOM_PRE30_BOOK_IDS = 'INFINITE_RECOM_PRE30_BOOK_IDS';


export const dtConst = {
  dt_pgid: '14', // （频道列表页/feeds流）
  tab_id: 112, // 底tab写死的id
  // 上报采集策略： "1"-只采集曝光;  "2"- 只采集交互点击; "3"- 采集所有; 其他-不采集
  policy: {
    none: '0',
    imp: '1',
    clck: '2',
    all: '3',
  },
};

export const FeedsUIStyle = {
  FEED_ITEM_PADDING: 12,
  FEED_ITEM_PADDING_TOP_BOTTOM: 12,
  FEED_ITEM_PADDING_SIDE: 12,
  VERTICAL_SPACE: 8,
  FEEDSTEXTTAGVIEW_HEIGHT: 16,
  FEEDS_CARD_MARGIN_VERTICAL: 16,

  FEED_TITLE_HEIGHT: 14,
  SMALL: 8,
  SMALL_1: 9,
  SMALL_2: 10,
  T0: 11,
  T1: 12,
  T1_5: 13,
  T2: 14,
  T2_5: 15,
  T3: 16,
  T3_4: 17,
  T3_5: Platform.OS === 'android' ? 17 : 18,
  T3_6: 19,
  T4: 18,
  T5: 20,
  T6: 21,
  T7: 22,
  T8: 23,
  T9: 24,
};

/** 小书封左上角样式 */
export const SmallBookCoverLeftTagStyle: TagsStyle = {
  width: 14,
  height: 24,
  offsetX: 6,
  offsetY: 0,
};

/** 大书封左上角样式 */
export const BigBookCoverLeftTagStyle: TagsStyle = {
  width: 18,
  height: 31,
  offsetX: 6,
  offsetY: 0,
};

/** 卡片公用圆角尺寸 */
export const CardRadius = 12;

export const CommonCardStyle = {
  borderRadius: CardRadius,
  backgroundColors: FeedsTheme.SkinColor.D5_2,
  marginBottom: 0,
  marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
  marginHorizontal: FeedsUIStyle.T1,
};

export const SpecialStyle = {
  Top: 12, // 置顶类型
  GroupMore: 0x7ffe, // Group底部更多
  SplitHistory: 0xfff3, // 上次阅读到这里
  RefreshTip: 0xfff1, // 刷新提示
  MoreEntrance: 0xfff0, // 更多入口
  FilterUI: 65529, // 过滤UI View
  MessagePush: 10007, // 消息通知
};

export const SplitHistoryType = {
  Normal: 1, // 普通的分割线 - 上次看到这，点击刷新
  NoRefresh: 2, // 分割线不带刷新 - 上次看到这
  Recommend: 3, // 更多推荐 - 没有更多动态了，这些账号你可能会喜欢
};

export const FeedsItemBottomLineType = {
  FEEDS_VIEW_BOTTOM_LINE_TYPE_NONE: 0, // 无分割线
  FEEDS_VIEW_BOTTOM_LINE_TYPE_THIN: 1, // 细分割线
  FEEDS_VIEW_BOTTOM_LINE_TYPE_THIN_MATCH_PARENT: 2, // 细分割线 和边缘没有间距
  FEEDS_VIEW_BOTTOM_LINE_TYPE_BOLD: 3, // 粗分割线
  FEEDS_VIEW_BOTTOM_LINE_TYPE_WHITE_BOLD: 4, // 白色粗分割线,
  FEEDS_VIEW_BOTTOM_LINE_TYPE_NEW_BOLD: 5, // 新版粗分隔线，为原来type:3的粗分割线的一半高度
};

// 底线粗细
export const FeedsItemBottomLineHeight = {
  THIN: 0.5,
  BOLD: FeedsUIStyle.VERTICAL_SPACE,
  NEW_BOLD: 4,
  NORMAL: 1,
  NONE: 0,
};

// 颜色map的key值
export enum ColorDictKey {
  GRAY = 0, // 灰色
  BLUE = 2, // 蓝色
  RED = 4, // 红色
  LIGHTBLUE = 5, // ['#478DFF', '#478DFFa0'], // 蓝色
}

// 标签颜色map
export const colorDict = {
  0: FeedsTheme.LiteColor.N9_1, // 灰色
  2: FeedsTheme.LiteColor.B9, // 蓝色
  4: FeedsTheme.LiteColor.B2, // 红色
  5: FeedsTheme.LiteColor.B1, // ['#478DFF', '#478DFFa0'], // 蓝色
};

// 背景图露出高度与自身高度比例
export const imageDict = {
  1: 0.1,
  2: 0.2,
  3: 0.3,
  4: 0.4,
  5: 0.5,
  6: 0.6,
  7: 0.7,
  8: 0.8,
  9: 0.9,
  10: 1,
};

export const Debug = {
  logDebug: false,
  uiDebug: false,
  logConsole: false,
  dataDebug: false,
  debugInfo: false, // 是否显示调试信息 jerryfwang
  ABTest: true, // 是否显示abTest
  IOS_LOG: false,
  logUpload: true,
  uiStyleDebug: false, // 是否只启用本地styles调试 不使用UI系统
};

export const ApnType = {
  NONE: 0,
  M_2G: 1,
  M_3G: 2,
  M_4G: 3,
  WIFI: 4,
};

export const LoadMultiTab = {
  firstUpgrade: false,
  orientation: null,
};

export const TabReportMap = {
  map: null,
};

export const FeedsLineHeight = {
  T0: 16,
  T1: 16,
  T2: 16,
  T2_5: 20,
  T3: 20,
  T3_5: 24,
  T4: 24,
  T5: 24,
  T6: 25,
  T6_1: 28,
  T7: 32,
};

export const PLAY_STATUS = {
  PLAYING: 1,
  REPLAY: 2,
  SUBSCRIBE: 3,
  VIDEO: 4,
};

// 配置哪个TAB在哪个版本上支持
// add by rice
export const TAB_SUPPORT_VERSION_ANDROID = {
  // 12098: 8133850
  12098: 8110000,
};

export const TAB_SUPPORT_VERSION = {
  android: TAB_SUPPORT_VERSION_ANDROID,
  ios: {},
};

export const VOLUME_KEY_EVENT = {
  UP: 'onVolumeUpKeyDown',
  DOWN: 'onVolumeDownKeyDown',
};

export const ReusePlayerState = {
  READY: '0',
  LOADING: '1',
  SHOWING: '2',
  PAUSE: '3',
  END: '4',
};

export const VideoSrcType = {
  VPlus: 0,
  QiEhaoCdn: 1,
  WeiShiCdn: 2,
  OtherCdn: 3,
};

export const PageModule = {
  UgcFloat: 'ugcfloat',
  VideoFloat: 'videofloat',
  UnKnow: 'unknow',
};

export const DragState = {
  Draging: 1,
  Idle: 2,
};

export const ON_ACTIVE_TAB_UPDATE_INTERVAL = 2 * 3600 * 1000; // 两个小时
export const ON_ACTIVE_TAB_EXPOSED_INTERVAL = 12 * 3600 * 100; // 十二个小时
export const PRELOAD_ITEM_NUM = 4; // 预加载阈值


export const DownloadBtnUI = ['button_1', 'button_2'];
/** 运行环境 */
export const ENV = {
  REAL: 'real',
  GRAY: 'gray',
  TEST: 'test',
};

/** 过渡动画实验map */
export const TRANSITION_ANIM_MAP = {
  INFO: 0,
  UGCFLOAT: 1,
  VIDEOFLOAT: 2,
  SHORTFLOAT: 3,
};

/** 业务与过渡动画map */
export const BUSI_TYPE_TO_ANIM_MAP = {
  1: TRANSITION_ANIM_MAP.INFO,
  10: TRANSITION_ANIM_MAP.INFO,
  3: TRANSITION_ANIM_MAP.VIDEOFLOAT,
  19: TRANSITION_ANIM_MAP.UGCFLOAT,
};

export const autoLetterSpacing = false;

/** 底bar推荐频道默认红点数目，小红点默认用1 */
export const barRedDotNumber = 1;

export const sceneMap = {
  [TabId.SHELF]: 'book_shelf',
  [TabId.BOTTOM_RECOMM1]: 'recommend',
  [TabId.BOY]: 'male_novel',
  [TabId.GIRL]: 'female_novel',
  [TabId.LATEST]: 'new_novel',
};

export const fetchUrlList = {
  bg: {
    light: 'https://today.imtt.qq.com/novelsingtab/welfare/bubble/light.png',
    dark: 'https://today.imtt.qq.com/novelsingtab/welfare/bubble/dark.png',
    welfare: 'http://rmpad.imtt.qq.com/rmptest/RMP_1605252360668.png',
    timeIcon: 'https://today.imtt.qq.com/novelsingtab/welfare/time/icon.png',
  },
};

export const WEB_HOST = 'https://novel.html5.qq.com';

export const welfareCenter = 'https://qbact.html5.qq.com/mall/#/?addressbar=hide';

/* 获取数据类型
 * 0 - 未拉取到数据； 1 - 通过接口拉取到数据； 2 - 通过缓存获取到数据
 */
export const LOAD_DATA_TYPE = {
  NULL: '0',
  FROM_API: '1',
  FROM_CACHE: '2',
};

export const DEFAULT_SCENEID = 'FeedsTab';

export const UI_EXPOSE_STYLE = {
  PICK_CARD: 428,
};

/** 悬浮条运营信息类型 */
export const operationType = {
  BTM_BANNER_BOOK: 'bannerBook',
  BTM_BANNER_PIC: 'bannerPic',
  BTM_RECORD_BOOK: 'bannerRecord',
};

/** 应该展示悬浮条的url上带的参数 */
export const SHOULD_SHOW_BANNER_PARAMS = [
  'banner_btm_bookid',
  'banner_btm_resid',
  'banner_btm_reskey',
];

/** 严口径上报延迟时间 */
export const STRICT_EXPOSE_DELAY = 1000;

/** 点击频控 */
export const CLICK_STEP = 800;

/** 小说businessId */
export const NOVEL_BUSINESS_ID = 2;

/** 随机背景色 */
export const TagsBgColors = [
  FeedsTheme.SkinColor.N2_1,
  FeedsTheme.SkinColor.N3_1,
  FeedsTheme.SkinColor.N5_1,
  FeedsTheme.SkinColor.N6_1,
  FeedsTheme.SkinColor.N7_1,
];

/** 普通无限流卡cardKey */
export const INFINITE_CARD_KEY = 'Infinite';
/** 见识tab无限流卡cardKey */
export const KNOWLEDGE_INFINITE_CARD_KEY = 'KnowledgeInfinite';
