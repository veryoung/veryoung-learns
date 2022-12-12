import { isElectron } from '@services/env';
import { KeylinkCmd, LoggerCore, Logger } from 'logger/core';
import { LoggerOS, LogKey, LogScene, LogType } from 'logger/type/type';
import { LogReport } from './report';

type Tabfrom = 'web' | 'desktop';
const loggerMap = new Map<Tabfrom, Logger>();
const originTime = Date.now();

/**
 * 因为频道存在顶部和底部多实例的情况, 所有要兼容
 */
const getLogger = (): Logger => {
  if (isElectron) {
    const desktopLogger = loggerMap.get('desktop');
    if (desktopLogger) return desktopLogger;
  } else {
    const webLogger = loggerMap.get('web');
    if (webLogger) return webLogger;
  }

  /** 设置心跳时间 */
  LoggerCore.MIN_HEARTBEAT_DURATION = 30000;
  /** 单次心跳最大长度 */
  LoggerCore.MAX_SEND_INDEX = 100;
  const logger = new Logger({
    // showError: !!console.error,
    showDebug: !!console.log,
    // showDebug: false,
    transport: new LogReport({
      isLocal: process.env.NODE_ENV === 'development',
    }),
    originTime,
    isSpecialScene: false,
    envInfo: {
      os: isElectron ? LoggerOS.desektop : LoggerOS.web,
    },
    heartbeat: {
      enable: true,
      duration: LoggerCore.MIN_HEARTBEAT_DURATION,
    },
  });
  logger.wrapGlobError(global);

  /**
   * todo: 在这里注入用户信息
   */
  logger.setEnvInfo({
    uuid: '',
  });

  loggerMap.set(isElectron ? 'desktop' : 'web', logger);
  return logger;
};

export const setClientIP = (clientIp: string): void => getLogger().setEnvInfo({ endpoint: clientIp });

/**
 * 添加关键链路日志
 */
export const addKeylink: Logger['addKeylink'] = (...args): string => {
  const keylink = getLogger().addKeylink(...args);
  return keylink;
};

/**
 * 设置上报的环境变量
 */
export const setEnvInfo: Logger['setEnvInfo'] = (envInfo): void => getLogger().setEnvInfo(envInfo);

/**
 * 上报一个错误
 */
export const logError: Logger['logError'] = (...args): Logger => getLogger().logError(...args);

/** 将非实时要求的错误信息打印到链路日志中, 同时通过指令的方式进行聚合上报 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const logErrorToKeylink: Logger['logErrorToKeylink'] = (...args) => getLogger().logErrorToKeylink(...args);

/**
 * 上报了一条日志, 没有命中规则的不会上报
 */
export const logInfo: Logger['logInfo'] = (...args): Logger => getLogger().logInfo(...args);

/**
 * 全量上报
 */
export const logInfoAll: Logger['logInfoAll'] = (...args): Logger => getLogger().logInfoAll(...args);

/**
 * 上报首屏耗时
 */
export const logFirstScreen = (): Logger => {
  addKeylink(`fstime=${Date.now() - originTime}`, KeylinkCmd.FS_COSTTIME_AVG);
  return getLogger().logInfoAll('首屏日志', LogKey.firstscreen, {
    logscene: LogScene.specialscene,
    logtype: LogType.firstscreen,
  });
};

/** 退出前将链路信息提交一次 */
export const flushKeylinks: Logger['flushKeylinks'] = () => getLogger().flushKeylinks();

/** 添加心跳上报的监听器, 用于往心跳上报里带信息 */
export const addHeartbeatListener: Logger['addHeartbeatListener'] = (...args) =>
  getLogger().addHeartbeatListener(...args);

export const getKeylink = () => getLogger().getKeylinksAsArray();
