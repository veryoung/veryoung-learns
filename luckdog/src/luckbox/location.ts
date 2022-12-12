import { reportUDS, BusiKey } from '@/luckdog';

import { FeedsLocation, DEF_SEARCH_PARAMS } from '@tencent/luckbox-readdata-feedswup';
import { SHOULD_SHOW_BANNER_PARAMS } from '../framework/FeedsConst';

interface DefaultChangeListenerParams {
  collectBook: (resourceId: string) => void;
}

let location: FeedsLocation;

/**
 * 监听url上存在的参数
 * 1. 如果url上存在控制悬浮条展示的参数，进行上报
 * 2. 如果url上存在自动收藏的参数，触发自动收藏书籍
 */
export const addDefaultChangeListener = (params: DefaultChangeListenerParams) => {
  if (isTopTab()) return;
  const urlParams = getSearchParams();

  // 如果存在控制悬浮条参数，上报
  const key = Object.keys(urlParams).find(key => SHOULD_SHOW_BANNER_PARAMS.includes(key));
  if (key) {
    reportUDS(BusiKey.EXPOSE__BOTTOM_BANNER_SHOULD_SHOW, {}, {
      ext_data1: key, // url上携带的字段
    });
  }

  // 如果存在自动收藏参数，收藏书籍
  const autoCollectBookId = getSearchParams().auto_collect_book;
  if (autoCollectBookId) {
    params.collectBook(autoCollectBookId);
  }
};

/** 获取location对象 */
export const getLocation = (): FeedsLocation => {
  if (location) return location;
  location = new FeedsLocation({
    defaultSearchParams: DEF_SEARCH_PARAMS,
    showDebug: false,
  });
  return location;
};

/** 获取location的searchParams */
export const getSearchParams = () => getLocation().getSearchParams();

/** location是否准备好 */
export const isLocationReady = () => getLocation().isReady();

/** 获取qbUrl参数 */
export const getQbUrl = () => getLocation().getUrl();

/** 设置或者更新qbUrl */
export const setQbUrl = (url: string) => getLocation().setUrl(url);

/** 是否顶部tab */
export const isTopTab = () => getLocation().isTopTab();

/** 获取产品id */
export const getAppId = () => (isTopTab() ? 0 : 138);

/** 获取小说阵地标识tabfrom */
export const getTabfrom = () => (isTopTab() ? 'top' : 'bottom');
