import { logError } from '@/luckdog';
import {
  Dimensions, Platform, QBDeviceModule, QBToastModule,
} from '@tencent/hippy-react-qb';

// const orientation = 2 ; // 1 横屏、2 竖屏
let deviceInfo = {};

export const PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
};

/**
 * 大多场景传message即可，不传duration默认停留时间2秒，需要有link的时候才传linkMessage和doLink函数
 * showToast('message');
 * showToast('message', 20000, 'linkMessage', () => { console.log('dolinkCallback')});
 * @param doLink
 */
export const showToast = (message, duration = 2000, linkMessage = '', doLink, backupMessage = '') => {
  if (!backupMessage && !linkMessage) {
    backupMessage = message || ''; // eslint-disable-line no-param-reassign
  }
  QBToastModule.show(
    message.toString(),
    linkMessage.toString(),
    duration,
    backupMessage.toString(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  ).then(doLink, () => {});
};

/**
 * 获取设备信息
 * @returns {Promise.<*>}
 */
export const getDeviceInfo = async (): Promise<Record<string, any>> => {
  if (deviceInfo) {
    return deviceInfo;
  }

  try {
    deviceInfo = await QBDeviceModule.getDeviceInfo();
    return deviceInfo || {};
  } catch (error) {
    logError(error, 'device.getDeviceInfo');
    return {};
  }
};

export const getWidthHeight = () => {
  const {
    width,
    height,
  } = Dimensions.get('window'); // 屏幕宽高
  const bigSize = Math.max(width, height);
  const smallSize = Math.min(width, height);

  // Android端通过package.json下的bundleConfig.layoutfromtop为true，让系统状态栏悬浮栏就不在占据屏幕布局空间；iOS本身不占据屏幕高度，是悬浮状态。
  return {
    // 宽高默认为竖屏的宽高（暂时没有横屏场景）
    width: smallSize,
    height: bigSize,
    big: bigSize,
    small: smallSize,
  };
};

/** 是否ios手机 */
export const isIOS = Platform.OS === PLATFORM.IOS;

/** 是否是iPhoneX系列手机 */
export const isIPX = () => {
  if (Platform.OS !== PLATFORM.IOS) return false;
  if (Platform.OS === PLATFORM.IOS) {
    const { width, height } = Dimensions.get('window');
    return Math.max(height, width) === 812 || Math.max(height, width) === 896 || Dimensions.get('window').statusBarHeight > 20;
  }
};
