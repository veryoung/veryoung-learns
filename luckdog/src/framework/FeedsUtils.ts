/* eslint-disable camelcase */
/**
 * Created by piovachen on 2017/5/1.
 */
import {
  Dimensions,
  QBWindowModule,
  Platform,
  AsyncStorage,
} from '@tencent/hippy-react-qb';

import FeedsAbilities from './FeedsAbilities';
import FeedsConst, { BUSI_TYPE_TO_ANIM_MAP, dtConst, TRANSITION_ANIM_MAP } from './FeedsConst';
import { logError } from '@/luckdog';
import { FeedsTheme } from '../feeds-styles/tab-22/components/utils';
import { SkinModelType } from '../entity/skin';
import { LeftTag, TagsStyle } from '../types/card';
import { Tag, TagColors, TagStyle } from './protocol';
import { RightLink } from '@/entity';
class LeftTagConfig {
  public text = '';
  public offsetY = 0;
  public offsetX = 0;
  public width = 0;
  public height = 0;
  public isOld = true;
  public type = 0;
  public url = '';

  public constructor(props) {
    this.height = props.height;
    this.width = props.width;
    this.offsetX = props.offsetX;
    this.offsetY = props.offsetY;
  }
}

export default class FeedsUtils {
  /**
   * 添加url参数
   * @param url
   * @param param
   * @returns {string}
   */
  public static addUrlParam(inUrl = '', param = '') {
    let url = inUrl;
    if ((url || '').indexOf('?') > -1) {
      if (param.indexOf('&') === 0) {
        url += param;
      } else {
        url += `&${param}`;
      }
    } else if (param.indexOf('&') === 0) {
      url += `?${param.split('&')[1] || ''}`;
    } else {
      url += `?${param}`;
    }
    return url;
  }

  public static getDtParams = (data, itemBean?: any, index = 0) => {
    let params = {};
    const staticParams = {
      tab_id: dtConst.tab_id, // 固定写死的
    };
    if (itemBean) {
      params = {
        rowkey: itemBean.isSingleReport ? itemBean.item_id.split('|')[index] : itemBean.item_id,
      };
      try {
        // 透传后台下发
        const dtExtInfo = JSON.parse(FeedsUtils.getSafeProps(itemBean, 'ext_info.dtExtInfo') || '[]');
        params = {
          rowkey: itemBean.item_id,
          ...dtExtInfo[index],
        };
      } catch (error) {
        logError(error, 'FeedsUtils.getDtParams');
      }
    }
    return FeedsUtils.stringify({ ...params, ...data, ...staticParams });
  };

  /**
   * 获取大同上报策略
   * @param {object} itemBean
   * @param {*boolean} isCard 是否是卡片父节点
   * @return {string} 上报采集策略： "1"-只采集曝光;  "2"- 只采集交互点击; "3"- 采集所有; 其他-不采集
   */
  public static getDtPolicy(itemBean: any = {}, isCard = false) {
    if (isCard) {
      const reportPolicy = dtConst.policy.clck;
      return itemBean.business === 6 ? '0' : reportPolicy; // 广告不上报
    }
    if (itemBean.business !== 6) {
      return dtConst.policy.clck;
    }
    return dtConst.policy.none;
  }

  public static isAndroid() {
    return Platform.OS.toLowerCase() === 'android';
  }

  /**
   * 1:图文 2:图集 3:视频 4:直播 5:商业广告 6:运营栏目 7:话题圈 10:小说
   * 11:游戏 12:软件应用 13:登录引导 14:问答 15:体育直播 16:音频 17:趣漫 19:小视频 21:搞笑 23:社区短内容
   */
  public static getBusiType(itemBean: any = {}) {
    let busiType = null;
    try {
      if (itemBean.ext_info?.ug_ext_info) {
        const { item_ext_info: itemExtInfo = [] } = JSON.parse(itemBean.ext_info.ug_ext_info);
        busiType = (itemExtInfo[0] || {}).busi_type;
      }
      if (!busiType && Array.isArray(itemBean.report_info)) {
        const busiTypeKeyIndex = 0;
        const busiTypeValueIndex = 1;
        const busiArray = itemBean.report_info.find(item => Array.isArray(item) && item[busiTypeKeyIndex] === 'busi');
        if (Array.isArray(busiArray)) {
          busiType = busiArray[busiTypeValueIndex];
        }
      }
    } catch (err) {
      logError(err, 'FeedsUtils.getBusiType');
    }
    return busiType;
  }

  /**
   * 判断是否开启过渡动画
   * @param url
   * @param itemBean
   * @param busiForcedType 强制开启动画类型
   * @param instanceExistForcedFlag 实例是否强制去除判断
   * @returns {Promise<boolean>}
   */
  public static async isTransitionAnimNeedInvoke(url, itemBean, busiForcedType = -1, instanceExistForcedFlag = false) {
    if (!url || !itemBean) return false;
    if (FeedsUtils.isQbVersionBigger('10.2.0.0000') >= 0) {
      // 获取业务类型
      const busiType: any = FeedsUtils.getBusiType(itemBean);
      const transitionAnim = FeedsConst.getGlobalConfKV('transitionAnim') || [];

      const animIndex = BUSI_TYPE_TO_ANIM_MAP[busiType];
      const forcedTransitionFlag = transitionAnim[busiForcedType] === 1;
      if ((typeof animIndex !== 'undefined' && transitionAnim[animIndex]) || forcedTransitionFlag) {
        if (instanceExistForcedFlag) return true;
        // 判断是否存在壳实例
        try {
          const res = await FeedsAbilities.isPreloadInstanceExist({ qbURL: url });

          if (res === true || res === 'true') {
            return true;
          }
        } catch (err) {
          logError(err, 'FeedsUtils.isTransitionAnimNeedInvoke');
        }
        return false;
      }
      return false;
    }
    return false;
  }

  public static async doLoadUrl(inUrl, tabId = '0', needDistort = false, itemBean = {}) {
    let url = inUrl;
    const id = parseInt(tabId, 10);
    const fromWhere = 100000 + id; // 现在基数是100000，传fromWhere的时候要加上这个基数，不是原来的60
    const dataMap: any = {
      openType: 1,
      fromWhere,
      needDistort,
    };
    try {
      if (/qb:\/\/ext\/rn\?module=ugcfloat/.test(url)) {
        const animateRes = await Promise.all([
          await FeedsUtils.isTransitionAnimNeedInvoke(url, itemBean),
        ]);
        dataMap.animated = animateRes?.[0] && animateRes[1];
      } else if (url.indexOf('qb://ext/rn?module=fun') >= 0) {
        // 加上点击时长统计
        url = FeedsUtils.addUrlParam(url, `&funClickStart=${Date.now()}`);
        dataMap.animated = await FeedsUtils.isTransitionAnimNeedInvoke(
          url,
          itemBean,
          TRANSITION_ANIM_MAP.SHORTFLOAT,
          true,
        );
      } else {
        dataMap.animated = await FeedsUtils.isTransitionAnimNeedInvoke(url, itemBean);
      }
      QBWindowModule.loadUrl(url, dataMap);
    } catch (err) {
      logError(err, 'FeedsUtils.doLoadUrl');
    }
  }

  public static stringify(params) {
    const arr: any[] = [];
    if (typeof params === 'object') {
      Object.keys(params).forEach((key) => {
        if ({}.hasOwnProperty.call(params, key)) {
          if (params[key]) {
            // 空的字符串就不拼接了
            const valType = typeof params[key];
            if (valType === 'string' || valType === 'number') {
              arr.push(`${key}=${encodeURIComponent(params[key])}`);
            }
          }
        }
      });
      return arr.length ? arr.join('&') : '';
    }
    return '';
  }

  public static getScreenWidth() {
    // 以短的那条边做屏幕宽度
    const screenWidth = Dimensions.get('screen').width;
    const screenHeight = Dimensions.get('screen').height;
    const width = screenWidth > screenHeight ? screenHeight : screenWidth;
    return Math.floor(width);
  }

  /**
   * 获取屏幕宽高
   * @returns {{width: *, height: *}}
   */
  public static getScreen() {
    // 以短的那条边做屏幕宽度
    let { width, height } = Dimensions.get('screen');
    if (width > height) {
      [width, height] = [height, width];
    }
    return {
      width,
      height,
    };
  }

  public static parseQueryString(url) {
    const ret: any = {};
    if (!url) {
      return ret;
    }
    // eslint-disable-next-line no-param-reassign
    url += '';
    if (url.indexOf('?') === -1) {
      return ret;
    }
    const start = url.indexOf('?');
    const end = url.indexOf('#');
    let search = '';
    if (end === -1) {
      search = url.slice(start + 1);
    } else {
      search = url.slice(start + 1, end);
    }
    const searchArr = search.split('&');
    if (searchArr.length) {
      let itemArr: any[] = [];
      searchArr.forEach((item) => {
        itemArr = item.split('=');
        if (itemArr.length >= 2) {
          ret[itemArr[0]] = decodeURIComponent(itemArr[1]);
        }
      });
    }
    return ret;
  }

  public static getNumberQbVersion(qbVersionStr) {
    if (qbVersionStr) {
      try {
        const reg = new RegExp('\\.', 'g');
        const newVersionStr = qbVersionStr.replace(reg, '');
        return parseInt(newVersionStr, 10);
      } catch (e) {
        // console.log(e);
      }
    }

    // 返回小的版本号，让版本以最兼容模式运行，
    return 0;
  }

  /** 提取版本的前三段 */
  public static getQbBuild(qbVersionStr) {
    if (!qbVersionStr) return 0;

    const [v1 = '0', v2 = '0', v3 = '0'] = qbVersionStr.split('.');
    return parseInt(`${v1}${v2}${v3}`, 10);
  }

  public static parseQuery(queryStr) {
    const queryObj = {};
    try {
      if (queryStr) {
        const queryArray = queryStr.split('&');
        queryArray.forEach((queryItem) => {
          const item = queryItem.split('=');
          if (item.length === 2) {
            queryObj[item[0]] = decodeURIComponent(item[1]);
          }
        });
      }
    } catch (ex) {
      // console.error(`parse querystring failed ${queryStr}`);
    }
    return queryObj;
  }

  public static async setAppInstallTime(time) {
    try {
      return await AsyncStorage.setItem('qb_install_time', JSON.stringify(time));
    } catch (err) {
      logError(err, 'FeedsUtils.setAppInstallTime');
    }
  }

  public static async setAppUpdateTime(time) {
    try {
      return await AsyncStorage.setItem('qb_update_time', JSON.stringify(time));
    } catch (err) {
      logError(err, 'FeedsUtils.setAppUpdateTime');
    }
  }

  public static async getAppInstallTime() {
    try {
      const appTime = await AsyncStorage.getItem('qb_install_time');
      if (appTime) {
        return JSON.parse(appTime);
      }
      return null;
    } catch (err) {
      logError(err, 'FeedsUtils.getAppInstallTime');
      return null;
    }
  }

  public static async getAppUpdateTime() {
    try {
      const appTime = await AsyncStorage.getItem('qb_update_time');
      if (appTime) {
        return JSON.parse(appTime);
      }
      return null;
    } catch (err) {
      return null;
    }
  }


  /**
   * 判断qb版本与指定版本的大小
   * @param targetQbVersion 目标qb版本
   * @returns {number} 1: 大于 0：等于 -1：小于
   */
  public static isQbVersionBigger(targetQbVersion = '') {
    if (!targetQbVersion) return -1;
    const originalQbVersion = FeedsConst.getGlobalConfKV('originalQbVersion');
    const toNum = function (originalNum) {
      const a = `${originalNum}`;
      const c = a.split('.');
      const r = ['0000', '000', '00', '0', ''];
      for (let i = 0; i < c.length; i += 1) {
        let len = c[i].length;
        if (len > 4) {
          len = 4;
          c[i] = c[i].slice(0, 4);
        }
        c[i] = r[len] + c[i];
      }
      return c.join('');
    };
    const numberA = toNum(originalQbVersion);
    const numberB = toNum(targetQbVersion);
    if (numberA === numberB) {
      return 0;
    }
    if (numberA > numberB) {
      return 1;
    }
    return -1;
  }

  /**
   * promise超时处理
   * @param promise
   * @param timeoutMs promise超时值
   * @param isTimeoutReject timeout时是否reject， 默认reject
   * @returns {Promise<unknown>}
   */
  public static async promiseTimeout(promise, timeoutMs = 99999, isTimeoutReject = true) {
    let timeoutHandler: any = null;
    try {
      const timeoutPromise = new Promise((resolve, reject) => {
        timeoutHandler = setTimeout(() => {
          clearTimeout(timeoutHandler);
          if (isTimeoutReject) {
            reject({ timeCode: 1 });
          } else {
            resolve({ timeCode: 1 });
          }
        }, timeoutMs);
      });
      return Promise.race([promise, timeoutPromise]).then((result) => {
        clearTimeout(timeoutHandler);
        return result;
      });
    } catch (err) {
      logError(err, 'FeedsUtils.promiseTimeout');
    }
  }

  public static getSkinData = (data) => {
    if (!data) {
      logError(`getSkinData params should be array, but data is ${data}`, 'FeedsUtils.getSkinData');
      return;
    }
    const skinId = FeedsTheme.returnSkinId(); // 日间：0 夜间：1 浅色：2 深色：3
    switch (skinId) {
      case SkinModelType.NORMAL:
        return data[0];
      case SkinModelType.NIGHT:
        return data[1];
      case SkinModelType.LIGHT:
        return data[2] || data[0];
      case SkinModelType.DARK:
        return data[3] || data[1];
      default:
        return data[0] || '';
    }
  };

  /**
   * 安全从对象中通过路径解构出值
   * obj 解构对象
   * path 取值路径
   * defaultValue 默认值
   */
  public static getSafeProps(obj, path, defaultValue: any = null) {
    const v = (path.split ? path.split('.') : path).reduce((o, p) => o?.[p], obj);
    return (v === undefined || v === null) ? defaultValue : v;
  }

  /**
   * 安全获得左边角标
   */
  public static getLeftTagStyle = (stTag: LeftTag, style: TagsStyle): LeftTagConfig => {
    const { width = 0, height = 0, offsetX = 0, offsetY = 0 } = style;
    const defaultBookStyle = 4;
    const leftTag = new LeftTagConfig({
      width,
      height,
      offsetX,
      offsetY,
    });
    if (Array.isArray(stTag)) {
      leftTag.text = stTag[0] || '';
      leftTag.type = defaultBookStyle;
      leftTag.isOld = false;
      return leftTag;
    }
    if (stTag?.sText) {
      const { sText = '', bIsNew = false, iColor } = stTag;
      if (bIsNew) {
        leftTag.isOld = false;
      }
      leftTag.type = defaultBookStyle;
      // 本地书需要采用本地书样式
      if (sText === 'TXT') {
        leftTag.type = iColor || defaultBookStyle;
      }
      leftTag.text = sText;
    }
    return leftTag;
  };

  /** 新协议下书籍角标 */
  public static getBookTagStyle = (tag: Tag, style: TagsStyle): LeftTagConfig => {
    const { width = 0, height = 0, offsetX = 0, offsetY = 0 } = style;
    const leftTag = new LeftTagConfig({
      width,
      height,
      offsetX,
      offsetY,
    });
    const { tagName, tagColors, tagStyle, iconUrl } = tag;
    leftTag.text = tagName;

    if (tagStyle === TagStyle.NORMAL) {
      leftTag.type = tagColors || TagColors.RED;
    }

    if (tagStyle === TagStyle.PIC && iconUrl) {
      leftTag.isOld = false;
      leftTag.url = iconUrl;
    }
    return leftTag;
  };

  /**
   * TODO：Title切换到新协议后可停用
   * 右上角Link结构体转换
   * 后面用新协议重构Title组件则不需要转换了
   */
  public static convertTitleRight = (jumpLink): RightLink => {
    const { linkName: sText, linkUrl: sUrl } = jumpLink || {};
    return { sText, sUrl };
  };
}
