import {
  LoggerCore, HippyLogger, AttaTransport, NovelAppId,
  LoggerOS, LogKey1, LogScene, KeylinkCmd, LogType,
} from '@tencent/luckdog-logger-hippysdk';
import { getLocation, getTabfrom, isTopTab, getQbUrl, getDeviceVisitor, getUserVisitor } from '@/luckbox';


export {
  KeylinkCmd,
  NovelAppId,
  LoggerOS,
  LogKey1,
  LogScene,
} from '@tencent/luckdog-logger-hippysdk';

type Tabfrom = 'top' | 'bottom' | 'empty';
const loggerMap = new Map<Tabfrom, HippyLogger>();
const originTime = Date.now();

/**
 * 因为频道存在顶部和底部多实例的情况, 所有要兼容
 */
const getLogger = (): HippyLogger => {
  if (!getQbUrl()) {
    const emptyLogger = loggerMap.get('empty');
    if (emptyLogger) return emptyLogger;
  } else if (isTopTab()) {
    const topLogger = loggerMap.get('top') ;
    if (topLogger) return topLogger;
  } else {
    const bottomLogger = loggerMap.get('bottom');
    if (bottomLogger) return bottomLogger;
  }

  LoggerCore.MIN_HEARTBEAT_DURATION = 30000;
  LoggerCore.MAX_SEND_INDEX = 100;

  const logger = new HippyLogger({
    // showError: !!console.error,
    // showDebug: !!console.log,
    showDebug: false,
    transport: new AttaTransport({}),
    originTime,
    isSpecialUser: false,
    isSpecialCh: false,
    isSpecialScene: false,
    isSpecialTime: false,
    envInfo: {
      novelappid: NovelAppId.novelfeeds,
      os: getDeviceVisitor().isAdr() ? LoggerOS.adr : LoggerOS.ios,
      js_version: getDeviceVisitor().getJsVersion(),
      qbversion: getDeviceVisitor().getQbVersion(),
    },
    heartbeat: {
      enable: true,
      duration: LoggerCore.MIN_HEARTBEAT_DURATION,
    },
  });
  logger.wrapGlobError(global);

  getUserVisitor().isUserReady()
    .then(({ qbid = '' }) => {
      logger.setEnvInfo({ qbid });
    });
  getDeviceVisitor().isReady()
    .then(({ guid = '', qua2: qua = '' }) => {
      logger.setEnvInfo({ guid, qua });
    });
  getLocation().isReady()
    .then(({ ch }) => {
      logger.setEnvInfo({
        channel: ch,
        enter_channel: getTabfrom(),
        url: getLocation().getUrl(),
        qbversion: getDeviceVisitor().getQbVersion(),
      });
    });
  loggerMap.set(isTopTab() ? 'top' : 'bottom', logger);
  return logger;
};

export const setClientIP = (clientIp: string): void => getLogger().setEnvInfo({ endpoint: clientIp });

/**
 * 添加关键链路日志
 */
export const addKeylink: HippyLogger['addKeylink'] = (...args): string => {
  const keylink = getLogger().addKeylink(...args);
  return keylink;
};

/**
 * 设置上报的环境变量
 */
export const setEnvInfo: HippyLogger['setEnvInfo'] = (envInfo): void => getLogger().setEnvInfo(envInfo);

/**
 * 上报一个错误
 */
export const logError: HippyLogger['logError'] = (...args): HippyLogger => getLogger().logError(...args);

/** 将非实时要求的错误信息打印到链路日志中, 同时通过指令的方式进行聚合上报 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const logErrorToKeylink: HippyLogger['logErrorToKeylink'] = (...args) => getLogger().logErrorToKeylink(...args);

/**
 * 上报了一条日志, 没有命中规则的不会上报
 */
export const logInfo: HippyLogger['logInfo'] = (...args): HippyLogger => getLogger().logInfo(...args);

/**
 * 全量上报
 */
export const logInfoAll: HippyLogger['logInfoAll'] = (...args): HippyLogger => getLogger().logInfoAll(...args);

/**
 * 上报首屏耗时
 */
export const logFirstScreen = (): HippyLogger => {
  addKeylink(`fstime=${Date.now() - originTime}`, KeylinkCmd.FS_COSTTIME_AVG);
  return getLogger().logInfoAll('首屏日志', LogKey1.firstscreen, {
    logscene: LogScene.specialscene4firstscreen,
    logtype: LogType.firstscreen,
  });
};

/** 返回频道的版本号 */
export const getJSVersion = (): number => getDeviceVisitor().getJsVersion();

/**
 * 获取当前的luckdog的traceid
 */
export const getTraceId = (): string => getLogger().getEnvInfo().lucktraceid;

/**
 * 生成一个luckdog的luckspanid
 */
export const createSpanId = (): string => getLogger().createSpanId();

/** 退出前将链路信息提交一次 */
export const flushKeylinks: HippyLogger['flushKeylinks'] = () => getLogger().flushKeylinks();

/** 添加心跳上报的监听器, 用于往心跳上报里带信息 */
export const addHeartbeatListener: HippyLogger['addHeartbeatListener'] = (...args) => getLogger().addHeartbeatListener(...args);
