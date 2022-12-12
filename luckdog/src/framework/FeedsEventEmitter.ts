/**
 * 全局事件
 * Created by piovachen on 2017/5/18.
 */

import { logError } from '@/luckdog';

const sListListeners = new Map();
const sItemListeners = new Set<any>();

class FeedsEventSubscription {
  public mListener: any;

  public constructor(listener) {
    this.mListener = listener;
  }

  public remove() {
    sItemListeners.delete(this);
  }
}

export default class FeedsEventEmitter {
  public static lifecycle = {
    active: 'active',
    deactive: 'deactive',
    toPage: 'toPage',
    insertAfter: 'insertAfter',
  };
  public static event = {
    refresh: 1, // 刷新
    feedback: 2, // 负反馈
    lifecycle: 3, // 列表状态通知
    spreadmore: 4, // 展开更多信息
    switchtabs: 5, // 切换tab
    hideLoginGuide: 6, // 隐藏登陆引导
    tabProps: 9, // 设置list对应tab属性,目前支持标题，示例{sName:xxx,tabId:xxx}
    clearCache: 10, // 清空缓存
    actionModal: 11, // 响应一个modal
    preloadUrl: 14, // 通知终端预加载url
    toPage: 15, // 下一跳去向
    insertAfter: 16, // 在当前资讯后面插入一条资讯
    showFeedBack: 17, // 负反馈
    itemRemove: 18, // 根据itemId去除item
    itemExposed: 22, // item是否已经曝光
    ugDiversionItemFreshLimit: 23, // ug导流同一刷退避
    refreshAnimationEnded: 24, // 刷新动画结束
    callOnScrollOnce: 25, // 调用一次滚动事件
    itemArrRemove: 26, // 根据itemId批量去除item
    searchWordCtnOnFresh: 27, // 每刷次数累加
    searchWordRemove: 28, // 搜索词退避
    searchWordFreqLimit: 29, // 搜索词达到频控上限
    gotToFloat: 30, // 由视频浮层跳转进来的
    itemClick: 31, // UI点击
    itemExposed50Percent: 32, // item是否已经50%曝光
    startRefresh: 34, // 开始刷新
    onLoadUrl: 35, // 从url进入
  };

  /**
   * 监听全局Feeds事件
   * @param listener
   * @returns {FeedsEventSubscription}
   */
  public static emit(listener) {
    const sub = new FeedsEventSubscription(listener);
    sItemListeners.add(sub);
    return sub;
  }

  /**
   * 发送事件给items
   * @param event FeedsEventEmitter.event
   * @param obj
   * @param symbolKey
   */
  public static sendEventToItem(symbolKey, event, obj) {
    sItemListeners.forEach((listener) => {
      try {
        listener.mListener(symbolKey, event, obj);
      } catch (e) {
        logError(e, 'FeedsEventEmitter.sendEventToItem');
      }
    });
  }

  /**
   * 发送事件给list
   * @param event FeedsEventEmitter.event
   * @param obj
   * @param symbolKey ID
   */
  public static sendEventToList(symbolKey, event, obj) {
    if (symbolKey) {
      const listener = sListListeners.get(symbolKey);
      if (symbolKey === 'followCircleSyncKey' && sListListeners.size > 0) {
        // 将所有列表的表都去取一遍，做关注同步
        sListListeners.forEach((listListener) => {
          if (listListener) {
            listListener(event, obj);
          }
        });
      }
      if (listener) {
        listener(event, obj);
      }
    }
  }

  public static addListDelegate(symbolKey, delegate) {
    sListListeners.set(symbolKey, delegate);
  }

  public static removeListDelegate(symbolKey) {
    sListListeners.delete(symbolKey);
  }
}
