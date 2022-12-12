import { DEFAULT_FEEDS_STYLE } from './FeedsDefaultStyle';
import FeedsUtils from './FeedsUtils';

export default class FeedsStyleManager {
  public grayId: any;
  public minRNVersion: any;
  public style: any;
  public version: any;
  public constructor() {
    this.style = null;
    this.version = -1;
    this.minRNVersion = 0;
    this.grayId = 0;
  }

  public loadFirstFrameStyle() {
    this.style = DEFAULT_FEEDS_STYLE.data;
    this.version = DEFAULT_FEEDS_STYLE.version;
    this.minRNVersion = DEFAULT_FEEDS_STYLE.minRNVersion;
    this.grayId = 0;
  }

  public getStyle(uiType) {
    const ui = String(uiType);
    return FeedsUtils.getSafeProps(DEFAULT_FEEDS_STYLE.data, ui);
  }
}
