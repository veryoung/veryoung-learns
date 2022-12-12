import { Transport } from 'logger/type/transport';

export interface LoggerEnvInfo {
  /**
   * todo: 可改成枚举
   */
  appid?: string;
  /**
   * 包括costtime(耗时)/error(异常)/loginfo(普通日志)/特性(property)
   */
  logtype: LogType;
  /**
   * 上报场景, 日志场景, 对于特定用户/特定渠道/特定场景/特定时间进行细分
   */
  logscene: LogScene;
  /**
   * 上一级页面的渠道信息
   */
  enter_channel: string;
  /**
   * 当前路由
   */
  url: string;
  /**
   * 如阅读器的版本1500
   */
  version: number;
  /**
   * 上报端的ip地址
   */
  endpoint: string;
  /**
   * 用户唯一标识
   */
  uuid: string;
  /**
   * 如android/ios/web/node
   */
  os: LoggerOS;
}

/**
 * 上报类型定义
 */
export interface LoggerItem extends LoggerEnvInfo {
  /**
   * 日志内容如异常日志
   */
  msg: string;
  /**
   * 完整的关键链路日志
   */
  keylinks: string;
  /**
   * 一级分类
   */
  key1: LogKey | string;
  /**
   * 二级分类
   */
  key2: string;
  /**
   * 三级分类
   */
  key3: string;
  /**
   * 执行耗时, 单位ms
   */
  costtime: number;
  /**
   * 用于要进行数值比较的场景, 如接口状态码
   */
  numextinfo1: number;
  /**
   * 用于要进行数值比较的场景, 如接口状态码
   */
  numextinfo2: number;
  /**
   * 用于存放非结构化的扩展信息, 如json
   */
  strextinfo1: string;
  /**
   * 用于存放非结构化的扩展信息, 如json
   */
  strextinfo2: string;
  /**
   * 客户端上报时间, 形如YYYY-MM-DD HH:mm:ss
   */
  clienttime: string;
}

/** 日志上报前的处理, 返回false代表不上报 */
export type BeforeReportHook = (item: LoggerItemOption) => boolean;

/**
 * 环境变量
 */
export type LoggerItemOption = Partial<LoggerItem>;

export interface HeartbeatOption {
  /** 是否启用 */
  enable: boolean;
  /** 心跳间隔, 单位是毫秒数 */
  duration: number;
}

/**
 * 日志核心可选参数类型
 */
export interface LoggerCoreOptions {
  /** 是否用console.log打印debug信息 */
  showDebug: boolean;
  /** 是否用console.error打印出错误信息 */
  showError?: boolean;
  /** 真正的上报通道 */
  transport: Transport;
  /** 初始的时间 */
  originTime?: number;
  /** 初始化环境变量 */
  envInfo?: LoggerItemOption;
  /** 心跳上报参数 */
  heartbeat?: HeartbeatOption;
  /** 日志上报前的处理, 返回false代表不上报 */
  beforeReport?: BeforeReportHook;
  /** 是否是特殊场景, 如首屏/关键页面等 */
  isSpecialScene?: boolean;
}

/**
 * 页面中的key枚举值
 */
export enum LogKey {
  /** 首页模块, 默认的页面模块 */
  all = 'all',
  /** 首屏模块 */
  firstscreen = 'firstscreen',

  /** 异常模块 */
  error = 'error',
  /** 全局错误 */
  globalerror = 'globalerror',
  /** 页面错误模块 */
  error4page = 'error4page',
  /** 首屏错误模块 */
  error4firstscreen = 'error4firstscreen',

  /** 普通日志模块 */
  loginfo = 'loginfo',
  /** 上报时间 */
  logtime = 'logtime',
  /** 通用超时模块 */
  timeout = 'timeout',
  /** 接口调用超时模块 */
  timeout4cgi = 'timeout4cgi',
  /** 异常执行超时模块 */
  timeout4promise = 'timeout4promise',
  /** 首屏超时模块 */
  timeout4firstscreen = 'timeout4firstscreen',
}

/**
 * 日志类型
 */
export enum LogType {
  /** 异常日志上报  */
  error = 'error',
  /** 普通日志上报  */
  loginfo = 'loginfo',
  /** 心跳上报类型 */
  heartbeat = 'heartbeat',
  /** 首屏上报类型 */
  firstscreen = 'firstscreen',
  /** 耗时日志上报 */
  costtime = 'costtime',
}

/**
 * 上报场景, 日志场景, 对于特定用户/特定渠道/特定场景/特定时间进行细分
 */
export enum LogScene {
  /** 默认场景 */
  default = 'default',
  /** 全量场景 */
  fullscene = 'fullscene',
  /** 心跳上报场景 */
  heartbeat = 'heartbeat',
  /** 特定用户上报, 如白名单 */
  specialuser = 'specialuser',
  /** 特定场景上报, 如首屏场景 */
  specialscene = 'specialscene',
}

/** 上报操作系统 */
export enum LoggerOS {
  /** h5版 */
  web = 'web',
  /** 桌面版本 */
  desektop = 'desektop',
}

/**
 * 上报环境变量key的union类型
 */
export type LoggerEnvKey = keyof LoggerEnvInfo;

/**
 * 心跳上报前的执行钩子
 */
export type HeartbeatListener = () => void;

export type LoggerEnvInfoOption = Partial<LoggerEnvInfo>;
