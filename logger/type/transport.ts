import { LoggerItemOption } from './type';

/**
 * 目标宿主上报对象接口
 */
export interface Transport {
  /**
   * 是否准备好
   */
  isReady(): boolean;

  /**
   * 上报了一条白名单日志
   */
  sendLog(item: LoggerItemOption): Promise<boolean>;
}

/** 上报能力 */
export interface TransportOption {
  /** 上报的url */
  url?: string;
  /** 本地写入还是接口上报 */
  isLocal: boolean;
}
