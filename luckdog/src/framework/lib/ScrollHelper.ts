import { reportUDS, BusiKey } from '@/luckdog';

/** 垂直滑动上报表 */
const verticalReportMap: Map<string, boolean> = new Map();

/** 最近的位置 */
let lastPos = 0;

/** 滑动方向 */
enum Direction {
  /** 上滑 */
  UP = 1,
  /** 下滑 */
  DOWN = -1,
  /** 不滑动 */
  STILL = 0,
}

/** 频道刷新类型 */
export enum RefreshType {
  /** 图标点击引起的刷新 */
  ICON_CLICK = 1,
  /** tab点击引起的刷新 */
  TAB_CLICK = 2,
  /** 下拉引起的刷新 */
  LIST_PULL = 3,
}

/** 引起频道刷新的行为类型 */
enum RefreshFrom {
  /** 终端命令触发类型 */
  COMMAND = 'command',
  /** 下拉触发类型 */
  PULL = 'pull',
}

/**
 * 获取滑动方向
 * @param curPos 当前位置
 * @param lastPos 上次位置
 * @returns {Number} 0: 不滑动 1：上滑 -1：下滑
 */
const getScrollDirection = (curPos: number, lastPos: number): Direction => {
  // 通过距离 10 来减小误差
  if (curPos - lastPos > 10) {
    return Direction.UP;
  }
  if (lastPos - curPos > 10) {
    return Direction.DOWN;
  }
  return Direction.STILL;
};

/**
 * 计算滑动的方向
 * @param {*} event 滑动事件的参数
 */
const computeScrollDirection = (event): Direction => {
  const { contentOffset = {} } = event;
  const { y = 0 } = contentOffset;

  const ret = getScrollDirection(y, lastPos);
  lastPos = y;
  return ret;
};

/** 滑动扩展能力 */
export default class ScrollHelper {
  public static refreshType: RefreshType = -1;

  /**
   * 上下滑动上报
   * @param event 滑动事件参数
   * @param tabId
   */
  public static reportVerticalScroll = (event, tabId): void => {
    const direction = computeScrollDirection(event);
    // 静止不作上报
    if (direction === Direction.STILL) return;
    const reportKey = `${tabId}_${direction}`;
    // 如果已经上报过，则不再上报
    if (verticalReportMap.get(reportKey)) return;

    switch (direction) {
      case Direction.UP:
        verticalReportMap.set(reportKey, true);
        break;
      case Direction.DOWN:
        verticalReportMap.set(reportKey, true);
        break;
      default:
        break;
    }
    reportUDS(BusiKey.SLIDE__TAB, { selectTabID: tabId }, { ext_data1: direction });
  };

  /**
   * 上报频道刷新
   * @param refreshFrom 刷新行为类型
   */
  public static reportReload = (refreshFrom: RefreshFrom, tabId: number): void => {
    if (ScrollHelper.refreshType !== RefreshType.ICON_CLICK) {
      switch (refreshFrom) {
        case RefreshFrom.COMMAND:
          ScrollHelper.refreshType = RefreshType.TAB_CLICK;
          break;
        case RefreshFrom.PULL:
          ScrollHelper.refreshType = RefreshType.LIST_PULL;
          break;
        default:
          break;
      }
    }
    // ext_data1 参数用来区分不同情况的刷新
    reportUDS(BusiKey.EXPOSE__REFRESH, { selectTabID: tabId }, { ext_data1: ScrollHelper.refreshType });
    // 重置刷新类型
    ScrollHelper.refreshType = -1;
    // 重置上/下滑动Map
    verticalReportMap.set(`${tabId}_${Direction.UP}`, false);
    verticalReportMap.set(`${tabId}_${Direction.DOWN}`, false);
  };
}
