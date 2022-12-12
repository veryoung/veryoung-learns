/**
 * Created by piovachen on 2017/5/25.
 */
import { QBNativeProxyModule, Platform } from '@tencent/hippy-react-qb';

import { MODULE } from './FeedsConst';
import { logError } from '@/luckdog';
import { isTopTab } from '@/luckbox';
import { TabBackground } from '../entity';

const ERROR_STRING = 'there is no';

const ABILITY_JS_API_CALLBACK = { name: 'jsApiCallback', version: 1 };
const ABILITY_SEND_ACTION = { name: 'sendAction', version: 1 };
const ABILITY_LOG = { name: 'log', version: 1 };
const ABILITY_GET_WIFI_INFO = { name: 'getWifiInfo', version: 1 };
const ABILITY_UP_PULL_REFRESH = { name: 'onUpPullRefresh', version: 1 };
const ABILITY_DOWN_PULL_REFRESH = { name: 'onDownPullRefresh', version: 1 };
const ABILITY_LOAD_NOVEL_LOCAL_BOOKS = { name: 'loadNovelLocalBooks', version: 1 }; // 加载txt书籍
const ABILITY_OPEN_NOVEL_LOCAL_BOOK = { name: 'openNovelLocalBook', version: 1 }; // 打开txt书籍
const ABILITY_DELETE_NOVEL_LOCAL_BOOKS = { name: 'deleteNovelLocalBooks', version: 1 }; // 删除txt书籍
const ABILITY_IMPORT_NOVEL_LOCAL_BOOKS = { name: 'importNovelLocalBooks', version: 1 }; // 导入txt书籍
const ABILITY_IS_PRELOAD_INSTANCE_EXIST = { name: 'isPreloadInstanceExist', version: 1 };
const REQ_HOT_WORD_WITH_ITEM_ID = { name: 'requestHotWordWithItemId', version: 1 };
const ABILITY_PRESET_TAB_PAGE_IMAGES = { name: 'presetTabPageImages', version: 1 }; // 预下载tab背景图
const ABILITY_SET_TAB_PAGE_BG_IMAGE = { name: 'setTabPageBgImage', version: 1 }; // 设置tab背景图
const ABILITY_CLEAR_TAB_PAGE_BG_IMAGE = { name: 'clearTabPageBgImage', version: 1 }; // 恢复tab背景图


const abilitiesMap = new Map();
let commonModule = MODULE;
const favoriteType = {
  htmlPage: 'htmlPage',
  picture: 'picture',
  gallery: 'gallery',
  ziXun: 'ziXun',
  video: 'video',
};

const action = {
  feedsMode: 'feedsMode',
  feedsNonTopMode: 'feedsNonTopMode',
  follow: 'follow',
  statUseTime: 'statUseTime',
  prepareIdleFeeds: 'prepareIdleFeeds', // 通知终端预加载隐藏feeds
};

const onloadUrlMode = {
  FIRST_INSTALL_AND_INIT: 1,
  UPDATE_INSTALL_AND_INIT: 2,
  INIT: 3,
  NORMAL: 4,
};

export default class FeedsAbilities {
  public static favoriteType = favoriteType;
  public static action = action;
  public static onloadUrlMode = onloadUrlMode;
  public static init(abilities) {
    /** 当为顶部tab的时候 iframe仍然通过feeds的模块去调取终端能力 */
    if (isTopTab()) commonModule = 'feeds';
    if (abilitiesMap.size === 0) {
      let abilityList;
      try {
        abilityList = JSON.parse(abilities);
      } catch (err) {
        logError(err, 'FeedsAbilities.init');
        return;
      }
      abilityList.forEach((ability) => {
        abilitiesMap.set(ability.name, ability);
      });
    }
  }

  public static checkEnable(ability) {
    const enableAbility = abilitiesMap.get(ability.name);
    if (!enableAbility || enableAbility.version < ability.version) {
      return false;
    }
    return true;
  }

  /**
   * 调用终端逻辑 无返回
   * @param ability
   * @param args
   * @private
   */
  public static sendNativeMethod(ability, args) {
    if (!FeedsAbilities.checkEnable(ability)) {
      return;
    }
    try {
      Promise.resolve()
        .then(() => {
          if (Platform.OS === 'android') {
            QBNativeProxyModule.callNativeMethod(commonModule, ability.name, args, null);
          } else {
            QBNativeProxyModule.callNativeMethod(commonModule, ability.name, args, () => null);
          }
        })
        .catch((err) => {
          logError(err, 'FeedsAbilities.sendNativeMethod');
        });
    } catch (err) {
      logError(err, 'FeedsAbilities.sendNativeMethod2');
    }
  }

  /**
   * 调用终端逻辑 带返回
   * @param ability
   * @param args
   * @returns {*}
   * @private
   */
  public static callNativeMethod(ability, args = {}) {
    if (!FeedsAbilities.checkEnable(ability)) {
      return Promise.reject(`do not support this ability, ability = ${ability.name}`);
    }

    return new Promise((resolve, reject) => {
      try {
        QBNativeProxyModule.callNativeMethod(commonModule, ability.name, args, (callback) => {
          if (
            typeof callback === 'string'
            && callback.slice(0, ERROR_STRING.length) === ERROR_STRING
          ) {
            reject('disable');
          } else {
            resolve(callback);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 调用终端逻辑 带返回（针对安卓特殊处理）
   * @param ability
   * @param args
   * @returns {*}
   * @private
   */
  public static callNativeMethodNormal(ability, args) {
    return this.callNativeMethod(ability, args).then((rst: any) => {
      if (Platform.OS === 'ios') {
        return rst;
      }
      let ret = null;
      try {
        ret = JSON.parse(rst);
      } catch (e) {
        logError(e, 'FeedsAbilities.callNativeMethodNormal');
      }
      return ret;
    });
  }

  /**
   * 执行 Javascript 调用的回调
   * args 必填参数
   * @param {INTEGER} callbackId 回调 ID 号，用于终端找到对应的方法执行回调
   * ... 其它业务参数
   */
  public static execJsApiCallback(args) {
    return FeedsAbilities.callNativeMethod(ABILITY_JS_API_CALLBACK, args);
  }

  /**
   * 上传日志
   * @param log
   */
  public static log(log) {
    if (Platform.OS === 'android') {
      FeedsAbilities.sendNativeMethod(ABILITY_LOG, log);
    }
  }

  public static getWifiInfo(args?: any) {
    // eslint-disable-next-line consistent-return
    return new Promise((resolve) => {
      // iOS NativeProxyModule is not support getWifiInfo method
      // returns empty object directly.
      if (Platform.OS === 'ios') {
        return resolve({});
      }
      QBNativeProxyModule.callNativeMethod(commonModule, ABILITY_GET_WIFI_INFO.name, args, (param) => {
        resolve(param);
      });
    });
  }

  public static isPreloadInstanceExist(args) {
    return FeedsAbilities.callNativeMethod(ABILITY_IS_PRELOAD_INSTANCE_EXIST, args);
  }

  public static sendAction(action, params) {
    let args = { action };
    if (params) {
      args = Object.assign(args, params);
    }
    FeedsAbilities.sendNativeMethod(ABILITY_SEND_ACTION, args);
  }

  /** 通知终端itemid进行搜索框词
   * @param {string} itemId
   */
  public static requestHotWordWithItemId(itemId) {
    FeedsAbilities.sendNativeMethod(REQ_HOT_WORD_WITH_ITEM_ID, { itemId });
  }

  /**
   * 上拉刷新
   */
  public static notifyUpPullRefresh() {
    FeedsAbilities.sendNativeMethod(ABILITY_UP_PULL_REFRESH, {});
  }

  /**
   * 下拉刷新
   */
  public static notifyDownPullRefresh() {
    FeedsAbilities.sendNativeMethod(ABILITY_DOWN_PULL_REFRESH, {});
  }

  /** 加载txt本地书籍
     * callback({bookInfos:[bookInfo1, bookInfo2, ...]})
        bookInfo = {bookType, bookId, bookName, timeStamp}
        // 参数说明
        // bookType: 文件类型txt或epub，bookId：文件id，bookName：书籍文件名， timeStamp：添加文件到书架或阅读时间戳
     */
  public static loadNovelLocalBooks() {
    return FeedsAbilities.callNativeMethodNormal(ABILITY_LOAD_NOVEL_LOCAL_BOOKS, {});
  }
  /** 打开本地文件
   * @param {string} bookId 书籍id
   * callback({success:true/false})
   */

  public static openNovelLocalBook(bookId) {
    return FeedsAbilities.callNativeMethodNormal(ABILITY_OPEN_NOVEL_LOCAL_BOOK, { bookId });
  }

  // 删除txt本地书籍
  public static deleteNovelLocalBooks(bookIds) {
    return FeedsAbilities.callNativeMethodNormal(ABILITY_DELETE_NOVEL_LOCAL_BOOKS, { bookIds });
  }

  // 加载txt本地书籍
  public static importNovelLocalBooks() {
    return FeedsAbilities.callNativeMethodNormal(ABILITY_IMPORT_NOVEL_LOCAL_BOOKS, {});
  }

  /** 预下载tab背景图 */
  public static presetTabPageImages(picUrls: string[]) {
    return FeedsAbilities.callNativeMethod(ABILITY_PRESET_TAB_PAGE_IMAGES, {
      key: 'urls',
      value: picUrls,
    });
  }

  /** 设置tab背景图 */
  public static setTabPageBgImage(tabBgParams: TabBackground) {
    return FeedsAbilities.callNativeMethod(ABILITY_SET_TAB_PAGE_BG_IMAGE, tabBgParams);
  }

  /** 恢复tab背景图 */
  public static clearTabPageBgImage() {
    return FeedsAbilities.callNativeMethod(ABILITY_CLEAR_TAB_PAGE_BG_IMAGE);
  }
}
