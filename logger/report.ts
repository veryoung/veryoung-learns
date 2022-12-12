/* eslint-disable class-methods-use-this */
import { Transport, TransportOption } from './type/transport';
import { LoggerItemOption } from './type/type';

/** 上报 */
/**
 * TODO: 如下待办
 *  2. 支持middleware方式
 *  3. 支持批量上报, 支持throttle
 *  5. 支持写cache, 并提供触发补报接口
 */
export class LogReport implements Transport {
  public isLocal = true;

  public url = '';

  public constructor(options: TransportOption) {
    this.url = options.url || this.url;
    this.isLocal = options.isLocal || this.isLocal;
  }

  public isReady(): boolean {
    return true;
  }

  /**
   * 执行上报
   */
  public sendLog(item: LoggerItemOption): Promise<boolean> {
    if (this.isLocal) {
      return Promise.resolve(true);
    }
    return this.fetchNow(item)
      .then(res => res.status === 200)
      .catch(() => {
        return this.fetchNow(item)
          .then(res => res.status === 200)
          .catch(() => false);
      });
  }

  /** 是否立即上报 */
  private fetchNow(item: LoggerItemOption): Promise<Response> {
    return fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}
