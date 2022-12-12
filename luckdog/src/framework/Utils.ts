/* eslint-disable no-restricted-syntax */
/**
 * teddy
 */

import { TabId } from '../entity';

// 数组去重, 只考虑值类型
export const uniqueArray = function (orgArr: any[]) {
  const ret: any[] = [];
  for (const item of orgArr) {
    if (ret.indexOf(item) === -1) {
      ret.push(item);
    }
  }
  return ret;
};

export const tafMapToArray = function (tafMap) {
  if (tafMap === null) {
    return null;
  }
  const map: any[] = [];
  let value;
  Object.keys(tafMap.value).forEach((key) => {
    value = tafMap.value[key];
    map.push([key, value]);
  });
  return map;
};

export const isGuidEmpty = function (guid) {
  return !guid || guid === '00000000000000000000000000000000' || guid === '0000000000000000';
};

export const asyncCall = function (func) {
  Promise.resolve()
    .then(func)
    .catch();
};

export const formatDate = function (date, inFmt) {
  let fmt = inFmt;
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  Object.keys(o).forEach((k) => {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length),
      );
    }
  });
  return fmt;
};

// needDecode表示是否需要decode参数，默认是true
export const getUrlQueryParam = function (url, key, needDecode = true) {
  let urlParams = {};
  try {
    if (url) {
      url = url.indexOf('?') > -1 ? url : `?${url}`; // eslint-disable-line no-param-reassign
      const queryStr = url.split('?')[1];
      if (queryStr) {
        const queryArray = queryStr.split('&');
        for (const queryItem of queryArray) {
          const item = queryItem.split('=');
          if (item[0] && item[1]) {
            try {
              urlParams[item[0]] = needDecode ? decodeURIComponent(item[1]) : item[1];
            } catch (e) {
              const [key, value] = item;
              urlParams[key] = value;
            }
          }
        }
      }
    }
  } catch (e) {
    urlParams = {};
  }
  return key ? (urlParams[key] || '') : urlParams;
};

export const isSupportNewPb = tabId => [
  TabId.BOY,
  TabId.GIRL,
  TabId.KNOWLEDGE,
].includes(tabId);

/** 获取出错信息 */
export const getErrorMessage = (code, lastNetInfoReach) => {
  if (code) {
    switch (code) {
      default:
        if (lastNetInfoReach === 'NONE') {
          return '网络已断开，连接后重试';
        }
        return '网络异常，请稍候重试';
      case 0:
        return '';
      case -1:
        return '更新失败，请稍后重试';
      case -2:
        return '更新失败，请稍后再试';
      case -3:
        return '刷新过于频繁，请稍后再试';
      case -4:
        return '网络请求超时，请稍候重试';
      case -10000:
        return '网络异常，请稍候重试';
      case -13000:
        return '后台超时，请稍候重试';
    }
  }
  return '';
};
