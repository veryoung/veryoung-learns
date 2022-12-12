import FeedsUtils from './FeedsUtils';
import { setQbUrl, getDeviceVisitor } from '@/luckbox';


/**
 * @deprecated
 * 接下来要优化掉这个globprops, 按照数据的不同放到不同的地方
 */
export default class FeedsGlobalProps {
  public NetInfoReach: any;
  public appId: any;
  public guid: any;
  public isKingCardUser: any;
  public muted: any;
  public orientation: any;
  public originalQbVersion: any;
  public pageUrl: any;
  public primaryKey: any;
  public qbVersion: any;
  public qbBuild: number;
  public qbid: any;
  public qua2: any;
  public sdkVersion: any;
  public startUpType: any;
  public style: any;
  public env: any;
  public refreshType;
  public appInstallTime;
  public appUpdateTime;
  public pageActive;
  public initActive;
  public toPageModule;
  public curTabId;
  public refreshStyleVer;
  public timeCost;
  public idInfo;
  public isInfoCached;
  public rnVersion;
  public barRedPointHasClicked;
  public hasBarRedPointExist;
  public SELECT_TAB_PAGEID: any;
  public deviceInfo: any;
  public accountInfo: any;
  public connectInfo: any;
  public transitionAnim: null;
  public tabOnLoadUrlCount: any;
  public feedsState: any;
  public leaveTime;
  public urlParams: any;


  public constructor(props) {
    this.guid = props.guid || '';
    this.qua2 = props.qua2 || '';
    this.sdkVersion = props.sdkVersion || null;
    this.qbid = null;
    if (props.qbConfig && [1, 2].includes(props.qbConfig.orientation)) {
      this.orientation = props.qbConfig.orientation;
    } else {
      this.orientation = props.null;
    }
    this.muted = true;
    this.appId = -1;
    // network: "", //SDK定义的类型
    // apn: 0,  //list协dao议定义的类型
    this.NetInfoReach = null;
    this.isKingCardUser = false;
    this.style = null;
    this.startUpType = props.startUpType || 0; // 1:表示全新安装 2：表示升级安装 3：普通打开

    this.qbVersion = 0;
    this.qbBuild = 0;
    if (props.qbVersion) {
      getDeviceVisitor().setQbVersion(props.qbVersion);
      this.originalQbVersion = `${props.qbVersion}`;
      this.qbVersion = FeedsUtils.getNumberQbVersion(props.qbVersion) || 0;
      this.qbBuild = FeedsUtils.getQbBuild(props.qbVersion);
    }
    this.primaryKey = props.primaryKey || -1; // 每一个feeds实例唯一标识
    this.pageUrl = props.tabUrl || props.url || '';
    setQbUrl(this.pageUrl);
  }
}
