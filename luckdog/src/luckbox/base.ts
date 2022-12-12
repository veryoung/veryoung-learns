/**
 * luckbox的base基础文件
 * 该文件不能依赖于luckdog logger, 这里的异常先忽略
 */

export { parseQs, joinParams } from '@tencent/luckbox-base-url';
export * from '@tencent/luckbox-base-utils';
export { EventHub } from '@tencent/luckbox-base-event';

/**
 * 解析类似web里cookie形式的`k1=v1;k2=v2`字符串为对象
 */
export const parseCookieLikeKV = (str: string): Record<string, string> => {
  try {
    if (!str) return {};
    return str.split(';').reduce((acc: Record<string, string>, item) => {
      const [k = '', v = ''] = item.split('=');
      if (k) acc[k.slice()] = v.slice();
      return acc;
    }, {});
  } catch (err) {
    return {};
  }
};

/**
 * 格式化对象为类似web里cookie形式的`k1=v1;k2=v2`
 */
export const formatCookieLikeKV = (obj: Record<string, any>): string => {
  try {
    if (!obj) return '';
    return Object.keys(obj).reduce((acc: string[], key) => {
      acc.push(`${key}=${obj[key] || ''}`);
      return acc;
    }, [])
      .join(';');
  } catch (err) {
    return '';
  }
};
