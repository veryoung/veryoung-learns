/**
 * @describe 对 AsyncStorage 简单封装，增加有效期设置
 * @author samczhang@tencent.com
 * @date 2017-08-10
 */

import { AsyncStorage } from '@tencent/hippy-react-qb';

import { logError } from '@/luckdog';

export default class StorageUtils {
  /**
   * @method 设置缓存，不设置 expire 将永久存储
   * @param {string} key 缓存 key 值
   * @param {any} value 缓存数据
   * @param {int} expire? 缓存有效期，单位秒(s)
   */
  public static async setItem(key, value, expire?: number) {
    if (!key) return;
    if (!value) return;

    const storageVal: any = {
      value,
    };

    if (expire) {
      storageVal.expire = +new Date() + (expire * 1000);
    }

    try {
      await AsyncStorage.setItem(key, JSON.stringify(storageVal));
    } catch (err) {
      logError(err, 'StorageUtils.setItem');
    }
  }

  /**
   * @method 根据 key 读取缓存
   * @param {string} key 缓存 key 值
   * @return {any} 返回缓存数据
   */
  public static async getItem(key) {
    let rst = null;
    if (!key) return rst;

    try {
      let data = await AsyncStorage.getItem(key);
      if (!data) return rst;

      data = JSON.parse(data);
      const now = +new Date();

      if (data.expire && now > data.expire) {
        try {
          await this.removeItem(key);
        } catch (error) {
          logError(error, 'StorageUtils.removeItem');
        }
      } else {
        rst = data.value;
      }
    } catch (error) {
      logError(error, 'StorageUtils.getItem');
    }

    return rst;
  }

  /**
   * @method 根据 key 移除缓存
   * @param {string} key 缓存 key 值
   */
  public static async removeItem(key) {
    if (!key) return;

    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logError(error, 'StorageUtils.removeItem');
    }
  }

  /**
   * @method 批量设置缓存
   * @param {array} keyValArr [['key', 'val', 3]] 数组
   *  - [0] key
   *  - [1] value
   *  - [2]? expire
   */
  public static async multiSet(keyValArr) {
    if (!keyValArr || !keyValArr.length) return;

    const multiKeyArr: any[] = [];
    keyValArr.forEach((item) => {
      if (item.length > 1) {
        const storageVal: any = {
          value: item[1],
        };
        if (item[2]) {
          const expireIndex = 2;
          storageVal.expire = item[expireIndex];
        }

        multiKeyArr.push([item[0], JSON.stringify(storageVal)]);
      }
    });
    try {
      await AsyncStorage.multiSet(multiKeyArr);
    } catch (error) {
      logError(error, 'StorageUtils.multiSet');
    }
  }

  /**
   * @method 根据 keyArr 批量获取缓存
   * @param {array} keyArr [key1, key2, ...] 数组
   * @return {object} {key1: val1, key2: val2}
   */
  public static async multiGet(keyArr) {
    const rst = {};
    if (!keyArr || !keyArr.length) return rst;

    try {
      const multiRemoveKeyArr: any[] = [];
      const data = await AsyncStorage.multiGet(keyArr);
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item[1]) {
            const itemData = JSON.parse(item[1]);
            const now = +new Date();
            if (itemData.expire && now > itemData.expire) {
              multiRemoveKeyArr.push(item[0]);
              rst[item[0]] = null;
            } else {
              rst[item[0]] = itemData.value;
            }
          } else {
            rst[item[0]] = null;
          }
        });
      }
      if (multiRemoveKeyArr.length) {
        await this.multiRemove(multiRemoveKeyArr);
      }
    } catch (error) {
      logError(error, 'StorageUtils.multiGet');
    }
    return rst;
  }

  public static async multiRemove(keyArr) {
    if (!keyArr || !keyArr.length) return;

    try {
      await AsyncStorage.multiRemove(keyArr);
    } catch (error) {
      logError(error, 'StorageUtils.multiRemove');
    }
  }

  public static async getAllKeys() {
    let rst = [];

    try {
      rst = await AsyncStorage.getAllKeys();
    } catch (error) {
      logError(error, 'StorageUtils.getAllKeys');
    }
    return rst;
  }

  public static async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logError(error, 'StorageUtils.clear');
    }
  }
}
