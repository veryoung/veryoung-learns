import { readSharedSettings, writeSharedSettings } from '../utils/shareSettings';
import { addKeylink, KeylinkCmd, logError, reportBeacon, TechKey } from '@/luckdog';
import {
  OpInfoType, FeedsOpInfoItemData, FeedsReportInfo, FeedsOpInfoItem, VenusReportInfo,
} from '@/luckbox';
import { isFSRendered } from './firstscreen';
import { ItemBean } from '../entity/bean';

/** 运营数据检查类型 */
export enum CheckType {
  /** 数据 ready */
  POPDATA_READY = 'POPDATA_READY',
  /** 闪屏结束 */
  SPLASH_END = 'SPLASH_END',
  /** 渲染完成 */
  RENDER_END = 'RENDER_END',
}

export interface PopResult {
  type: OpInfoType;
  data?: FSOpContentItem;
}

/** 返回给各个运营组件的props格式 */
export interface FSOpContentItem {
  itemBean: FSOpReportData;
  opInfo?: FeedsOpInfoItemData;
  showTimes?: number;
}

/** 格式化之后的上报相关数据 */
export interface FSOpReportData extends ItemBean {
  app_id?: string;
  business?: number;
  item_id?: string;
  ui_style?: number;
  report_info?: [string, string][];
  udsEventInfo?: Record<string, string> | undefined; // uds上报扩展信息
  clickUrl?: string; // 点击上报url
  showUrl?: string; // 曝光上报url
}

/** 格式化后保存在popData数组里的数据格式 */
interface FSOpItem {
  type: OpInfoType;
  priority: number;
  data?: FSOpContentItem;
}

interface CachedExposedTime {
  [key: string]: number;
}

/** 首屏弹窗可以弹出的监听函数的类型 */
type fsPopReadyHook = (popData: PopResult) => void;

/** 监听首屏函数弹框的数组 */
const fsPopReadyObservers: fsPopReadyHook[] = [];

/** 默认返回的弹窗数据 */
const defaultResult: PopResult = {
  type: OpInfoType.DEFAULT,
};
/** 运营组件默认曝光默认 */
const DEFALUT_EXPOSED_TIME = -1;

/** 各个运营组件曝光次数 */
const FEEDS_OP_EXPOSED_TIME_KEY = 'feedsOpExposedTime';

/** 默认闪屏结束的时间 */
const SPLASH_END_DELAY = 5000;

/** 单例弹窗控制器 */
let fsPopPresenter: FSPopPresenter | undefined;

/**
 * 将曝光次数格式化成字符串格式
 * @param exposedTimes 所有运营组件曝光次数
 */
const exposedTimesToStr = (exposedTimes: CachedExposedTime): string => {
  if (!exposedTimes || !Object.keys(exposedTimes).length) {
    return '';
  }

  let allExposedTime = '';
  Object.keys(exposedTimes).forEach((key, index) => {
    if (index !== Object.keys(exposedTimes).length - 1) {
      allExposedTime += `${key}=${exposedTimes[key]};`;
    } else {
      allExposedTime += `${key}=${exposedTimes[key]}`;
    }
  });
  return allExposedTime;
};

/**
 * 将从内存读取出的曝光次数字符串解析成对象
 * @param strExposedTimes
 */
const resolveExposedTimes = (strExposedTimes: string): CachedExposedTime => {
  if (!strExposedTimes) {
    return {};
  }
  try {
    const allExposedTime = {};
    const exposedTimes = strExposedTimes.split(';');
    exposedTimes.forEach((item) => {
      const [opType, exposedTime] = item.split('=');
      allExposedTime[opType] = parseInt(exposedTime, 10);
    });

    return allExposedTime;
  } catch (error) {
    logError(error, 'FirstScreenPop.resolveExposedTimes');
    return {};
  }
};

/** 已曝光次数是否少于应该曝光的次数 */
const lessThanShouldExposeTime = (item: FeedsOpInfoItem, allItemsExposedTime: CachedExposedTime): boolean => {
  if (!allItemsExposedTime || !Object.keys(allItemsExposedTime).length) {
    return true;
  }

  const { showTimes: maxShownTime = DEFALUT_EXPOSED_TIME, type } = item;
  if (maxShownTime > DEFALUT_EXPOSED_TIME) {
    const opItemShownTime = allItemsExposedTime[type];
    if (opItemShownTime && opItemShownTime >= maxShownTime) {
      return false;
    }
  }
  return true;
};

/** 格式化返回数据 */
const formatResult = (popData: FSOpItem): PopResult => ({
  type: popData.type,
  data: popData.data,
});

/** 格式化首屏返回的数据 */
const formatItem = (originData: FeedsOpInfoItem): FSOpItem => {
  const { feedsReportInfo, data, type, priority, showTimes } = originData;
  return {
    type,
    priority,
    data: {
      itemBean: formatReportData(feedsReportInfo),
      opInfo: data,
      showTimes,
    },
  };
};

/** 将首屏运营数据转换为合适上报的格式 */
const formatReportData = (opReportInfo: FeedsReportInfo | undefined): FSOpReportData => {
  if (!opReportInfo) {
    return {};
  }
  const { appId = '', businessId, uiStyle = 0, itemId = '', reportInfo, udsEventInfo, clickUrl = '', showUrl = '' } = opReportInfo;
  return {
    app_id: appId,
    business: businessId ? parseInt(businessId, 10) : undefined,
    ui_style: uiStyle,
    item_id: itemId,
    report_info: convertReportInfo2Array(reportInfo),
    udsEventInfo,
    clickUrl,
    showUrl,
  };
};

/** 将report_info的格式从对象改变为二维数组以适应venus上报 */
const convertReportInfo2Array = (reportInfo: VenusReportInfo | undefined): [string, string][] => {
  if (!reportInfo || Object.keys(reportInfo).length === 0) {
    return [];
  }
  const needReportItems: [string, string][] = [];
  Object.keys(reportInfo).forEach((reportItem) => {
    needReportItems.push([reportItem, reportInfo[reportItem]]);
  });
  return needReportItems;
};


/** 首屏弹窗控制器 */
class FSPopPresenter {
  /** 首屏所有弹窗数据, 按照展示优先级排序 */
  private popData: FSOpItem[] = [];

  /** 当前优先级 */
  private curPriority = 0;

  /** 所有运营组件曝光的次数 */
  private itemsExposedTimes = '';

  /** 闪屏是否结束 */
  private isSplashEnd = false;

  /** 首屏列表数据是否渲染 */
  private hasRendered = false;

  /** 闪屏定时器 */
  private splashEndTimer?: NodeJS.Timeout;

  /** 启动闪屏结束定时器，如果到时间还没有收到终端消息，自动将闪屏状态设置为结束 */
  public startSplashEndTimer = () => {
    if (this.splashEndTimer) {
      clearTimeout(this.splashEndTimer);
    }
    this.splashEndTimer = setTimeout(() => {
      this.isSplashEnd = true;
      this.checkShouldShowPop(CheckType.SPLASH_END);
    }, SPLASH_END_DELAY);
  };

  /** 设置闪屏完结 */
  public setSplashEnd = () => {
    // 如果超过定时时间，闪屏状态已经被设置为结束，则直接返回
    if (this.isSplashEnd) {
      return;
    }
    // 清楚定时器，改变闪屏状态，检查是否可以弹窗
    if (this.splashEndTimer) {
      clearTimeout(this.splashEndTimer);
    }
    this.isSplashEnd = true;
    this.checkShouldShowPop(CheckType.SPLASH_END);
  };

  /** 设置首屏列表数据渲染完毕 */
  public setFSDataRendered = () => {
    this.hasRendered = true;
    this.checkShouldShowPop(CheckType.RENDER_END);
  };

  /** 将首屏数据中的弹出框相关数据载入到弹出框控制器中 */
  public initFSPopData = async (opInfos: FeedsOpInfoItem[] | undefined): Promise<void> => {
    if (!opInfos || !opInfos.length) return;
    const formatedOpInfos: FSOpItem[] = [];
    addKeylink(opInfos.map(info => `exp-opinfo-received-${info.type}`).join(';'), KeylinkCmd.PR_SUM);
    opInfos.forEach((info) => {
      reportBeacon(TechKey.EXPOSE__OPINFO_RECEIVED, {}, {
        op_type: info.type,
        op_times: info.showTimes,
        op_priority: info.priority,
      });
    });
    try {
      const allItemsExposedTime = this.itemsExposedTimes || await readSharedSettings(FEEDS_OP_EXPOSED_TIME_KEY) || '';
      const exposedTimes = resolveExposedTimes(allItemsExposedTime);

      // 将数据格式格式化为组件可用的数据格式
      opInfos.forEach((item) => {
      // 如果是在浏览器生命周期中只展示一次的组件，类似新用户引导相关，判断是否曝光过
        if (lessThanShouldExposeTime(item, exposedTimes)) {
          formatedOpInfos.push(formatItem(item));
          addKeylink(`exp-opinfo-allowed-${item.type}`, KeylinkCmd.PR_SUM);
          reportBeacon(TechKey.EXPOSE__OPINFO_ALLOWED, {}, {
            op_type: item.type,
            op_times: item.showTimes,
            op_priority: item.priority,
          });
        }
      });
      if (formatedOpInfos.length) {
        this.initPopData(...formatedOpInfos);
      }
    } catch (error) {
      logError(error, 'FirstScreenPop.initFSPopData');
    }
  };

  /**
   * 从url进入时重新获取弹框数据
   * 背景：在重新通过url载入时重新垃取首屏接口数据，按照需要重新展示的弹出框的优先级，找到优先级最高的弹出框，
   *      返回到这个弹出框的状态，重新显示
   * 1. 需要根据url里的信息重新显示的弹出框：福利气泡 > 底部悬浮栏
   * 2. 如果最高优需要展示的不是悬浮栏，需要重置所有弹出框的信息，使它们可以依次展示
   * 3. 因为悬浮栏有默认逻辑，没有参数也可能会更新数据，在android下每次点击底部icon都会触发此函数，目前判断展示时会判断数据是否发生改变
   *
   * @param opInfos 新的运营数据
   */
  public updateFSPopData = (opInfos: FeedsOpInfoItem[] | undefined): PopResult => {
    // url上携带参数的话需要更新弹窗，包括福利气泡和悬浮栏
    const needUpdateItems = [
      OpInfoType.WC_BUBBLE, OpInfoType.BTM_OP_INFO,
      OpInfoType.OP_HALF_POP, OpInfoType.OP_HALF_WEBVIEW,
      OpInfoType.NEWUSER_RED_PACK,
    ];
    // 按照优先级排序找到需要展示的最高优的弹出框
    opInfos?.sort((item1, item2) => item1.priority - item2.priority);
    const needUpdateInfo = opInfos?.find(item => needUpdateItems.includes(item.type));

    if (!needUpdateInfo) {
      return defaultResult;
    }

    // 重置需要显示的弹窗信息
    this.initFSPopData(opInfos);

    return this.addOrReplaceItem(needUpdateInfo);
  };

  /**
   * 转换到下一个状态
   */
  public changeToNextPriority = (): PopResult => {
    try {
      const isMaxPriority = this.popData.length
        ? this.curPriority === this.popData[this.popData.length - 1].priority
        : true;
      if (isMaxPriority) {
        return defaultResult;
      }
      // 找到优先级比当前优先级大并且可以展示的第一个弹出框并返回
      const nextPop = this.popData.find(item => item.priority > this.curPriority);
      if (!nextPop) {
        return defaultResult;
      }

      this.curPriority = nextPop.priority;
      return formatResult(nextPop);
    } catch (error) {
      logError(error, 'FirstScreenPop.changeToNextPriority');
      return defaultResult;
    }
  };

  /**
   * 更新需要缓存曝光次数的组件的曝光次数
   */
  public updateCachedExposedTime = async (type: OpInfoType): Promise<void> => {
    try {
      const allItemsExposedTime = this.itemsExposedTimes || await readSharedSettings(FEEDS_OP_EXPOSED_TIME_KEY) || '';
      const exposedTimes: CachedExposedTime = resolveExposedTimes(allItemsExposedTime);
      const opItemExposedTime = exposedTimes[type] || 0;

      if (opItemExposedTime >= 0) {
        exposedTimes[type] = opItemExposedTime + 1;
      }
      this.itemsExposedTimes = exposedTimesToStr(exposedTimes);
      writeSharedSettings(FEEDS_OP_EXPOSED_TIME_KEY, this.itemsExposedTimes);
    } catch (error) {
      logError(error, `FirstScreenPop.updateCachedExposedTime.${type}`);
    }
  };

  /** 检查是否可以展示首屏弹窗了，如果可以，执行监听函数 */
  private checkShouldShowPop = (checkType: CheckType): void => {
    reportBeacon(TechKey.EXPOSE__OPINFO_CHECK, {}, {
      checkType,

      // [数据是否ready, 渲染是否完成, 闪屏是否结束]
      conditions: [this.popData.length > 0, this.hasRendered, this.isSplashEnd].map(Number).join('-'),
    });

    if (this.isSplashEnd && this.hasRendered && this.popData.length) {
      fsPopReadyObservers.length && fsPopReadyObservers.forEach(fn => fn(this.getCurrentPop()));
    }
  };

  /**
   * 获取当前状态的弹框数据
   */
  private getCurrentPop = (): PopResult => {
    if (isFSRendered()) {
      const maxPriority = this.popData.length ? this.popData[this.popData.length - 1].priority : -1;
      if (this.curPriority <= maxPriority) {
        const curPop = this.popData.find(item => item.priority === this.curPriority);
        return curPop || defaultResult;
      }
    }
    return defaultResult;
  };

  /** 初始化弹出框数据 */
  private initPopData = (...items: FSOpItem[]): void => {
    if (!items || !items.length) {
      return;
    }

    this.popData = items;

    this.sortItems();
    this.curPriority = this.popData[0].priority;

    // 判断是否可以弹出弹窗
    this.checkShouldShowPop(CheckType.POPDATA_READY);
  };

  /** 转换到某一个指定的优先级状态 */
  private changeToPriority = (priority: number): PopResult => {
    const pop = this.popData.find(item => item.priority === priority);
    if (!pop) {
      return defaultResult;
    }

    this.curPriority = pop.priority;
    return formatResult(pop);
  };

  /** 按照优先级将数组排序 */
  private sortItems = (): void => {
    if (this.popData && this.popData.length > 1) {
      this.popData.sort((item1, item2) => item1.priority - item2.priority);
    }
  };

  /**
   *  新增或者替换某一项, 并切换到新增项的状态
   */
  private addOrReplaceItem = (newFSItem: FeedsOpInfoItem): PopResult => {
    const newItem = formatItem(newFSItem);
    const foundIdx = this.popData.findIndex(item => item.type === newItem.type);
    if (foundIdx !== -1) {
      this.popData.splice(foundIdx, 1, newItem);
    } else {
      this.popData.push(newItem);
      this.sortItems();
    }

    // 转换到该数据的状态
    return this.changeToPriority(newItem.priority);
  };
}

/** 获得单例弹窗控制器 */
export const getFSPopPresenter = (): FSPopPresenter => {
  !fsPopPresenter && (fsPopPresenter = new FSPopPresenter());

  return fsPopPresenter;
};

/** 添加首屏弹窗可以弹出后的监听函数 */
export const addFSPopReadyObserver = (func: fsPopReadyHook): void => {
  if (func && !fsPopReadyObservers.includes(func)) {
    fsPopReadyObservers.push(func);
  }
};

/** 移除首屏弹窗可以弹出后的监听函数 */
export const removeFSPopReadyObserver = (func: fsPopReadyHook): void => {
  const index = fsPopReadyObservers.findIndex(item => item === func);
  if (index >= 0) {
    fsPopReadyObservers.splice(index, 1);
  }
};
