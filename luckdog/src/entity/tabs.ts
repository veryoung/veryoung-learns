/**
 * tab的三种类型
 * feedsview 信息流下通过接入层获取数据的主场景页面
 * webview 通过首屏接口拉取配置下发的h5页面
 * hippyview 通过首屏接口拉取配置下发页面，目前是内置在项目中，后续应考虑以iframe形式暴露出去
 */
export enum TabModelType {
  FEEDS_VIEW = 'feedsview',
  WEB_VIEW = 'webview',
  HIPPY_VIEW = 'hippyview',
}
export interface TabInfoConfig {
  tabId: number,
  iId?: number;
  tabTitle: string,
  tabIcons: TabIconConfig[],
  tabType: string,
  extinfo: {
    [extra: string]: any;
  },
  status: number,
  feedsViewId: string,
  hippyViewName: string,
  specialTitle: string,
  reportExt?: any;
  iFromType?: any;
  iStoreNumber?: number,
  iStopRequest?: number,
  iAutoRefreshTime?: number,
}

/**
 * 频道图片配置
 * scene 图片对应的场景 0:日间, 1:夜间, 2:浅, 3:深
 * normalIconUrl 图片地址
 * selectedIconUrl 点击态图片地址
 * iconType 图片对应的tab展示类型 0: 未知类型; 1:纯双汉字; 2: 纯三汉字 3: 纯四汉字 4：双汉字图片 5: 三汉字图片 6: 四汉字图片
 */
export interface TabIconConfig {
  scene: number;
  normalIconUrl: string;
  selectedIconUrl: string;
  iconType: number;
}

/**
 * 频道本身的类型
 * 1: 底部TAB
 * 3: 顶部TAB
 */
export enum TabTypeConfig {
  NOVELFEEDS = 1,
  TOPTAB = 3,
}
