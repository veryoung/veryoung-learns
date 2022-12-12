import { ExpoItemParams, HippyExposeReporter, LayoutRect, ExpoRect, ExpoWaitItem } from '@tencent/luckdog-expo-hippysdk';
import { UDSEvent } from '@tencent/luckdog-uds-hippysdk';
import { isTopTab } from '@/luckbox';
import { logError } from './logger';
import FeedsConst from '../framework/FeedsConst';
import { reportFirstActiveInteraction, reportUDSExpose } from './beacon';
import { BusiKey } from '.';

/** 用于存放所有 tab 对应的 HippyExposeReporter */
interface ReporterMap {
  [tabId: string]: HippyExposeReporter;
}

/** 卡片曝光上报数据 */
interface CardExposeReportData extends UDSEvent {
  /** 取 cardIndex 的值 */
  ext_data1: string;
  /** 曝光的 bookIndex 的集合 */
  ext_data2: string;
}

/** 精准曝光组件提取到的曝光数据 */
interface CardExposeData {
  /** 卡片index */
  ext_data1: string;
  /** 书籍index */
  ext_data2?: string;
  /** 上报contentid */
  bigdata_contentid?: string;
}

/** 页面数据 */
type DataSource = Record<string, any>;

/** 上报前数据处理 */
type ReportDataHandler = (data: Partial<CardExposeReportData>) => Partial<CardExposeReportData>;

/** 存放 */
interface HandlerFuncMap {
  [tabId: string]: {
    [cardIndex: string]: ReportDataHandler;
  };
}

/** 页面数据 */
let dataSource: DataSource = {};
/** 存放上报数据处理函数 */
const handleFuncMap: HandlerFuncMap = {};
/** 存放 tabId 对应的 reporter */
const reporterMap: ReporterMap = {};
/** 保存当前的 tabId */
let currentTabId: number;
/** 保存当前正在使用的 reporter */
let currentReporter: HippyExposeReporter | undefined;

/** 频道是否处于活跃状态 */
const isActive = (): boolean => FeedsConst.getGlobalConfKV('initActive');

/**
 * 曝光检查前置条件判断
 * @param tabId tab id
 */
const shouldCheckExpo = () => {
  // 非活跃状态下不做曝光检查
  if (!isActive()) return false;
  return true;
};

/** 卡片维度上报书籍信息map */
interface CardBooksMap {
  [cardIndex: string]: {
    /** bookId用逗号连接 */
    bookIds: string;
    /** bookIndex用逗号连接 */
    bookIndexes: string;
  }
}

/** 把上报数据以卡片维度聚合起来 */
const getCardBooksMap = (items: ExpoWaitItem[]): CardBooksMap => items.reduce((acc, item) => {
  const { bookId, bookIndex, cardIndex, afterExpose } = item.extInfo;
  afterExpose?.();

  // 非书籍卡片
  if (!bookId || bookId === '0') {
    acc[cardIndex] = null;
    return acc;
  }

  // 书籍
  if (!acc[cardIndex]) {
    return {
      ...acc,
      [cardIndex]: {
        bookIds: `${bookId}`,
        bookIndexes: `${bookIndex}`,
      },
    };
  }

  const { bookIds, bookIndexes } = acc[cardIndex];
  return {
    ...acc,
    [cardIndex]: {
      bookIds: `${bookIds},${bookId}`,
      bookIndexes: `${bookIndexes},${bookIndex}`,
    },
  };
}, {});

/** 以卡片维度上报书籍曝光 */
const reportExposureOfNormalCard = (items: ExpoWaitItem[]): void => {
  if (!items.length) return;

  const cardBookIdsMap: CardBooksMap = getCardBooksMap(items);
  Object.entries(cardBookIdsMap).forEach(([cardIndex, bookInfo]) => {
    const itemBean = dataSource?.[cardIndex]?.mData;
    const { reportInfo, uiType } = dataSource?.[cardIndex] || {};
    if (!itemBean && !reportInfo) return;

    const moreData: CardExposeData = {
      ext_data1: cardIndex,
    };

    if (bookInfo?.bookIds.length > 0) {
      moreData.bigdata_contentid = bookInfo.bookIds;
      moreData.ext_data2 = bookInfo.bookIndexes;
    }

    const reportData = handleFuncMap[currentTabId]?.[cardIndex]?.(moreData) || moreData;

    // 新卡片直接上报 reportInfo
    if (reportInfo) {
      return reportUDSExpose(BusiKey.EXPOSE__CARD, {}, { ...reportInfo, ...reportData, ui_type: uiType });
    }

    reportUDSExpose(BusiKey.EXPOSE__CARD, itemBean, reportData);
  });
};

/** 上报内插卡片内的书籍曝光 */
const reportExposureOfInsertCard = (items: ExpoWaitItem[]): void => {
  if (!items.length) return;

  const bookIds = items.map(({ extInfo: { bookId } }) => bookId).join(',');
  const bookIndexes = items.map(({ extInfo: { bookIndex } }) => bookIndex).join(',');
  const reportData = {
    // 每个对象都携带了相同的 reportInfo，取其中一个即可
    ...items[0].extInfo?.reportInfo,
    bigdata_contentid: bookIds,
    ext_data2: bookIndexes,
  };

  reportUDSExpose(BusiKey.EXPOSE__CARD, {}, reportData);
};

/**
 * 曝光上报
 * 1. 多本书在同一个卡片内，则以卡片维度合并一次上报
 * @param items 符合曝光上报条件的对象
 */
const doExposure = async (items: ExpoWaitItem[]): Promise<boolean[]> => {
  // 上报内插卡片内的书籍曝光
  reportExposureOfInsertCard(items.filter(({ extInfo }) => extInfo?.fromInsertCard));

  // 上报普通卡片内的书籍曝光
  reportExposureOfNormalCard(items.filter(({ extInfo }) => !extInfo?.fromInsertCard));

  return items.map(() => true);
};

/**
 * 添加上报前数据处理函数
 * @param tabId tab id
 * @param cardIndex 卡片索引
 * @param func 数据处理函数
 */
const addReportDataHandler = (tabId: number, cardIndex: number, func: ReportDataHandler): void => {
  if (!handleFuncMap[tabId]) {
    handleFuncMap[tabId] = {};
  }
  handleFuncMap[tabId][cardIndex] = func;
};

/**
 * 更新页面数据
 * @param data 页面数据
 */
const updateDataSource = (data: DataSource): void => {
  dataSource = data;
};

/**
 * 设置当前 tabId 对应的 reporter
 * @param tabId tab id
 */
const setCurrentReporter = (tabId: number): void => {
  if (!reporterMap[tabId]) {
    reporterMap[tabId] = new HippyExposeReporter({
      paddingTop: isTopTab() ? 0 : 16,
      logError,
      showDebug: false,
      expoRule: {
        verticalExpoRatio: 0.5,
        horizontalExpoRatio: 0.5,
        stayAwait: 1000,
      },
      shouldCheckExpo,
      doExposure,
      shouldReport: isActive,
    });
  }

  currentReporter = reporterMap[tabId];
  currentTabId = tabId;
};

/**
 * 点击 item 的时候触发立即检查
 * @param onClick 点击事件处理函数
 */
const triggerExpoCheck = (onClick: () => void): (() => void) | undefined => {
  if (!currentReporter) {
    logError('currentReporter is not exist!', 'expose_reporter.triggerExpoCheck');
    return onClick;
  }
  return () => {
    reportFirstActiveInteraction();
    const clickHandler = currentReporter?.triggerExpoCheck(onClick);
    clickHandler?.();
  };
};

/**
 * 刷新整个 tab 的时候重置所有 item 的曝光状态
 * 注意：此处不能简单地直接清空 item，因为刷新并不会使所有元素重新 layout
 */
const resetExposeStatus = (): void => {
  currentReporter?.resetExposeStatus();
};

/**
 * 更新卡片内的元素的 bookId
 * @param cardIndex 卡片的 index
 * @param tabIndex 卡片内的 tab index
 * @param bookIds 卡片内的书籍 id 数组
 */
const updateBookIds = (cardIndex: number, tabIndex: number, bookIds: string[]): void => {
  currentReporter?.updateBookIds(cardIndex, tabIndex, bookIds);
};

/**
 * 添加 item 到曝光等待 map
 * @param expoItemParams item 参数
 * @prop expoItemParams.cardIndex 卡片 index
 * @prop expoItemParams.tabIndex tab 的 index
 * @prop expoItemParams.bookIndex 书籍 的 index
 * @prop expoItemParams.bookId 书籍 id
 * @prop expoItemParams.rect item 的尺寸位置信息
 * @prop expoItemParams.supportHorizontalScroll 是否支持横滑
 */
const addExpoItem = (expoItemParams: ExpoItemParams): void => {
  currentReporter?.addExpoItem(expoItemParams);
};

/**
 * 收集每张卡片的 rect
 * @param cardIndex 卡片的 index
 * @param rect 卡片的尺寸位置信息
 */
const updateCardRect = (cardIndex: number, rect: LayoutRect): void => {
  currentReporter?.updateCardRect(cardIndex, rect);
};

/**
 * 收集每张卡片标题的高度
 * @param cardIndex 卡片的 index
 * @param height 卡片标题的高度
 */
const updateTitleHeight = (cardIndex: number, height: number): void => {
  currentReporter?.updateTitleHeight(cardIndex, height);
};

/**
 * 更新可视视口的 rect
 * @param rect 尺寸位置信息
 */
const updateViewportRect = (rect: ExpoRect): void => {
  if (rect.top > 0) {
    reportFirstActiveInteraction();
  }
  currentReporter?.updateViewportRect(rect);
};

/** 根据key获取item的rect对象 */
const getExpoItemRect: HippyExposeReporter['getExpoItemRect'] = (...args) => currentReporter?.getExpoItemRect(...args) || null;

/**
 * 更新可视视口中支持横滑区域的 left 边界
 * @param cardIndex 卡片索引
 * @param left 卡片的 left 值
 */
const updateViewportLeft = (cardIndex: number, left: number): void => {
  currentReporter?.updateViewportLeft(cardIndex, left);
};

export const strictExposeReporter = {
  addReportDataHandler,
  updateDataSource,
  setCurrentReporter,
  triggerExpoCheck,
  resetExposeStatus,
  addExpoItem,
  updateBookIds,
  updateCardRect,
  updateTitleHeight,
  updateViewportRect,
  updateViewportLeft,
  getExpoItemRect,
};
