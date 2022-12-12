/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable no-bitwise */
/**
 * Created by rqzheng on 2017/3/13.
 */
import { PixelRatio, Dimensions } from '@tencent/hippy-react-qb';
import { logError } from '@/luckdog';

const FormatUtils = {
  /**
   * 将输入的次数转换为人性化描述 xx万，ui103等用
   */
  formatNum(num) {
    if (typeof num !== 'number') return num;
    if (!Number.isFinite(num)) return Math.round(num);
    if (num < 0) {
      return null;
    }
    if (num < 10000) return num;
    if (num < 100000) return `${(num / 10000).toFixed(1)}万`;
    if (num < 1000000) return `${(num / 10000).toFixed(0)}万`;
    return '99万+';
  },

  formatLength(length) {
    const pr = PixelRatio.get();
    return Math.floor(Math.floor(length / pr) * pr);
  },

  /** 时间补位方法 */
  fixTime(time): string {
    return time < 10 ? `0${time}` : time;
  },

  /** 时间格式转换 */
  formatDate(dateVal: number | Date = new Date(), onlyDate = false, withSeparator = false): string {
    const date = typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const firstSeparator = withSeparator ? '-' : '';
    const secondSeparator = withSeparator ? ':' : '';
    const simpleDateFormat = `${year}${firstSeparator}${this.fixTime(month)}${firstSeparator}${this.fixTime(day)}`;
    if (onlyDate) {
      return simpleDateFormat;
    }
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${simpleDateFormat}${withSeparator ? ' ' : ''}${this.fixTime(hour)}${secondSeparator}${this.fixTime(minute)}`;
  },

  /**
   * 转换设计稿长度单位
   * @param length 设计稿上的长度
   * @param designBaseWidth 设计稿总宽度，750 是 2 倍宽度
   * @param pxRatio 几倍图
   * @returns 转换后的长度
   */
  formatDesignLength(length = 0, designBaseWidth = 750, pxRatio = 3): number {
    // ratio = 当前屏幕宽度 / 设计稿宽度
    const ratio = ConstantUtils.getScreenWidth() / designBaseWidth;
    return Math.floor(length * (2 / pxRatio) * ratio);
  },
};

const ConstantUtils = {
  getScreenWidth() {
    // 以短的那条边做屏幕宽度
    const screenWidth = Dimensions.get('screen').width;
    const screenHeight = Dimensions.get('screen').height;
    if (screenWidth > screenHeight) {
      return screenHeight;
    }
    return screenWidth;
  },
  getScreenHeight() {
    // 以短的那条边做屏幕宽度
    const screenWidth = Dimensions.get('screen').width;
    const screenHeight = Dimensions.get('screen').height;
    if (screenWidth > screenHeight) {
      return screenWidth;
    }
    return screenHeight;
  },
  getDimensionsScreen() {
    return Dimensions.get('screen');
  },
  getDimensionsWindow() {
    // fix终端返回的宽高错位
    const data = Dimensions.get('screen');
    const { height, width } = data;
    if (height < width) {
      return {
        ...data,
        width: height,
        height: width,
      };
    }
    return data;
  },
};

const NetUtils = {
  fetchPromise(path, jsonParam = '', method = 'get', timeout = '30000', headers = {}) {
    try {
      return Promise.race([
        fetch(path, {
          method,
          body: jsonParam,
          headers,
        }),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        new Promise(((_resolve, reject) => {
          setTimeout(() => reject(new Error('网络状况不太好,再刷新一次?')), parseInt(timeout, 10));
        })),
      ])
        .then((res: any) => {
          if (res.status === 200) {
            return res.json();
          }
          return Promise.reject(new Error(`网络状况错误~,网络状态号为: ${res.status}`));
        })
        .catch(error => Promise.reject(new Error(error.message)));
    } catch (error) {
      return Promise.reject(new Error(error.message));
    }
  },
};

let zoomRatio = 0;
const px = function px(size, padding = 0, designScreenWidth = 750) {
  if (!zoomRatio) {
    zoomRatio = ConstantUtils.getScreenWidth() / designScreenWidth;
  }
  return zoomRatio * (size - padding);
};

const isSmallScreen = ConstantUtils.getScreenWidth() === 320;

// eslint-disable-next-line arrow-parens
const safeJsonParse = <T>(str?: string): T => {
  if (!str) return {} as T;
  try {
    const obj = JSON.parse(str) as T;
    return obj;
  } catch (err) {
    logError(err, 'safeJsonParse');
  }
  return {} as T;
};

export { FormatUtils, ConstantUtils, NetUtils, px, isSmallScreen, safeJsonParse };
