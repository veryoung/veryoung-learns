/* eslint-disable guard-for-in */
import { AsyncStorage } from '@tencent/hippy-react-qb';
import Taf from '@tencent/hippy-stream';
import base64 from 'base64-js';

import { MTT } from '@tencent/luckbox-hippyjce-homepage';
import FeedsEventHub from '../framework/FeedsEventHub';
import { logError } from '@/luckdog';

const tafMapToBase64 = function tafMapToBase64(value) {
  try {
    const os = new Taf.JceOutputStream();
    os.writeMap(0, value);
    // eslint-disable-next-line no-underscore-dangle
    const view = new Uint8Array(os._binBuffer._buffer);
    const data = view && base64.fromByteArray(view);
    return data;
  } catch (e) {
    logError(e, 'FeedsSetting.tafMapToBase64');

    return null;
  }
};

const base64ToTafMap = function base64ToTafMap(body) {
  if (body && typeof body !== 'string') {
    MTT.HomepageFeedsWatchedInfo.prototype.toObject = function () {
      return {
        lIndex: this.lIndex,
        sVersion: this.sVersion,
        mpExtInfo: this.mpExtInfo.toObject(),
      };
    };
    // @ts-expect-error readFromObject
    MTT.HomepageFeedsWatchedInfo.prototype.readFromObject = function (json) {
      if ({}.hasOwnProperty.call(json, 'lIndex')) {
        this.lIndex = json.lIndex as number;
      }
      if ({}.hasOwnProperty.call(json, 'sVersion')) {
        this.sVersion = json.sVersion as string;
      }
      if ({}.hasOwnProperty.call(json, 'mpExtInfo')) {
        this.mpExtInfo.readFromObject(json.mpExtInfo?.value);
      }
    };
    const watchInfoMap = new Taf.Map(Taf.Int32, MTT.HomepageFeedsWatchedInfo);
    if (body.value) {
      // eslint-disable-next-line no-restricted-syntax
      for (const k in body.value) {
        const v = body.value[k];
        if (v) {
          const item = new MTT.HomepageFeedsWatchedInfo();
          item.readFromObject(v);
          watchInfoMap.put(k, item);
        }
      }
    }
    return watchInfoMap;
  }
  return null;
};
export default class FeedsSetting {
  public static setWatchInfo(mpWatchInfo) {
    return tafMapToBase64(mpWatchInfo);
  }

  public static getWatchInfo(mWatchInfo) {
    return base64ToTafMap(mWatchInfo);
  }

  public static async setNovelPopupFlag() {
    try {
      AsyncStorage.setItem(`${FeedsEventHub.event.moduleName}:feeds_novel_popup`, 'true');
    } catch (e) {
      logError(e, 'FeedsSetting.setNovelPopupFlag');
    }
  }

  public static async getNovelPopupFlag() {
    try {
      return await AsyncStorage.getItem(`${FeedsEventHub.event.moduleName}:feeds_novel_popup`);
    } catch (e) {
      logError(e, 'FeedsSetting.getNovelPopupFlag');
      return null;
    }
  }

  public static setDebugInfoStatus(status) {
    return AsyncStorage.setItem(
      `${FeedsEventHub.event.moduleName}:FEEDS_DEBUG_INFO`,
      status ? '1' : '0',
    );
  }

  public static getDebugInfoStatus() {
    return AsyncStorage.getItem(`${FeedsEventHub.event.moduleName}:FEEDS_DEBUG_INFO`);
  }


  public static async setMultiCacheAndTopValue(value) {
    try {
      await AsyncStorage.setItem(
        `${FeedsEventHub.event.moduleName}:feeds_multiCacheAndTopValue`,
        JSON.stringify(value),
      );
    } catch (e) {
      logError(e, 'FeedsSetting.setMultiCacheAndTopValue');
    }
  }

  public static async getMultiCacheAndTopValue() {
    try {
      const multiCacheAndTopValue = await AsyncStorage.getItem(`${FeedsEventHub.event.moduleName}:feeds_multiCacheAndTopValue`);
      if (multiCacheAndTopValue) {
        return JSON.parse(multiCacheAndTopValue);
      }
      return null;
    } catch (err) {
      logError(err, 'FeedsSetting.getMultiCacheAndTopValue');
      return null;
    }
  }

  public updatedTime = 0;
  public mWatchInfo = null; // new Taf.Map(new Taf.INT32(), new MTT.HomepageFeedsWatchedInfo());
  public  mExtInfo = null; // Taf.Map(new Taf.STRING(), new Taf.STRING());
  public useHippyRpc = true;
  public clearCache = false;
  public redHotClickFlag = false;
}
