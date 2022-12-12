import { UserVisitor } from '@tencent/luckbox-hippy-user';
import { DeviceVisitor } from '@tencent/luckbox-hippy-device';
import { showToast } from './hippy';
import { bundleConfig } from '../../package.json';
import { addKeylink, logError } from '@/luckdog';
import { USER_QBID } from '../framework/FeedsConst';
import { writeSharedSettings } from '../utils/shareSettings';

const TAG = 'native-adapter';

let deviceVisitor: DeviceVisitor;
let userVisitor: UserVisitor;

/** 宿主设备信息访问器 */
export const getDeviceVisitor = (): DeviceVisitor => {
  if (deviceVisitor) return deviceVisitor;
  deviceVisitor = new DeviceVisitor({
    jsVersion: bundleConfig.VC,
    logError,
  });
  return deviceVisitor;
};

/** 用户信息访问器 */
export const getUserVisitor = (): UserVisitor => {
  if (userVisitor) return userVisitor;
  userVisitor = new UserVisitor({
    instantLoad: true,
    logError,
    getHostDeviceInfo: () => getDeviceVisitor().isReady(),
    showToast,
  });
  return userVisitor;
};

/** 从sharedSettings中清除qbid */

/** 清除缓存中的 qbid */
export const removeUserQbid = async (): Promise<void> => {
  try {
    const { qbid } = await getUserVisitor().isUserReady();
    if (qbid) return;
    addKeylink('清除sharedSettings中的qbid', TAG);
    writeSharedSettings(USER_QBID, '');
  } catch (err) {
    logError(err, `${TAG}.removeUserQbid`);
  }
};
