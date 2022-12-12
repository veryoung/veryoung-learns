import { Act } from '@/luckdog';

/** 灯塔技术指标 */
export enum TechKey {
  /** 首进渲染耗时 */
  EXPOSE__FIRST_SCREEN_RENDER = 5941001,
  /** 首进超3秒 */
  EXPOSE__FIRST_SCREEN_RENDER_OVERTIME_THREE = 5941002,
  /** 拉取数据接口耗时 */
  EXPOSE__FETCH_DATA_TIME_CONSUMING = 5941003,
  /** 拉取数据接口失败 */
  EXPOSE__FETCH_DATA_FAIL = 5941004,
  /** 推荐卡片数据请求数量不对 */
  EXPOSE__RECOMMEND_DATA_ERROR = 5941008,
  /** 页面初始化PV */
  EXPOSE__PAGE_REAL_PV = 5941009,
  /** 页面active PV */
  EXPOSE__PAGE_EXPOSE_PV = 5941010,
  /** 首屏接口失败重试 PV */
  EXPOSE__FSD_RETRY = 5941011,
  /** 首屏接口失败重试成功 PV */
  EXPOSE__FSD_RETRY_SUCCESS = 5941012,

  /** 首屏运营数据触达上报 */
  EXPOSE__OPINFO_RECEIVED = 5941013,

  /** 首屏运营数据条件通过上报 */
  EXPOSE__OPINFO_ALLOWED = 5941014,

  /** 首屏运营数据check触发 */
  EXPOSE__OPINFO_CHECK = 5941015,

  /** 首屏运营数据ready */
  EXPOSE__OPINFO_SETSTATE = 5941016,
}

/** 灯塔业务指标 */
export enum BusiKey {
  /** 周期式时长统计 */
  READ_DURATION__STAT_USING_TIME_BY_STEP = 5940004,

  // 卡片事件
  /** 卡片头像点击 */
  CLICK__CARD_AVATAR = 5940008,
  /** 卡片内tab点击 */
  CLICK__CARD_TAB = 5940009,
  /** 卡片曝光 */
  EXPOSE__CARD = 5940010,
  /** 卡片长曝光 */
  LONG_EXPOSE__CARD = 5940011,
  /** 卡片书籍点击 */
  CLICK__CARD_BOOK = 5940012,
  /** 卡片换一换点击 */
  CLICK__CARD_CHANGE = 5940013,
  /** 卡片播放点击 */
  CLICK__CARD_PLAY = 5940014,
  /** 卡片暂停点击 */
  CLICK__CARD_PAUSE = 5940015,
  /** 卡片静音点击 */
  CLICK__CARD_MUTE = 5940016,
  /** 卡片查看全部点击 */
  CLICK__CARD_VIEW_ALL = 5940017,
  /** 卡片点击 */
  CLICK__CARD = 5940018,
  /** 卡片滑动 */
  SLIDE__CARD = 5940019,

  // 书架相关事件
  /** 点击_书架Tab_我的藏书 */
  CLICK__BOOK_SHELF_TAB_COLLECT_DETAIL = 5940021,
  /** 点击_书架Tab_阅读记录 */
  CLICK__BOOK_SHELF_TAB_READ_HISTORY = 5940022,
  /** 点击_书架Tab_编辑 */
  CLICK__BOOK_SHELF_TAB_EDIT_BUTTON = 5940023,
  /** 点击_底Tab_书架Tab_取消编辑 */
  CLICK__BOOK_SHELF_TAB_EDIT_CANCEL = 5940024,
  /** 点击_底Tab_书架Tab_编辑勾选 */
  CLICK__BOOK_SHELF_TAB_EDIT_ON = 5940025,
  /** 点击_底Tab_书架Tab_编辑_推书 */
  CLICK__BOOK_SHELF_TAB_EDIT_PUSH = 5940026,
  /** 点击_底Tab_书架Tab_编辑_删除 */
  CLICK__BOOK_SHELF_TAB_EDIT_DELETE = 5940027,
  /** 点击_底Tab_书架Tab_编辑_加入藏书 */
  CLICK__BOOK_SHELF_TAB_EDIT_COLLECT = 5940028,
  /** 点击_底Tab_书架Tab_书籍列表 */
  CLICK__BOOK_SHELF_TAB_BOOKLIST = 5940029,
  /** 点击_底Tab_书架Tab_长按触发编辑 */
  CLICK__BOOK_SHELF_TAB_LONG_PRESS_EDIT = 5940030,
  /** 曝光_底Tab_书架Tab_登录引导条 */
  EXPOSE__BOOK_SHELF_TAB_LOGIN_GUIDE_BAR = 5940031,
  /** 点击_底Tab_书架Tab_登录引导成功 */
  CLICK__BOOK_SHELF_TAB_LOGIN_SUCC = 5940032,
  /** 点击_底Tab_书架Tab_登录引导取消 */
  CLICK__BOOK_SHELF_TAB_LOGIN_CANCEL = 5940033,

  /** 点击_底Tab_推荐Tab_阅读喜好大卡_男频 */
  CLICK__INTEREST_BOY = 5940034,
  /** 点击_底Tab_推荐Tab_阅读喜好大卡_女频 */
  CLICK__INTEREST_GIRL = 5940035,
  /** 点击_底Tab_推荐Tab_阅读喜好大卡_男女选择关闭 */
  CLICK__INTEREST_CLOSE = 5940036,
  /** 点击_底Tab_推荐Tab_阅读喜好大卡_分类偏好 */
  CLICK__INTEREST_CATEGORY = 5940037,
  /** 点击_底Tab_推荐Tab_阅读喜好大卡_选好了 */
  CLICK__INTEREST_OK = 5940038,

  /** 导航分类入口 */
  CLICK__ENTRANCE_CATE = 5940039,
  /** 导航排行入口 */
  CLICK__ENTRANCE_RANK = 5940040,
  /** 导航完本入口 */
  CLICK__ENTRANCE_ENDBOOK = 5940041,
  /** 导航精品入口 */
  CLICK__ENTRANCE_FINEWORK = 5940042,
  /** 导航搜索入口 */
  CLICK__ENTRANCE_SEARCH = 5940043,
  /** 导航福利入口 */
  CLICK__ENTRANCE_WELFARE = 5940044,

  /** 底Tab页面曝光 */
  EXPOSE__TAB_PAGE = 5940045,
  /** 底Tab点击 */
  CLICK__TAB_PAGE = 5940046,

  /** 书架红点曝光 */
  EXPOSE__BOOK_SHELF_RED_DOT = 5940047,
  /** 书架红点点击 */
  CLICK__BOOK_SHELF_RED_DOT = 5940048,

  /** 无限流点击设置阅读喜好 */
  CLICK__INFINITE_CARD_INTEREST = 5940051,

  /** 严口径底部运营悬浮窗 曝光 */
  EXPOSE__BOTTOM_BANNER = 5940052,
  /** 底部运营悬浮窗 点击 */
  CLICK__BOTTOM_BANNER = 5940053,
  /** 底部运营悬浮窗 关闭 */
  CLICK__BOTTOM_BANNER_CLOSE = 5940054,
  /** 底部运营悬浮窗 url中带有运营参数，需要显示悬浮栏 */
  EXPOSE__BOTTOM_BANNER_SHOULD_SHOW = 5940055,

  /** 严口径新用户气泡引导 */
  EXPOSE__NEW_USER_BUBBLE = 5940056,
  /** 严口径新用户红包曝光 */
  EXPOSE__RED_PACK = 5940057,
  /** 新用户红包点击 */
  CLICK__RED_PACK = 5940058,
  /** 新用户红包点击关闭 */
  CLICK__RED_PACK_CLOSE = 5940059,

  // 福利中心（时长商城）
  /** 入口图标曝光 */
  EXPOSE__WELFARE_CENTER_ICON = 5940060,
  /** 入口图标点击 */
  CLICK_WELFARE_CENTER_ICON = 5940061,
  /** 福利气泡曝光 */
  EXPOSE__WELFARE_BUBBLE_ICON = 5940062,
  /** 福利气泡点击 */
  CLICK__WELFARE_BUBBLE_ICON = 5940063,
  /** 福利阅读时长点击 */
  CLICK__WELFARE_BUBBLE_TIME_ICON = 5940064,
  /** 福利阅读时长曝光 */
  EXPOSE__WELFARE_BUBBLE_TIME_ICON = 5940065,

  /** tab切换 */
  CLICK__TAB_SWITCH = 5940066,
  /** tab垂直滑动 */
  SLIDE__TAB = 5940067,
  /** 频道刷新 */
  EXPOSE__REFRESH = 5940068,

  // 半屏弹窗
  /** 严口径半屏弹窗曝光 */
  EXPOSE__HALF_SCREEN_POP = 5940069,
  /** 半屏弹窗点击阅读 */
  CLICK__HALF_SCREEN_POP_READ = 5940070,
  /** 半屏弹窗点击关闭 */
  CLICK__HALF_SCREEN_POP_CLOSE = 5940071,

  /** tabList 渲染 */
  EXPOSE__TAB_LIST_RENDER = 5940072,


  /** 卡片点击空白区域跳转更多 */
  CLICK__BLANK_TO_MORE = 5940073,

  /** 卡片查看更多数据相关 */
  EXPOSE__TO_MORE = 5940074,
  CLICK__TO_MORE = 5940075,

  /** 宽口径卡片曝光 */
  WIDE_EXPOSE__CARD = 5940076,

  /** 半浮层webview弹窗曝光 */
  EXPOSE__HALF_SCREEN_WEBVIEW = 5940077,
  /** 半浮层webview弹窗关闭 */
  CLICK__HALF_SCREEN_WEBVIEW_CLOSE = 5940078,

  /** 发生了滑动、点击等主动行为 */
  SLIDE__ACTIVE_INTERACTION = 5940079,

  /** 负反馈相关 */
  /** 点击负反馈按钮 */
  CLICK__FEEDBACK_BTN = 5940080,
  /** 负反馈面板曝光 */
  EXPOSE__FEEDBACK_BG = 5940081,
  /** 负反馈点击 */
  CLICK__FEEDBACK_ITEM = 5940082,

  /** 5940083-5940085 书外人活动使用过，暂时跳过 */

  /** 首屏曝光 */
  EXPOSE__FIRST_SCREEN = 5940086,
  /** 第二屏曝光 */
  EXPOSE__SECOND_SCREEN = 5940087,
  /** 第三屏曝光 */
  EXPOSE__THIRD_SCREEN = 5940088,

  /** 进入 */
  ENTER__PAGE_INIT = 5940089,
  /** 活跃状态 */
  EXPOSE__PAGE_ACTIVE = 5940090,

  /** 全屏弹窗曝光 */
  EXPOSE__TOP_TAB_GUIDE_POP = 5940091,
  /** 全屏弹窗点击 */
  CLICK__TOP_TAB_GUIDE_POP = 5940092,

  /** 福袋-挂件曝光 */
  EXPOSE__TREASURE_FLOATING = 5940093,
  /** 福袋-挂件点击 */
  CLICK__TREASURE_FLOATING = 5940094,
  /** 福袋-toast曝光 */
  EXPOSE__TREASURE_TOAST = 5940095,
  /** 福袋-开福袋弹窗曝光 */
  EXPOSE__TREASURE_WEAK_MODAL = 5940096,
  /** 福袋-开福袋弹窗点击 */
  CLICK__TREASURE_WEAK_MODAL = 5940097,
  /** 福袋-激励视频弹窗曝光 */
  EXPOSE__TREASURE_POWER_MODAL = 5940098,
  /** 福袋-激励视频弹窗点击 */
  CLICK__TREASURE_POWER_MODAL = 5940099,
}

type EventModule = string;
type ActEventModuleTuple = [Act, EventModule];

/** 解析 act 和 event_module */
export const parseEventKey = (eventKey: TechKey | BusiKey): ActEventModuleTuple => {
  const strKey = BusiKey[eventKey] || TechKey[eventKey] || '';
  return (strKey.split('__') as any).map((item: string) => item.toLowerCase());
};


/**
 * 下面这些业务事件需要在页面处于 active 状态下才能上报：
 * 1. 曝光事件
 * 2. 长曝光事件
 * 3. 时长统计
 * 4. 宽口径曝光事件
 */
export const reportOnActiveEventKeys = [
  BusiKey.EXPOSE__CARD,
  BusiKey.LONG_EXPOSE__CARD,
  BusiKey.EXPOSE__TAB_PAGE,
  BusiKey.EXPOSE__BOOK_SHELF_RED_DOT,
  BusiKey.EXPOSE__BOTTOM_BANNER,
  BusiKey.EXPOSE__BOTTOM_BANNER_SHOULD_SHOW,
  BusiKey.EXPOSE__NEW_USER_BUBBLE,
  BusiKey.EXPOSE__RED_PACK,
  BusiKey.EXPOSE__WELFARE_CENTER_ICON,
  BusiKey.EXPOSE__WELFARE_BUBBLE_ICON,
  BusiKey.EXPOSE__WELFARE_BUBBLE_TIME_ICON,
  BusiKey.EXPOSE__REFRESH,
  BusiKey.EXPOSE__HALF_SCREEN_POP,
  BusiKey.EXPOSE__TAB_LIST_RENDER,
  BusiKey.READ_DURATION__STAT_USING_TIME_BY_STEP,
  BusiKey.WIDE_EXPOSE__CARD,
  BusiKey.EXPOSE__HALF_SCREEN_WEBVIEW,
  BusiKey.EXPOSE__FIRST_SCREEN,
  BusiKey.EXPOSE__SECOND_SCREEN,
  BusiKey.EXPOSE__THIRD_SCREEN,
  BusiKey.EXPOSE__TREASURE_FLOATING,
  BusiKey.EXPOSE__TREASURE_TOAST,
];

/** 需要实时上报的事件 */
export const realTimeEventKeys = [
  BusiKey.ENTER__PAGE_INIT,
  BusiKey.EXPOSE__PAGE_ACTIVE,
  BusiKey.READ_DURATION__STAT_USING_TIME_BY_STEP,
];
