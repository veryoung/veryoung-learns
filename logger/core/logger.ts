import { LoggerCoreOptions } from '../type/type';
import { LoggerCore } from './core';

/**
 * Hippy中使用的日志上报类型
 *
 * @export
 * @class HippyLogger
 * @extends {LoggerCore}
 */
export class Logger extends LoggerCore {
  public constructor(options: LoggerCoreOptions) {
    super(options);
    /** todo: 默认的环境变量可以在这里注入 */
    this.setEnvInfo({ endpoint: '11.11.11.11' });
  }

  /**
   * 全局异常捕获函数
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public wrapGlobError(hostGlobal?: any): void {
    if (hostGlobal) {
      this.showDebug && console.log('[Logger] wrapGlobError execute!');
      // todo: 可以在这里进行electron 或者web的错误上报
    }
  }
}
