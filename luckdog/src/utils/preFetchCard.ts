/**
 * @Author: veryoungwan
 * @Date:  2021-03-04
 * 预加载卡片内容组件
 */
import ComponentRefresh from '../communication/ComponentRefresh';
import FeedsUtils from '../framework/FeedsUtils';
import { NOVEL_BUSINESS_ID } from '../framework/FeedsConst';
import { logError } from '@/luckdog';
import { CardLinkType, CardReportInfo, CardReportReq } from '../entity/card';

/** 点击换一换 props 的类型 */
interface SwitchProps {
  parent?: Record<string, any>;
  selectTabID?: number;
  index: number;
}

const reportInfoMap: { [extra: string]: { [extra: string]: CardReportInfo } } = {};

/**
 * 将上报的二维数组转化成对象
 * @param reportInfo 卡片的report_info
 */
const convertArray2ReportInfo = (reportInfo: string[][]) => {
  const res: CardReportInfo = {};

  reportInfo?.forEach(([key, value]) => {
    value && (res[key] = value);
  });

  return res;
};

/**
 * 判断是否可以换一换
 * @param props 卡片的props;
 * @param position 卡片换一换后一屏的下标
 * @param lastIndex 卡片最后一屏的下标
 */
const canSwitch = (props: SwitchProps, position: number, lastIndex: number): boolean => {
  const { linkType: refreshType, refreshKey = '' } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
  // 如果命中预加载换一换并且是倒数第二屏，进行局部刷新换一换
  return refreshType === CardLinkType.CHANGE && refreshKey !== '' && position === lastIndex;
};

/**
 * 预加载新数据
 * @param keyList 需要局部刷新的keys
 */
export const preFetch = async (keyList: string[], pageView: any, size: number, params: CardReportReq) => {
  const { globalConf = {}, mTabBean = {} } = pageView || {};
  const { refreshKey = '' } = params;

  const map = {};
  try {
    const result = await ComponentRefresh.refresh(keyList, mTabBean.tabId, NOVEL_BUSINESS_ID, globalConf, size);
    if (result.success) {
      const vItemListData = result?.content?.vItemListData;
      (vItemListData || []).forEach((item) => {
        const newItem = item;
        newItem.parsedObject = JSON.parse(item.sStyleJson);
        map[refreshKey] = newItem;
      });
    }
    // 更新上报信息
    if (refreshKey) {
      const info = map[refreshKey]?.mpReportInfo;
      updateReportInfo(params, info);
    }
    return map;
  } catch (e) {
    logError(e, 'preFetchCard.preFetch');
    return map;
  }
};

/**
 * 更新reportInfo
 * @param params 需要的参数
 * @param info 存入的上报内容
 */
export const updateReportInfo = (params: CardReportReq, info: CardReportInfo | string[][]) => {
  const { tabId, tabIdx, pageNum } = params;
  // 将props中的二维数组转化成对象
  const reportInfo = Array.isArray(info) ? convertArray2ReportInfo(info) : info;
  reportInfoMap[tabId] = {
    ...reportInfoMap[tabId],
    ... {
      [`${tabIdx}_${pageNum}`]: reportInfo,
    },
  };
};


/**
 * 根据当前页码通过步长更新reportInfo
 * @param params 需要的参数
 * @param info 存入的上报内容
 * @param step 长度
 */
export const updateReportInfoByStep = (params: CardReportReq, info: CardReportInfo | string[][], step: number) => {
  const { pageNum } = params;
  const reportInfo = Array.isArray(info) ? convertArray2ReportInfo(info) : info;

  for (let i = 0; i < step; i++) {
    updateReportInfo({ ...params, pageNum: pageNum + i }, reportInfo);
  }
};

/**
 * 获取reportInfo
 * @param tabId 需要获取的tab
 * @param tabIdx 需要获取的卡片序号
 * @param pageNum 需要获取的卡片页码
 */
export const getReportInfo = (params: CardReportReq): CardReportInfo => {
  const { tabId, tabIdx, pageNum } = params;
  const key = `${tabIdx}_${pageNum}`;
  const tabInfo = reportInfoMap[tabId];

  if (tabInfo) {
    return tabInfo[key];
  }
  return {};
};

/**
 * 清空tab下暂存的上报信息
 * @param tabId
 */
export const resetReportInfoByTabID = (tabId: string): void => {
  reportInfoMap[tabId] = {};
};

/**
 * 根据卡片设置初始reportInfo
 * @param props 卡片的props
 * @param step 初始本地屏数
 */
export const initReportInfo = (props: SwitchProps, step: number) => {
  const { refreshKey = '' } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
  const { report_info: reportInfo = [] } = FeedsUtils.getSafeProps(props, 'itemBean', {});
  const { selectTabID, index } = props || {};

  updateReportInfoByStep({
    tabId: Number(selectTabID),
    tabIdx: index,
    pageNum: 0,
    refreshKey,
  }, reportInfo, step);
};

/**
 * 获得局部刷新换一换需要的上报参数
 * @param props 卡片的props
 * @param position 第几屏
 */
export const getChangeReportInfo = (props: SwitchProps, position: number) => {
  const { selectTabID, index } = props || {};
  const { sReqId: reqid, sReason, sPolicyId: strageid } = getReportInfo({
    tabId: Number(selectTabID),
    tabIdx: index,
    pageNum: position,
  });

  return {
    reqid,
    bigdata_reason: sReason,
    strageid,
  };
};

/**
 * 点击换一换进行预加载
 * @param props 卡片的props
 * @param position 点击换一换后下一屏屏数的索引
 * @param lastIndex 最后一屏的索引
 * @param size 一屏显示的书籍数量
 * @param success 刷新成功的回调函数
 */
export const switchNovelPrefetch = async (
  props: SwitchProps,
  position: number,
  lastIndex: number,
  size: number,
  success?: (res: Record<string, any>) => void,
): Promise<void> => {
  const { refreshKey = '' } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});

  // 在倒数第二屏的时候拉取下一屏的数据，如果不是预加载换一换或者不是倒数第二屏，提前返回
  if (!canSwitch(props, position, lastIndex)) {
    return;
  }
  const { parent, selectTabID, index } = props || {};
  try {
    const res = await preFetch([refreshKey], parent, size, {
      tabId: Number(selectTabID),
      tabIdx: index,
      pageNum: lastIndex + 1, // pageNum是拉取的数据的那一屏的下标
      refreshKey,
    });
    res && success?.(res);
  } catch (error) {
    logError(error, 'preFetchCard.switchNovelPrefetch');
  }
};
