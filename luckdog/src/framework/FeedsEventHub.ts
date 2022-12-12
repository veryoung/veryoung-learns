/**
 * 处理终端到js的直接的事件
 */
import { MODULE } from './FeedsConst';

const opt = { channel: '', scenes: 0 };
export default class FeedsEventHub {
  public static event: any;

  public static lifecycle = {
    active: 'onActive',
    deactive: 'onDeactive',
    destroy: 'onDestroy',
    reload: 'reload',
    clearcache: 'onClearCache',
    instantiated: 'onInstantiated',
    redPointShow: 'onRedPointShow',
    screenOff: 'onScreenOff',
    onToPage: 'onToPage',
    stop: 'onStop',
    start: 'onStart',
  };

  public static opt = {
    onFollowResult: 'onFollowResult',
    onRedPointTabs: 'onRedPointTabs',
    onLoadUrl: 'onLoadUrl',
    // 查找 Tab 是否存在，参数 queryTabId
    queryTabExist: 'queryTabExist',
    // 刷新 Tab
    onTabRefresh: 'onTabRefresh',
    listViewRefresh: 'listViewRefresh',
    onTypelogError: 'logError',
  };

  public  static activeSubType = {
    tab: 'tab',
    homepage: 'homepage',
    startup: 'startup',
  };

  public static commonOptSubType = {
    enableLog: 'enebleLog',
    enableUiDebug: 'enebleUiDebug',
    showRnVc: 'showRnVc',
    uploadLog: 'uploadLog',
    enableDebugInfo: 'enableDebugInfo',
  };

  public static getOpt() {
    return opt;
  }
}

const moduleName = `@${MODULE}`;
FeedsEventHub.event = {
  moduleName,
  lifecycle: `${moduleName}:lifecycle`, // 生命周期事件 {tabId:"",type:"@set FeedsEventHub.lifecycle "}
  changeCity: `${moduleName}:changeCity`, // 切换城市 {cityId:"",cityName:""}
  opt: `${moduleName}:opt`, // 全局参数变更 {channel:通道号,scenes:场景 1:wifi,...}
  commonOpt: '@common:opt', // 不仅仅feeds使用，debug信息等
  call: '@iframe:calliframe',
  /* {@param id {string} id 和Open的时候一致
   * @param circleId {string} circleId
   * @param progress {number} 发布进度0-100
   * @param state {number} 发布状态
   *  1   发布开始
   *  2   发布中
   *  3   发布完成
   *  -1  发布失败} */
  publishProgress: '@publisher:progress', // 发布器进度
  videoFirstShowFromUgc: `${moduleName}:videoFirstShowFromUgc`, // 小视频首帧返回事件
  redDot: `${moduleName}:redpointCome`, // 红点
  feedsIdleToVisible: `${moduleName}:feedsIdleToVisible`, // 预加载隐藏实例通知
  videoFirstShow: `${moduleName}:videoFirstShow`, // 短视频首帧返回事件
  firstView: `${moduleName}:firstView`, // 闪屏事件
  splashADEnd: `${moduleName}:splashADEnd`,
  postMessage: `${moduleName}:postMessage`,
  iFrameFirstViewRender: '@iframe:timestamp',
};
