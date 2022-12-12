import { isTopTab, getFeedsFirstScreenData } from '@/luckbox';
import { logInfoAll, addKeylink, logError, KeylinkCmd, reportBeacon, TechKey } from '@/luckdog';
import { writeSharedSettings } from '../utils/shareSettings';
import { FeedsFSResp } from '../entity';
import { DYNAMIC_TABS, FIRST_SCREEN_DATA_LOCAL_KEY } from '../constants';
import { ExpertsData, updateExpertsData } from './expert-controller';

type FirstScreeAfterHook = () => void;
type FirstScreeRetryAfterHook = (fsData: FeedsFSResp) => void;

/** 监听首屏渲染完成的observers */
const fsObservers: FirstScreeAfterHook[] = [];
/** 首屏是否渲染结束 */
let hasFirstScreenRender = false;

/** 首屏数据 */
let fsData: FeedsFSResp;
/** 首屏接口拉取完毕的promise */
let fsDataReady: Promise<FeedsFSResp>;
/** 首屏接口重试完成的promise */
let fsDataRetryReady: Promise<FeedsFSResp>;

/** 首屏接口成功状态 */
enum FSDataSuccessState {
  /** 未知 */
  UNKNOWN = -1,
  /** 失败 */
  FAILED = 0,
  /** 成功 */
  SUCCESS = 1,
}

const TAG = 'FSPresenter';
/** 首屏数据是否成功，默认-1 */
let isFSDSuccess = FSDataSuccessState.UNKNOWN;
/** 首屏接口重试是否重试过，默认false */
let isFSDRetried = false;
/** 监听首屏重试成功后的observers */
const fsRetryObservers: FirstScreeRetryAfterHook[] = [];

/** 获取首屏渲染状态 */
export const isFSRendered = (): boolean => hasFirstScreenRender;

/** 改变首屏渲染状态，并且执行监听函数 */
export const setFSRendered = (): void => {
  hasFirstScreenRender = true;
  fsObservers.length && fsObservers.forEach(fn => fn());

  // 等首屏数据也完成，上报首屏链路日志
  if (isFSDSuccess !== FSDataSuccessState.UNKNOWN || isTopTab()) {
    logInfoAll('首屏链路日志上报[时机-首屏内容渲染完成]', 'firstscreen.setFSRendered');
  }
};

/** 添加首屏渲染后的监听函数 */
export const addFSObserver = (func: FirstScreeAfterHook): void => {
  if (func && !fsObservers.includes(func)) {
    fsObservers.push(func);
  }
};

/** 移除首屏渲染后的监听函数 */
export const removeFSObserver = (func: FirstScreeAfterHook): void => {
  const index = fsObservers.findIndex(item => item === func);
  if (index >= 0) {
    fsObservers.splice(index, 1);
  }
};

/** 获取首屏接口拉取成功状态 */
export const isFSDataSuccess = () => isFSDSuccess === FSDataSuccessState.SUCCESS;

/** 拉取首屏接口 */
export const getFSData = (forceUpdate = false): Promise<FeedsFSResp> => {
  if (fsDataReady && !forceUpdate) return fsDataReady;

  return fsDataReady = (async () => {
    try {
      const starttime = Date.now();
      // 是否是触发地址改变，刷新首屏数据
      const isFromRefresh = isFSDSuccess !== FSDataSuccessState.UNKNOWN;
      fsData = await getFeedsFirstScreenData();
      addKeylink(`getFeedsFirstScreenData=${Date.now() - starttime}`, KeylinkCmd.RPC_COSTTIME_AVG);
      // 根据接口的动态tab数据判断是否成功
      const { dynamicTabs, opInfos, WCUserStatus, activeTab, expertItems } = fsData;
      isFSDSuccess = !!dynamicTabs.length ? FSDataSuccessState.SUCCESS : FSDataSuccessState.FAILED;
      if (isFSDataSuccess()) {
        // 保存本地
        writeSharedSettings(DYNAMIC_TABS, { dynamicTabs, activeTab });
        addKeylink('首屏接口成功, 保存本地首屏动态tab数据', TAG);

        const expertItemKeylinkJSON = Object.keys(expertItems).reduce((acc: Record<string, any>, key) => {
          acc[`expertflag-${key}--${expertItems[key]}`] = 1;
          return acc;
        }, {});
        addKeylink(expertItemKeylinkJSON, KeylinkCmd.PR_INFO_SUM);

        // 更新实验配置
        updateExpertsData(expertItems as unknown as ExpertsData);
      } else {
        addKeylink('getFeedsFirstScreenData', KeylinkCmd.RPC_ERROR_SUM);
      }

      addKeylink([
        `接口拉取是否成功:${isFSDataSuccess()}`,
        `运营数据列表长度: ${opInfos.length}`,
        `福利数据[visible: ${WCUserStatus.visible}, prize: ${WCUserStatus.prize}, readTime: ${WCUserStatus.readTime}]`,
        `动态tab数据, 长度: ${dynamicTabs.length}, ids: ${JSON.stringify(dynamicTabs.map(tab => tab.tabId))}`,
      ].join(', '), TAG);
      // 等首屏内容渲染也完成，上报首屏链路日志
      if (isFSRendered()) {
        logInfoAll(`首屏链路日志上报[时机-首屏接口${isFromRefresh ? '刷新' : '拉取'}完成]`, 'firstscreen.getFSData');
      }
      return fsData;
    } catch (err) {
      logError(err, TAG, 'fsDataReady');
      return {} as any;
    }
  })();
};

/** 是否首屏接口请求完，返回Promise */
export const isFSDataReady = () => fsDataReady;

/** 同步获取首屏数据 */
export const getFSDataSync = () => fsData;

/** 首屏接口是否重试过 */
export const isFSDataRetried = () => isFSDRetried;

/** 首屏接口是否能重试 */
export const canFSDataRetry = () => isFSRendered() && !isFSDataRetried() && isFSDSuccess === FSDataSuccessState.FAILED;

/** 首屏接口失败重试 */
export const getFSDataRetry = async () => {
  if (fsDataRetryReady) return fsDataRetryReady;

  return fsDataRetryReady = (async () => {
    try {
      const starttime = Date.now();
      reportBeacon(TechKey.EXPOSE__FSD_RETRY);
      const retryFSData = await getFeedsFirstScreenData();
      addKeylink('getFeedsFirstScreenDataRetry', KeylinkCmd.RPC_REQ_SUM);
      addKeylink(`getFeedsFirstScreenData=${Date.now() - starttime}`, KeylinkCmd.RPC_COSTTIME_AVG);
      isFSDRetried = true;
      const { dynamicTabs, opInfos, WCUserStatus } = retryFSData;
      const isRetrySuccess = !!dynamicTabs.length;
      if (isRetrySuccess) {
        isFSDSuccess = FSDataSuccessState.SUCCESS;
        fsData = retryFSData;
        fsRetryObservers.length && fsRetryObservers.forEach(fn => fn(fsData));
        // 保存本地
        writeSharedSettings(FIRST_SCREEN_DATA_LOCAL_KEY, { dynamicTabs });
        reportBeacon(TechKey.EXPOSE__FSD_RETRY_SUCCESS);
        addKeylink('首屏接口失败后重试成功, 保存本地首屏动态tab数据', TAG);
      } else {
        addKeylink('getFeedsFirstScreenDataRetry', KeylinkCmd.RPC_ERROR_SUM);
        addKeylink('首屏接口失败后重试失败', TAG);
      }

      // 上报首屏接口失败重试后的链路日志
      addKeylink([
        `失败重试是否成功:${isRetrySuccess}`,
        `运营数据列表长度: ${opInfos.length}`,
        `福利数据[visible: ${WCUserStatus.visible}, prize: ${WCUserStatus.prize}, readTime: ${WCUserStatus.readTime}]`,
        `动态tab数据, 长度: ${dynamicTabs.length}, ids: ${JSON.stringify(dynamicTabs.map(tab => tab.tabId))}`,
      ].join(', '), TAG);
      logInfoAll('首屏接口失败, 重试后数据处理', 'firstscreen.getFSDataRetry');
      return retryFSData;
    } catch (err) {
      logError(err, 'firstscreen.fsDataRetryReady');
      return {} as any;
    }
  })();
};

/** 是否首屏重试请求完，返回Promise */
export const isFSDataRetryReady = () => fsDataRetryReady;

/** 添加首屏重试成功后的监听函数 */
export const addFSRetryObserver = (func: FirstScreeRetryAfterHook): void => {
  if (func && !fsRetryObservers.includes(func)) {
    fsRetryObservers.push(func);
  }
};

/** 移除首屏重试成功后的监听函数 */
export const removeFSRetryObserver = (func: FirstScreeRetryAfterHook): void => {
  const index = fsRetryObservers.findIndex(item => item === func);
  if (index >= 0) {
    fsRetryObservers.splice(index, 1);
  }
};
