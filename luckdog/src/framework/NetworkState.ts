/* eslint-disable no-use-before-define */
/**
 * Created by piovachen on 2017/7/21.
 */
import { Platform, QBDeviceModule } from '@tencent/hippy-react-qb';
import FeedsConst, { ApnType } from './FeedsConst';

import { logError } from '@/luckdog';

const getApn = function (network) {
  const rNetwork = `${network}`.toLocaleLowerCase();
  switch (rNetwork) {
    case '2g':
      return ApnType.M_2G;
    case '3g':
      return ApnType.M_3G;
    case 'mobile':
    case '4g':
      return ApnType.M_4G;
    case 'wifi':
      return ApnType.WIFI;
    default:
      return ApnType.NONE;
  }
};

const getNetwork = function (network) {
  const rNetwork = `${network}`.toLocaleLowerCase();
  switch (rNetwork) {
    case '2g':
    case '3g':
    case 'mobile':
    case '4g':
      return NetworkState.NetworkTypes.MOBILE;
    case 'wifi':
      return NetworkState.NetworkTypes.WIFI;
    default:
      return NetworkState.NetworkTypes.NONE;
  }
};

export default class NetworkState {
  public static currentReach: string;
  public static NetworkTypes: any;
  public static currentAPN: number;
  public static currentNetType: any;
  public static currentOriginalNetworkType: string;
  public static currentNetWork: any;

  public static updateStateByReach(reach) {
    // network: "", //SDK定义的类型// apn: 0,  //list协议定义的类型
    // NetInfoReach: null, //RN回调
    const rReach = `${reach}`.toLocaleLowerCase();
    NetworkState.currentReach = rReach;
    let currentNetType = NetworkState.NetworkTypes.NONE;
    switch (rReach) {
      case 'none':
        currentNetType = NetworkState.NetworkTypes.NONE;
        break;
      case 'bluetooth':
      case 'cell':
      case 'mobile':
      case 'wimax':
      case 'dummy':
        currentNetType = NetworkState.NetworkTypes.MOBILE;
        break;
      case 'wifi':
        currentNetType = NetworkState.NetworkTypes.WIFI;
        break;
      default:
        currentNetType = NetworkState.NetworkTypes.NONE;
        break;
    }
    if (
      currentNetType !== NetworkState.currentNetType
      && currentNetType !== NetworkState.NetworkTypes.NONE
    ) {
      NetworkState.currentNetType = currentNetType;
      if (Platform.OS === 'ios') {
        setTimeout(() => {
          QBDeviceModule.getDeviceInfo()
            .then((devInfo) => {
              NetworkState.currentAPN = getApn(devInfo.networkType);
              NetworkState.currentOriginalNetworkType = devInfo.networkType;
            })
            .catch((e) => {
              logError(e, 'NetworkState.updateStateByReach');
            });
        }, 200);
      } else {
        QBDeviceModule.getDeviceInfo()
          .then((devInfo) => {
            NetworkState.currentAPN = getApn(devInfo.networkType);
            NetworkState.currentOriginalNetworkType = devInfo.networkType;
          })
          .catch((e) => {
            logError(e, 'NetworkState.updateStateByReach');
          });
      }
      return true;
    }
    return false;
  }

  public static updateState() {
    QBDeviceModule.getDeviceInfo()
      .then((devInfo) => {
        NetworkState.currentNetType = getNetwork(devInfo.networkType);
        NetworkState.currentAPN = getApn(devInfo.networkType);
        NetworkState.currentOriginalNetworkType = devInfo.networkType;
      })
      .catch((e) => {
        logError(e, 'NetworkState.updateState');
      });
  }

  public static async getNewState(devInfoParam?: any) {
    try {
      const devInfo = devInfoParam || (await QBDeviceModule.getDeviceInfo());
      NetworkState.currentNetWork = devInfo.networkType;
      NetworkState.currentNetType = getNetwork(devInfo.networkType);
      NetworkState.currentAPN = getApn(devInfo.networkType);
      NetworkState.currentOriginalNetworkType = devInfo.networkType;
      return NetworkState.currentNetType;
    } catch (e) {
      return NetworkState.currentNetType;
    }
  }

  public static async getOriginalNetworkType() {
    try {
      const devInfo = FeedsConst.getGlobalConfKV('deviceInfo') || (await QBDeviceModule.getDeviceInfo());
      NetworkState.currentOriginalNetworkType = devInfo.networkType;
      return devInfo.networkType;
    } catch (e) {
      return 'none';
    }
  }
}

// NetworkState.lastNetInfoType = NetworkState.NetworkTypes.WIFI;
NetworkState.NetworkTypes = {
  NONE: 'NONE',
  WIFI: 'WIFI',
  MOBILE: 'MOBILE',
};

NetworkState.currentNetType = NetworkState.NetworkTypes.NONE;
NetworkState.currentAPN = ApnType.NONE; // list协议定义的类型
NetworkState.currentReach = ''; // RN回调
NetworkState.currentOriginalNetworkType = 'none';
