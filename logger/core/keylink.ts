/**
 * 链路信息的标识类型
 */
export type KeylinkKey = KeylinkCmd | string;

/**
 * 关键链路指令,可用于后期用于异常监控
 */
export enum KeylinkCmd {
  /** 通用SUM特性上报 */
  PR_SUM = '@pr-sum',
  /** 异常级别的通用SUM上报 */
  PR_ERROR_SUM = '@pr-error-sum',
  /** 警告级别的通用SUM上报 */
  PR_WARN_SUM = '@pr-warn-sum',
  /** 提醒级别的通用SUM上报 */
  PR_INFO_SUM = '@pr-info-sum',
  /** 通用AVG特性上报 */
  PR_AVG = '@pr-avg',

  /** 异常日志指令, 用于记录一些不需要立即上报的异常 */
  LOG_ERROR = '@log-error',
  /** FETCH请求失败日志指令, 会被聚合成fetch-error-sum异常监控项 */
  LOG_FETCH_ERROR = '@log-fetch-error',

  /** 首屏耗时AVG指令 */
  FS_COSTTIME_AVG = '@fs-costtime-avg',
  /** 首屏耗时慢的SUM指令, 如超过3s之类 */
  FS_COSTTIMESLOW_SUM = '@fs-costtimeslow-sum',
  /** 首屏超时SUM指令 */
  FS_TIMEOUT_SUM = '@fs-timeout-sum',
  /** 首屏请求SUM指令 */
  FS_REQ_SUM = '@fs-req-sum',

  /** FETCH请求耗时AVG指令 */
  FETCH_COSTTIME_AVG = '@fetch-costtime-avg',
  /** FETCH请求耗时慢的SUM指令 */
  FETCH_COSTTIMESLOW_SUM = '@fetch-costtimeslow-sum',
  /** FETCH请求超时SUM指令 */
  FETCH_TIMEOUT_SUM = '@fetch-timeout-sum',
  /** FETCH非0返回SUM指令 */
  FETCH_RETCODE_SUM = '@fetch-retcode-sum',
  /** FETCH空数据返回SUM指令 */
  FETCH_EMPTYDATA_SUM = '@fetch-emptydata-sum',
  /** FETCH请求失败SUM指令 */
  FETCH_ERROR_SUM = '@fetch-error-sum',
  /** FETCH通用SUM指令 */
  FETCH_REQ_SUM = '@fetch-req-sum',
}
