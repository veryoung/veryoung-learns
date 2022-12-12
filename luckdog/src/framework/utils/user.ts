import { Platform, QBAccountModule } from '@tencent/hippy-react-qb';
import { logError } from '@/luckdog';
import { UserLoginType, HippyUserInfo } from '@/luckbox';

/** 登录面板参数 */
interface LoginPanelParam {
  /** 登录面板标题 */
  loginTitle: string;
  keyFromWhere?: number;
}

let gUserInfo: HippyUserInfo = {
  type: UserLoginType.GUEST,
  uin: '',
  qbid: '',
  nickname: '',
  appid: '',
  token: '',
  head: '',
  skey: '',
};

export const PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
};

/**
 * 异步获取用户信息，兼容iOS游客模式
 * @returns {Promise.<*>}
 */
export const getAccountInfo = async (forceUpdate = false): Promise<HippyUserInfo> => {
  try {
    if (gUserInfo && !forceUpdate) {
      if (Platform.OS !== PLATFORM.IOS) {
        return gUserInfo;
      }
    }

    gUserInfo = await QBAccountModule.getAccountInfo();
    if (PLATFORM.IOS === Platform.OS) {
      // 针对iOS平台适配游客模式
      if (!checkLogin()) {
        const guestInfo = await QBAccountModule.getGuestAccountInfo();
        updateUserInfo(guestInfo);
      }
    }
    return gUserInfo;
  } catch (error) {
    logError(error, 'user.getAccountInfo');
    return gUserInfo;
  }
};

/**
 * 校验是否登录，确保getAccountInfo之前有调用
 * @returns {boolean}
 */
export const checkLogin = (): boolean => {
  if (
    gUserInfo
    && [UserLoginType.QQ, UserLoginType.WECHAT, UserLoginType.QQCONNECT, UserLoginType.PHONE].includes(gUserInfo.type)
    && gUserInfo.uin && gUserInfo.qbid
  ) {
    // -1也被当做未登录处理
    return true;
  }
  return false;
};

/**
 * 更新userInfo，用户身份切换的事件监听或者游客登录场景会用到
 * @param args
 */
export const updateUserInfo = (args) => {
  try {
    const data = Object.assign({}, args);
    if (data.type) {
      if (data.type === UserLoginType.GUEST) {
        data.nickname = 'guest';
      }
      gUserInfo = data;
    }
  } catch (e) {
    logError(e, 'user.updateUserInfo');
  }
};

/**
 * 拉起登录面板，登录完成后返回用户信息
 * @returns {Promise.<*>}
 */
export const showLoginPanel = async ({ loginTitle, keyFromWhere }: LoginPanelParam = { loginTitle: '' }) => {
  try {
    const dataMap = {
      openType: 1,
      animated: false,
      LOGIN_CUSTOM_TITLE: loginTitle,
      key_from_where: keyFromWhere,
    };
    // 这里很坑，IOS登录成功和失败都是直接返回{result:0/1}表示，但android是抛出异常来表示失败的，返回{result:0}
    // 所以android登录失败必走catch逻辑
    const loginResult = await QBAccountModule.showLoginPanel(keyFromWhere, dataMap);
    return loginResult;
  } catch (error) {
    logError(error, 'user.showLoginPanel');
    return {};
  }
};

