export default class FeedsItemDataHolder {
  public children: any;
  public endY: any;
  public isDeleted: any;
  public isExposured: any;
  public isMMAvideoExposured: any;
  public isPlanBExposured: any;
  public isSpecial: any;
  public mData: any;
  public mDebug: any;
  public mItemViewHeight: any;
  public mItemViewType: any;
  public startY: any;
  public isRecommend: any;

  public constructor() {
    // 成员变量
    this.mItemViewType = 0;
    this.mData = null;
    this.mItemViewHeight = 0;
    this.startY = 0;
    this.endY = 0;
    this.mDebug = false;
    this.isSpecial = false; // 特殊类型的item
    this.isExposured = false; // 已曝光
    this.isPlanBExposured = false; // 露出一个像素就算曝光的
    this.isMMAvideoExposured = false; // MMA可见性监测曝光视频标准，露出50%，停留2s
    this.isDeleted = false;
    this.children = {}; // 类似UI12这种多个item之间有父子关系，此处记录孩子的itemId映射
  }
}
