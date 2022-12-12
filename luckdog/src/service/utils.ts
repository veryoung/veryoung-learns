
import { BaseCard, RequestType, UIType } from '../framework/protocol';
import { addKeylink, logError } from '@/luckdog';
import { TabId } from '../entity';
import { UpdatePageNumScene } from './types';
import { readSharedSettings, writeSharedSettings } from '../utils/shareSettings';

/**
 * 各个tab的当前刷数，key为`tabId`
 * @example { 191: 1, 181: 0 }
 */
const tabsPageNumMap: { [key: string]: number } = {};
/** tab的卡片pageNum本地缓存key名 */
const AllTabCardPageNumStoreKey = 'AllTabCardPageNumStoreKey';
/**
 * 各个tab的所有卡片当前刷数的map对象，key为`tabId`, value为卡片pageNum的map对象
 * @example { 191: { 'cardkey1': 1, 'cardkey2': 2 } }
 */
let tabsCardPageNumMap: { [key: string]: { [key: string]: number } } = {};
/** 需要刷新pageNum的卡片UIType */
const NeedUpdatePageNumUIType = [UIType.BOOK_LIST, UIType.AUTHOR_LIST];

/** 获取tab当前第几刷 */
export const getTabPageNum = (tabId: TabId, requestType: RequestType): number => {
  const tabPageNum = tabsPageNumMap[tabId] || 1;

  let targetTabPageNum = 1;
  switch (requestType) {
    case RequestType.REFRESH:
      // 刷新指定传1
      targetTabPageNum = 1;
      break;
    case RequestType.LOAD_MORE:
      // 下一刷，取后台返回pageNum
      targetTabPageNum = tabPageNum;
      break;
  }
  addKeylink(`获取tab第几刷pageNum, ${JSON.stringify({
    tabId,
    requestType,
    oriTabPageNum: tabPageNum,
    targetTabPageNum,
    tabsPageNumMap,
  })}`);
  return targetTabPageNum;
};

/**
 * 更新当前tab下一批刷数
 * 初次进入有本地缓存，需要更新pageNum为2
 */
export const updateTabPageNum = (tabId: TabId, pageNum: number, sceneFrom: UpdatePageNumScene): void => {
  tabsPageNumMap[tabId] = pageNum;
  addKeylink(`更新tab下一刷pageNum, ${JSON.stringify({
    tabId,
    pageNum,
    sceneFrom,
  })}`);
};

/** 获取tab的所有卡片刷数的map对象 */
export const getTabCardPageNumMap = async (tabId: TabId): Promise<{ [key: string]: number }> => {
  try {
    if (!Object.keys(tabsCardPageNumMap).length) {
      tabsCardPageNumMap = await readSharedSettings(AllTabCardPageNumStoreKey) || {};
    }
    const targetTabCardPageNumMap = tabsCardPageNumMap[tabId] || {};
    addKeylink(`获取tab卡片的刷数的map对象, ${JSON.stringify({
      tabId,
      targetTabCardPageNumMap,
    })}`);
    return targetTabCardPageNumMap;
  } catch (err) {
    logError(err, 'serviceUtils.getTabCardPageNumMap');
    return {};
  }
};

/** 更新tab的卡片数据，部分卡片的pageNum自增加1 */
export const increaseTabCardPageNum = async (
  tabId: TabId,
  cards: BaseCard[],
): Promise<void> => {
  try {
    const cardKey = cards.filter(item => NeedUpdatePageNumUIType.includes(item.uiType)).map(item => item.cardKey);
    if (!cardKey.length) return;

    const curTabCardPageNumMap = tabsCardPageNumMap[tabId] || {};
    const targetTabCardPageNumMap = { ...curTabCardPageNumMap };
    cardKey.forEach((item) => {
      targetTabCardPageNumMap[item] = targetTabCardPageNumMap[item] ? targetTabCardPageNumMap[item] + 1 : 1;
    });

    tabsCardPageNumMap = {
      ...tabsCardPageNumMap,
      [tabId]: targetTabCardPageNumMap,
    };
    await writeSharedSettings(AllTabCardPageNumStoreKey, tabsCardPageNumMap);
    addKeylink(`更新tab的卡片下一刷pageNum, ${JSON.stringify({
      tabId,
      cardKey,
      oriTabCardPageNumMap: curTabCardPageNumMap,
      targetTabCardPageNumMap,
      tabsCardPageNumMap,
    })}`);
  } catch (err) {
    logError(err, 'serviceUtils.increaseTabCardPageNum');
  }
};
