import { Platform } from '@tencent/hippy-react-qb';
import FeedsEventEmitter from '../framework/FeedsEventEmitter'; // 参考 src/feeds-styles/tab-1/FeedsViewUIStyle1.js
import FeedsTraversal from './FeedsTraversal';
import { uniqueArray } from '../framework/Utils';
import { logError } from '@/luckdog';
import { isTopTab } from '@/luckbox';
import { isFSRendered } from '@/presenters';
import FeedsUtils from '../framework/FeedsUtils';
import { NOVEL_BUSINESS_ID } from '../framework/FeedsConst';
import { TabId } from '../entity';

const componentDict = {};
let bundleList: any[] = []; // 收集需要刷新的组件
// 局部刷新默认返回书籍数量
const DEFAULT_REFRESH_SIZE = 3;

const merge = (target, source) => {
  Object.keys(target).forEach((key) => {
    const value = target[key];
    if (value?.value && source[key] && !('value' in source[key])) {
      // eslint-disable-next-line no-param-reassign
      target[key].value = source[key];
    } else {
      // eslint-disable-next-line no-param-reassign
      target[key] = source[key];
    }
  });
  return target;
};

const getBundleLocalRefresh = (item) => {
  const localRefresh = Platform.OS === 'android'
    ? JSON.parse(item.options || '{}').localRefresh
    : (item.options || {}).localRefresh;
  return Number(localRefresh) === 0;
};

export const getKey = itemId => `${(itemId || '')
  .split('_')
  .slice(0, 2)
  .join('_')}_`;

/**
 * 对应jsApi的onTabRefresh
 * 局部刷新
 */
/**
 * @class ComponentRefresh
 */
class ComponentRefresh {
  public static on(itemId, fun) {
    const uiKey = getKey(itemId);
    componentDict[uiKey] = fun;
  }

  public static push(bundle) {
    if (bundle) {
      bundleList.push(bundle);
    }
  }

  /**
   * 触发局部刷新
   * @param {*} keyList 需要局部刷新的keys
   * @param {*} pageView 当前需要刷新的pageview实例
   * @param {*} hasRefresh 是否强制刷新
   * @param {*} isRefreshKey 是否是通过refreshkey刷新（书架依靠itemid刷新 其余卡片用refreshkey刷新）
   * TODO: 局部刷新存在书架和推荐卡片方式不统一问题 涉及到顶部 底部两个tab的切换 需要推动后台统一修改
   */
  public static emit(keyList, pageView, hasRefresh, isRefreshKey = false) {
    try {
      const { globalConf = {}, mTabBean = {}, mViewModel = {} } = pageView || {};
      // mTabBean.iFromType, business写死2，因为其他业务未实现
      this.refresh(keyList, mTabBean.tabId, NOVEL_BUSINESS_ID, globalConf).then((result) => {
        if (result.success) {
          const mDataHolders = mViewModel.mDataHolders || [];
          const vItemListData = result.content?.vItemListData;
          const map = {};
          (vItemListData || []).forEach((item) => {
            // eslint-disable-next-line no-param-reassign
            item.parsedObject = JSON.parse(item.sStyleJson);
            if (isRefreshKey) {
              map[keyList] = item;
            } else {
              map[getKey(item.sItemId)] = item;
            }
          });
          keyList.forEach((key) => {
            const newKey = isRefreshKey ? key : getKey(key);
            const data = map[newKey];
            const component = componentDict[newKey];
            if (component && data) {
              component(data, hasRefresh);
            } else if (data) {
              mDataHolders.some((item) => {
                const { mData = {} } = item;
                const { refreshKey = '' } = FeedsUtils.getSafeProps(item, 'mData.parsedObject', {});
                const isCurrentNode = isRefreshKey ? refreshKey === key : getKey(mData.item_id) === newKey;
                if (isCurrentNode) {
                  // eslint-disable-next-line no-param-reassign
                  item.isExposured = false;
                  mData.report_info = Object.entries(data.mpReportInfo);
                  mData.parsedObject = isRefreshKey ? data.parsedObject : merge(mData.parsedObject, data.parsedObject);
                  return true;
                }
                return false;
              });
            }
          });
          // eslint-disable-next-line no-param-reassign
          pageView.feedsListPageViewRefs = []; // 需要重置一下渲染
          pageView.setState({
            dataSource: mDataHolders,
          });
        }
      });
    } catch (e) {
      logError(e, 'ComponentRefresh.emit');
    }
  }

  /**
   * 局部刷新函数
   * @param {String[]} ids refreshKey的数组
   * @param {Number} tabId 当前tab的tabId
   * @param {Number} business 当前business
   * @param {*} globalConf 当前globalConf
   * @param {Number} itemSize 如果是每日推荐卡片的局部刷新，需要传入卡片中一屏展示的书籍数量，已区分不同的每日推荐卡片
   */
  public static refresh(ids, tabId, business, globalConf, itemSize = DEFAULT_REFRESH_SIZE) {
    /**
     * 背景：由于3种每日推荐卡片的refreshKey相同，需要添加数量参数（399 -> 8； 401 -> 3； 429 -> 5），区别不同的每日推荐卡片
     *      因为之前只有401卡片（3本的每日推荐）有换一换的功能，当时的参数为needCard，为兼容旧版本，保持3本时使用此参数，其他数量时，使用新的指定数量的参数
     */
    const needCardParam = itemSize === DEFAULT_REFRESH_SIZE ? {
      needCard: ids,
    } : {
      needCardWithSize: [{
        cardName: ids[0],
        itemSize,
      }],
    };
    const rpcRequest = {
      func: 'LocalRefresh',
      ...needCardParam,
      ...(isTopTab() ? {
        func: 'refresh',
        param: {
          ids,
        },
      } : {}),
    };
    return FeedsTraversal.traversal(tabId, business, rpcRequest, globalConf, {});
  }
}

/*
一、全局刷新（option.localRefresh=0, toTop=1）
1，主动下拉免费小说tab
2，点击免费小说tab
3，阅读喜好页面，点击选好了刷新小说频道

二、局部【我的收藏】刷新且回到顶部：（toTop=1）
1，简介页（QB9.6版本及以上）右上角频道入口
2，阅读器底bar频道入口

三、局部【我的收藏】刷新且定位锚点，前端灵活可控。（默认不传任何参数就是锚点返回，局部刷新收藏）

需要局部刷新必须从H5或hippy发消息
*/

// eslint-disable-next-line @typescript-eslint/naming-convention
FeedsEventEmitter.emit((_symbolKey, event, data) => {
  // 首屏渲染完再来触发刷新
  if (!isFSRendered()) return;
  const { lifecycleType, pageView } = data || {};
  const mTabId = Number(pageView?.mTabId);
  if (!(event === FeedsEventEmitter.event.lifecycle
    && lifecycleType === 'active'
    && [TabId.BOTTOM_RECOMM2, TabId.BOTTOM_RECOMM1].includes(mTabId))) return;

  // 当前卡片被激活, 这里只放开22，避免影响其他tab，由于金币、收藏等实时性要求比较高，所以bundleList为空也需要局部刷新
  let localRefresh = mTabId === TabId.BOTTOM_RECOMM2 || mTabId === TabId.BOTTOM_RECOMM1; // 小说tab 返回默认局部刷新
  let needScrollTop = false;
  let totalRefresh = false;
  let keyList: any[] = [];
  bundleList = bundleList.filter((item) => {
    // 整个列表局部刷新的情况
    needScrollTop = needScrollTop || `${item.toTop}` === '1' || item.type === 'onLoadUrl';
    try {
      totalRefresh = totalRefresh || getBundleLocalRefresh(item);
      // 通过localRefresh字段来控制是否全局刷新 0是局部刷新  1是全局刷新
    } catch (error) {
      logError(error, 'ComponentRefresh.triggleEmit');
    }
    if (!item.ui && mTabId === Number(item.tab_id || item.tabId)) {
      // 安卓 tab_id和tabId含义不一样
      localRefresh = true;
      return false; // 需要局部刷新的情况
    }
    return true;
  });

  let needRefresh = localRefresh || totalRefresh;
  if (needRefresh && pageView.refresh && pageView.doStartRefresh) {
    if (totalRefresh) {
      // 全局刷新，有loading，回到顶部
      pageView.refs.feedsList.startRefresh(pageView.globalConf?.isKingCardUser ? 3 : 1);
    } else {
      keyList = ['2_11_'];
    }
  } else {
    needRefresh = false;
  }

  bundleList = bundleList.filter((item) => {
    // 针对卡片局部刷新的情况
    if (mTabId === Number(item.tabId || item.tab_id)) {
      keyList.push(item.ui); // ui是item_id或者item_id前2位
      return false;
    }
    return true;
  });

  if (keyList.length) {
    ComponentRefresh.emit(uniqueArray(keyList), pageView, needRefresh);
  }

  bundleList = [];
  if (needScrollTop) {
    pageView.refs.feedsList.scrollToContentOffset(0, 0, false); // 局部刷新且回到顶部
  }
});

export default ComponentRefresh;
