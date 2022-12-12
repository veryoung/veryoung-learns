import { getSearchParams, isTopTab, parseQs, timeoutPromise, DynamicTabType } from '@/luckbox';
import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { TabId, LocalDynamicTabs, DynamicTabItem } from '../entity';
import { readSharedSettings } from '../utils/shareSettings';
import { DYNAMIC_TABS } from '../constants';

const defaultConfig = {
  extinfo: {},
  feedsViewId: '1',
  hippyViewName: 'NULL',
  priority: 1,
  specialTitle: 'NULL',
  status: 1,
  tabIcons: [],
  tabType: DynamicTabType.feedsview,
  webViewUrl: 'https://novel.html5.qq.com',
};

export const TAB_SHELF: DynamicTabItem = {
  tabId: TabId.SHELF,
  tabTitle: '书架',
  ...defaultConfig,
};

export const TAB_RECOMM: DynamicTabItem = {
  tabId: TabId.BOTTOM_RECOMM1,
  tabTitle: '推荐',
  ...defaultConfig,
};

/** 所有的tab配置集合 */
let tabList: DynamicTabItem[] = [];
/** 常驻的tab配置集合 */
let residentTabList: DynamicTabItem[] = [];

interface InitTabListRet {
  tabList: DynamicTabItem[];
  activeTabId: TabId;
}

interface RaceDynamicTabs extends Partial<LocalDynamicTabs> {
  isTimeOut?: boolean;
}

/**
 * 初始化tabList
 */
export const initTabList = async (qbUrl: string): Promise<InitTabListRet> => {
  const tabIdParam = getCurrentIdFromUrl(qbUrl);
  try {
    let targetTabId;
    let dynamicTabs: DynamicTabItem[] = [];
    if (isTopTab()) {
      residentTabList = [TAB_RECOMM];
      targetTabId = TabId.BOTTOM_RECOMM1;
    } else {
      residentTabList = [TAB_SHELF, TAB_RECOMM];
      const {
        dynamicTabs: localDynamicTabs = [],
        activeTab,
        isTimeOut,
      } = await Promise.race<Promise<RaceDynamicTabs>>([
        readSharedSettings<LocalDynamicTabs>(DYNAMIC_TABS),
        timeoutPromise(200, { isTimeOut: true }),
      ]);
      isTimeOut && addKeylink('initTabList-readSharedSettings-timeout', KeylinkCmd.PR_INFO_SUM);
      targetTabId = tabIdParam || activeTab?.tabId || TabId.BOTTOM_RECOMM1;
      dynamicTabs = localDynamicTabs;
    }
    tabList = updateTabList(dynamicTabs);
    addKeylink(`[initTabList] tabList: ${tabList.map(tab => tab.tabId).join(',')}, targetTabId: ${targetTabId}`);
    return { tabList, activeTabId: targetTabId };
  } catch (error) {
    logError(error, 'TabsPresenter.initTabList');
    return { tabList, activeTabId: tabIdParam || TabId.BOTTOM_RECOMM1 };
  }
};

/**
 * 更新tabList
 * 更新的tabList只能跟在常驻的后面
 * 如果数据正常返回则跟新 非正常返回使用打底数据
 */
export const updateTabList = (dynamicTabs: DynamicTabItem[]): DynamicTabItem[] => {
  tabList = [...residentTabList, ...dynamicTabs];
  // 对重复的tab进行去重，优先保留前者
  const tabIdList = tabList.map(tabItem => tabItem.tabId);
  tabList = tabList.filter((tabItem, index) => tabIdList.indexOf(tabItem.tabId) === index);
  return tabList;
};

/**
 * 获取tabList
 */
export const getTabList = (): DynamicTabItem[] => tabList;

export const getTabIdParam = (): number | undefined => {
  const { currentId } = getSearchParams();
  return Number(currentId) || undefined;
};


/**
 * 返回终端bundle需要的tabId, 主要是把推荐(181)转成bundle理解的推荐(22)
 */
export const getBundleTabId = (tabId: number | string) => (Number(tabId) === TabId.BOTTOM_RECOMM1
  ? TabId.BOTTOM_RECOMM2 : Number(tabId));

/** 返回业务的tabId，主要把bundle理解的推荐(22)转成推荐(181) */
export const getFixedTabId = (tabId: string | number): number | undefined => {
  const id = Number(tabId);
  if (id) {
    return id === TabId.BOTTOM_RECOMM2 ? TabId.BOTTOM_RECOMM1 : id;
  }
  return;
};

/** 获取地址上的currentId */
export const getCurrentIdFromUrl = (qbUrl: string): number | undefined => {
  if (!qbUrl) return;
  const { currentId } = parseQs(qbUrl) || {};
  if (!currentId) return;
  return getFixedTabId(currentId);
};
