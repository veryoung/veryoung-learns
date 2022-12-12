/**
 * Created by shermanchen on 2020/3/28.
 */

let timeCalcInfo = {};

export default class FeedsTimeCalc {
  /**
   * 打点耗时开始
   * @param key 打点key值
   */
  public static time(key) {
    if (typeof key !== 'string') {
      return;
    }
    if (!timeCalcInfo[key]) {
      timeCalcInfo[key] = Date.now();
    }
  }

  /**
   * 打点耗时结束
   * @param key 打点key值
   * @param timeoutList timeout数组(从大到小排列)
   * @param costCallback 回调函数
   */
  public static timeEnd(key, timeoutList, costCallback?: any) {
    if (typeof key !== 'string') {
      return;
    }
    if (timeCalcInfo[key]) {
      const timeCost = Date.now() - timeCalcInfo[key];
      delete timeCalcInfo[key];
      if (Array.isArray(timeoutList) && timeoutList.length) {
        timeoutList.sort((a, b) => b - a);
        // eslint-disable-next-line no-restricted-syntax
        for (const timeout of timeoutList) {
          if (timeCost >= timeout) {
            break;
          }
        }
      }
      if (typeof costCallback === 'function') costCallback(timeCost);
    }
  }

  /**
   * 重置计时打点key值
   * @param key
   */
  public static resetTime(key) {
    if (typeof key !== 'string') {
      return;
    }
    delete timeCalcInfo[key];
  }

  /**
   * 初始化重置所有计时key
   */
  public static initAllTime() {
    timeCalcInfo = {};
  }
}

export const TimeKey = {
  START_TO_REQUEST_LIST_ITEM: '${tabId}_Refresh_start_to_requestItemList',
  REQUEST_ITEM_LIST: '${tabId}_Refresh_requestItemList',
  INNER_REQUEST_ITEM_LIST_1: '${tabId}_Refresh_inner_requestItemList1',
  INNER_REQUEST_ITEM_LIST_1_1: '${tabId}_Refresh_inner_requestItemList1_1',
  GET_FEEDS_TAB_LISTS: '${tabId}_Refresh_getFeedsTabLists',
  REQUEST_ITEM_LIST_TO_RENDER: '${tabId}_Refresh_requestItemList_to_render',
  RENDER_TO_ANIM: '${tabId}_Refresh_render_to_anim',
};
