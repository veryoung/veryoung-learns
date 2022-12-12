import { checkLogin } from '@/framework/utils/user';
import { getDeviceVisitor, getUserVisitor, timeoutPromise } from '@/luckbox';
import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { HostUserType } from '@tencent/luckbox-hippy-user';

const TAG = 'fetch';

export enum ENV {
  REAL = 'REAL',
  DEV = 'DEV',
  GRAY = 'GRAY',
}

type CookieKey = 'Q-H5-USERTYPE' | 'Q-H5-SKEY' | 'Q-H5-LSKEY' | 'Q-H5-TOKEN' | 'Q-H5-OPENID' | 'Q-H5-QBID' | 'Q-H5-GUID'
| 'Q-H5-ID' | 'Q-H5-ACCOUNT' | 'qbid';

type CookieMap = Record<CookieKey, string>;

export enum FetchErrorType {
  /** 超时 */
  TIMEOUT = 'TIMEOUT',
  /** 执行报错 */
  EXECUTE = 'EXECUTE',
  /** 未知错误 */
  UNKNOW = 'UNKNOW',
}

type RespData<T = any> = {
  error?: FetchErrorType,
  result?: {
    headers: Record<string, any>,
    body: T,
  }
};

export const HOST: Record<ENV, string> = {
  [ENV.REAL]: 'https://novel.html5.qq.com',
  [ENV.GRAY]: 'https://novel.html5.qq.com',
  [ENV.DEV]: 'https://noveltest.html5.qq.com',
};

let currentEnv = ENV.REAL;

export const setEnv = (env: ENV): void => {
  currentEnv = env;
};

/** cookie对象转成document.cookie值的形式 */
export const convertCookieObjToStr = (
  cookieMap: Record<string, string>,
  logError?: (...args: unknown[]) => void,
): string => {
  try {
    const cookieMapStr = Object.keys(cookieMap).reduce((strCookies = '', key) => {
      strCookies += `${key}=${cookieMap[key]}; `; // eslint-disable-line no-param-reassign
      return strCookies;
    }, '');
    return cookieMapStr.substr(0, cookieMapStr.length - 2);
  } catch (err) {
    logError?.(err, 'functions', 'convertCookieObjToStr');
    return '';
  }
};

// 生产小说http接口所需cookie项
export const getHttpCookies = async (): Promise<CookieMap> => {
  try {
    const { guid = '' } = await getDeviceVisitor().isReady() || {};
    const {
      type, uin = '', token = '', skey = '', qbid = '', appid = '',
    } = await getUserVisitor().isUserReady() || {};

    const finalToken = type === HostUserType.QQ ? skey : token;

    const cookieMap = {
      'Q-H5-USERTYPE': `${type}`,
      'Q-H5-SKEY': skey,
      'Q-H5-LSKEY': '',
      'Q-H5-TOKEN': finalToken,
      'Q-H5-OPENID': '',
      'Q-H5-QBID': qbid,
      'Q-H5-GUID': guid,
      'Q-H5-ID': appid,
      'Q-H5-ACCOUNT': checkLogin() ? uin : '',
      qbid,
    };

    return cookieMap;
  } catch (error) {
    logError(error, `${TAG}.getHttpCookies`);
    return {} as any;
  }
};

export const doFetch = async <T = any >(
  url: string,
  params?: RequestInit,
): Promise<RespData<T>> => {
  try {
    const fetchUrl = /^https?:\/\//.test(url) ? url : `${HOST[currentEnv]}${url}`;
    const key = fetchUrl.replace(/https?:\/\/[^/]*\//g, '').replace(/\//g, '-');

    addKeylink(`${key}`, KeylinkCmd.AJAX_REQ_SUM);

    const cookieMap = await getHttpCookies();
    const cookie = convertCookieObjToStr(cookieMap);

    const { headers, ...restParams } = params || {};

    const options = {
      headers: {
        ...headers,
        cookie,
        'x-qbrn-cookie': cookie,
        from_browser_qbrn: '1',
        from_browser_hippy: '1',
      },
      ...restParams,
    };

    const doRequest = global.fetch(fetchUrl, options);

    const startTime = Date.now();

    const resp = await Promise.race<any>([
      doRequest,
      timeoutPromise(16000, { timeOut: true }),
    ]);

    addKeylink(`${key}=${Date.now() - startTime}`, KeylinkCmd.AJAX_COSTTIME_AVG);

    if (resp?.timeOut) {
      addKeylink(`${key}`, KeylinkCmd.AJAX_TIMEOUT_SUM);
      return { error: FetchErrorType.TIMEOUT };
    }
    if (!resp?.ok) {
      addKeylink(`${key}=${resp?.status}`, KeylinkCmd.AJAX_RETCODE_SUM);
      return { error: FetchErrorType.UNKNOW };
    }
    const data = resp?.body ? (await resp.json()) : null;
    return {
      result: {
        ...resp,
        body: data,
      },
    };
  } catch (err) {
    logError(err, 'fetch.doFetch');
    return { error: FetchErrorType.EXECUTE };
  }
};

