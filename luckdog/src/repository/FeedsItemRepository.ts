/**
 * Created by piovachen on 2017/5/9.
 */
import { AsyncStorage } from '@tencent/hippy-react-qb';
import FeedsSetting from './FeedsSetting';

import FeedsEventHub from '../framework/FeedsEventHub';
import { logError, addKeylink } from '@/luckdog';
import { TabId } from '../entity';

const TAG = 'ItemRepository';
const MAX_STORE_COUNT = 1000;
const MAX_NEWS_STORE_COUNT = 1000;
const MAX_LIFE_STORE_COUNT = 10;

export default class FeedsItemRepository {
  public appId: any;
  public mTabId: any;
  public storeCount: number;
  public CacheKey: string;
  public CacheImageKey: string;
  public SettingKey: string;
  public enableClearHistory: boolean;
  public MaxStoreSize: number;
  public constructor(appId, tabId, isNewPb) {
    this.appId = appId;
    this.mTabId = tabId;
    this.storeCount = 0;
    this.CacheKey = `${FeedsEventHub.event.moduleName}:cache:${appId}_tab_${tabId}${isNewPb ? '_isnewPb' : ''}`;
    this.CacheImageKey = `${FeedsEventHub.event.moduleName}:imagecache`;
    this.SettingKey = `${FeedsEventHub.event.moduleName}:setting:${appId}_tab_${tabId}`;
    this.enableClearHistory = true;
    switch (tabId) {
      case 1:
        this.MaxStoreSize = MAX_NEWS_STORE_COUNT;
        this.enableClearHistory = false;
        break;
      case 4:
        this.MaxStoreSize = MAX_LIFE_STORE_COUNT;
        break;
      default:
        this.MaxStoreSize = MAX_STORE_COUNT;
        break;
    }
  }

  public loadItemsAndSetting = async () => {
    const result = {
      items: [] as any[],
      setting: new FeedsSetting(),
    };
    try {
      addKeylink('loadItemsAndSetting() start', TAG);
      const storeSet = await AsyncStorage.multiGet([this.CacheKey, this.SettingKey]) || [];
      addKeylink(`loadItemsAndSetting() end, storeSet.length: ${storeSet?.length}`, TAG);
      if (storeSet && storeSet.length > 0) {
        if (storeSet[0]?.[1]) {
          result.items = JSON.parse(storeSet[0][1]);
          this.storeCount = result.items.length;
        }
        if (storeSet[1]?.[1]) {
          result.setting = JSON.parse(storeSet[1][1]);
        } else {
          result.setting = new FeedsSetting();
        }
      }
    } catch (err) {
      logError(err, 'FeedsItemRepository.loadItemsAndSetting');
    }
    return result;
  };

  public saveItemsAsync = (items, refresh, clearHistory = false) => {
    if (!items || items.length === 0) {
      return;
    }
    if (clearHistory || refresh) {
      // 清空数据索引表
      Promise.resolve()
        .then(() => {
          this.saveItems(items, refresh, clearHistory);
        })
        .catch((err) => {
          logError(err, 'FeedsItemRepository.saveItemsAsync');
        });
    }
  };

  /**
   * 缓存推荐数据时数据过多,因为首页已经有数据请求刷新逻辑，所以缓存数据一定会被替换，没有必要缓存所有内容
   */
  public filterRecommendData = (data) => {
    // 暂时只处理401, 399卡片
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item.ui_style === 401 || item.ui_style === 399) {
        const { parsedObject = {} } = item;
        const { vDetailData = {}, vRes = {} } = parsedObject;
        let value = [];
        let showNum = 0;
        if (item.ui_style === 401) {
          value = vDetailData.value;
          showNum = 3; // 只保存两页
        }
        if (item.ui_style === 399) {
          value = vRes.value;
          showNum = 8; // 只保存两页
        }
        if (value.length > 0) {
          value = value.slice(0, showNum);
          if (item.ui_style === 401) {
            item.parsedObject.vDetailData.value = value;
          }
          if (item.ui_style === 399) {
            item.parsedObject.vRes.value = value;
          }
        }
      }
      // 删掉无用属性 第一次缓存过来不会有影响
      // delete item.report_info;
      delete item.parsedHttpObject;
      delete item.freshInfo;
      delete item.grayInfo;
    }
    return data;
  };

  public saveItems(items, refresh, clearHistory = false) {
    if (!items || items.length === 0) {
      return;
    }
    try {
      if (clearHistory || refresh) {
        // 清空数据索引表
        let data = JSON.parse(JSON.stringify(items));
        if (this.mTabId === TabId.BOTTOM_RECOMM2) {
          // 推荐数据实在过多，对缓存进行删减一下,以提高获取速度
          data = this.filterRecommendData(data);
        }
        const storeSet = JSON.stringify(data);
        AsyncStorage.setItem(this.CacheKey, storeSet);
        this.storeCount = items.length;
      }
    } catch (err) {
      logError(err, 'FeedsItemRepository.saveItems');
    }
  }

  public saveCacheImage = async (items) => {
    if (!items || items.length === 0) {
      return;
    }
    const cacheImageArr: string[] = [];
    for (let i = 0, { length } = items; i < length; i++) {
      const item = items[i];
      if (i > 7) break;
      if (item?.parsedObject && item.ui_style) {
        const { parsedObject } = item;
        if (parsedObject?.sPicUrl) {
          cacheImageArr.push(parsedObject.sPicUrl);
        }
      }
    }
    if (cacheImageArr.length) {
      try {
        await AsyncStorage.setItem(this.CacheImageKey, JSON.stringify(cacheImageArr));
      } catch (err) {
        logError(err, 'FeedsItemRepository.saveCacheImage');
      }
    }
  };

  public loadCacheImage = () => {
    AsyncStorage.getItem(this.CacheImageKey);
  };

  public async loadSetting() {
    return new FeedsSetting();
  }

  public saveSettingAsync = (setting) => {
    this.saveSetting({
      ...setting,
      useHippyRpc: true,
    }).catch((err) => {
      logError(err, 'FeedsItemRepository.saveSettingAsync');
    });
  };

  public saveSetting = async (setting) => {
    try {
      const data = JSON.stringify(setting);
      await AsyncStorage.setItem(this.SettingKey, data);
    } catch (error) {
      logError(error, 'FeedsItemRepository.saveSetting');
    }
  };

  public clear = async () => {
    try {
      await AsyncStorage.multiRemove([this.CacheKey, this.SettingKey]);
    } catch (error) {
      logError(error, 'FeedsItemRepository.clear');
    }
  };
}
