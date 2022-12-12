import FeedsItemBean from './FeedsItemBean';

export default class FeedsItemExtBean extends FeedsItemBean {
  public static GroupType = { None: 0, Parent: 1, Child: 2 };
  public static OrderType = { None: 0, Top: 1 };
  public parsedObject: null;
  public groupType: any;
  public isParsed: boolean;
  public orderType: any;
  public symbolKey: null;
  public hasExposured: boolean;
  public isPlanBExposured: boolean;
  public canAutoPlay: boolean;
  public videoScale: number;
  public useHippyRpc: boolean;
  public parsedHttpObject: null;
  public app_id: any;
  public refreshType;

  public constructor() {
    super();
    this.parsedObject = null;
    this.groupType = FeedsItemExtBean.GroupType.None;
    this.isParsed = false;
    this.orderType = FeedsItemExtBean.OrderType.None;
    this.symbolKey = null;
    this.hasExposured = false;
    this.isPlanBExposured = false; // 露出一个像素就算曝光的
    this.canAutoPlay = false; // 曝光的时候检查自动播放标注
    this.videoScale = 1;
    this.useHippyRpc = true;
    this.parsedHttpObject = null;
  }
}
