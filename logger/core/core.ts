/* eslint-disable no-param-reassign */
/**
 * 日志上报核心对象
 */
import { KeylinkCmd, KeylinkKey } from './keylink';
import { Transport } from '../type/transport';
import { LoggerEnvInfoClazz } from '../type/loggerEnv';
import {
  HeartbeatListener,
  HeartbeatOption,
  LoggerCoreOptions,
  LoggerEnvInfo,
  LoggerEnvInfoOption,
  LoggerEnvKey,
  LoggerItemOption,
  LogKey,
  LogScene,
  LogType,
} from '../type/type';
import { formatAnyVal, getFormatTime } from '../utils';

const TAG = '[loggercore]';
const OPTION_KEYS: (keyof LoggerCoreOptions)[] = ['showDebug', 'showError', 'beforeReport'];
const numberFixed = (costtime: number): number => parseFloat(Number(costtime).toFixed(2));
const costtimeFromNow = (originTime: number): string => ((Date.now() - originTime) / 1000).toFixed(2);
/**
 * 核心logger基类
 */
export class LoggerCore {
  /** 心跳上报最小时间间隔 */
  public static MIN_HEARTBEAT_DURATION = 30000;

  /** 一次生命周期最大的上报次数 */
  public static MAX_SEND_INDEX = 100;

  /** addKeylink的别名方法 */
  public keylink = this.addKeylink;

  /** logError的别名方法 */
  public reportError = this.logError;

  protected showDebug = false;

  protected showError = true;

  protected options!: LoggerCoreOptions;

  protected originTime = Date.now();

  /** 上报环境变量 */
  protected envInfo = new LoggerEnvInfoClazz();

  /** 关键链路日志, 阅读器要用, 所以public */
  private keylinks: string[] = [];

  /** 链路指令set集合, 用于存放一次上报周期内的指令 */
  private keylinkCmdSet: Set<KeylinkKey> = new Set();

  /** 全部的关键链路日志 */
  private totalKeylinks: string[] = [];

  private transport!: Transport;

  private itemBuffer: LoggerItemOption[] = [];

  /** 一次生命周期内的上报索引 */
  private sendIndex = 1;

  private heartbeatOption: HeartbeatOption;

  /** 心跳上报任务 */
  private heartbeatTask!: NodeJS.Timeout;

  /**
   * 心跳上报前的执行钩子集合
   */
  private heartbeatListeners: HeartbeatListener[] = [];

  public constructor(options: LoggerCoreOptions) {
    this.setOptions(options);
    this.heartbeatOption = {
      enable: options.heartbeat?.enable || false,
      duration: Math.max(LoggerCore.MIN_HEARTBEAT_DURATION, options.heartbeat?.duration || 0),
    };
    this.activeHeartTask();
  }

  /**
   * 获取配置项
   */
  public getOptions(): LoggerCoreOptions {
    return this.options;
  }

  /**
   * 后置调用的设置options的方法, 用于用户更改options设置项内容
   */
  public setOptions(options: Partial<LoggerCoreOptions>): void {
    if (!this.options && options) {
      this.options = options as LoggerCoreOptions;
    } else {
      OPTION_KEYS.forEach(key => {
        if (options[key] !== undefined) this.options[key] = options[key] as never;
      });
    }
    this.showDebug = options.showDebug !== undefined ? options.showDebug : this.showDebug;
    this.showError = options.showError !== undefined ? options.showError : this.showError;
    options.transport && this.setTransport(options.transport);
    options.originTime && this.setOriginTime(options.originTime);
    options.envInfo && this.setEnvInfo(options.envInfo);
  }

  /**
   * 设置日志通道transport
   *
   * @param {Transport} transport
   * @memberof LoggerCore
   */
  public setTransport(transport: Transport): void {
    this.transport = transport;
    if (this.itemBuffer.length) {
      // TODO: 后面改成批量上报接口
      this.itemBuffer.map(item =>
        this.transport
          .sendLog({
            ...item,
            ...this.envInfo,
          })
          .then(success => this.onAfterTransportSend(item, success)),
      );
      this.showDebug && console.log(`${TAG} transportReadyCallback, items=`, this.itemBuffer.length);
      this.itemBuffer.length = 0;
      this.clearKeylinks();
    }
  }

  /**
   * 设置起始时间
   */
  public setOriginTime(originTime: number): void {
    this.originTime = originTime;
  }

  /**
   * 设置上报的环境变量
   */
  public setEnvInfo(envInfo: LoggerEnvInfoOption): void {
    (Object.keys(envInfo) as LoggerEnvKey[]).forEach((key: LoggerEnvKey) => {
      if (typeof envInfo[key] === typeof this.envInfo[key] && envInfo[key] !== undefined && envInfo[key] !== null) {
        (this.envInfo as any)[key] = envInfo[key];
      }
    });
  }

  /**
   * 获取上报的环境变量
   */
  public getEnvInfo(): LoggerEnvInfo {
    return this.envInfo;
  }

  /**
   * 添加一条或多条关键链路日志
   */
  public addKeylink(log: string | Record<string, any>, key?: KeylinkKey): string {
    const strLog = typeof log === 'string' ? (log as string) : JSON.stringify(log);
    const strTime = `(${costtimeFromNow(this.originTime)}s)`;
    let msg = '';
    if (!key) {
      msg = `${strLog} ${strTime}`;
    } else if (key.startsWith('@')) {
      // 指令
      msg = `${key} ${strLog} ${strTime}`;
      this.keylinkCmdSet.add(key as KeylinkCmd);
    } else {
      msg = `[${key}] ${strLog} ${strTime}`;
    }
    this.keylinks.push(msg);
    return msg;
  }

  /**
   * 获取原始的关联链路日志
   */
  public getKeylinksAsArray(): string[] {
    return this.totalKeylinks;
  }

  /**
   * 获取关键链路日志(字符串)
   */
  public getKeylinks(): string {
    return this.keylinks.join('=> \n');
  }

  /**
   * 清空链路日志
   */
  public clearKeylinks(forceClearTotal = false): void {
    this.totalKeylinks.push(...this.keylinks);
    this.keylinks.length = 0;
    this.keylinkCmdSet.clear();
    if (forceClearTotal) {
      this.totalKeylinks.length = 0;
    }
  }

  /**
   * 上报了一条日志, 没有命中规则的不会上报
   * @key 非全量上报方法, 只有命中特定用户/特定渠道/特定场景/特定时间才会上报
   * @param msg  消息
   * @param key1 一级分类key1字段值
   * @param optionsOrKey2 二级分类key2字段值或者上报options
   */
  public logInfo(msg: string, key1?: string, optionsOrKey2: LoggerItemOption | string = {}): LoggerCore {
    const item: LoggerItemOption = {
      ...this.envInfo,
      logtype: LogType.loginfo,
      key1: key1 || LogKey.loginfo,
      key2: typeof optionsOrKey2 === 'string' ? (optionsOrKey2 as string) : '',
      costtime: numberFixed(Date.now() - this.originTime),
      keylinks: this.getKeylinks(),
      msg,
      ...(typeof optionsOrKey2 === 'object' ? optionsOrKey2 : {}),
    };
    const finalItem = this.checkTransportReadyAndBuffer(item);
    this.showDebug &&
      console.log(`${TAG} logInfo, check passed: ${!!finalItem}, msg: `, msg, ', item=', finalItem || item);
    if (finalItem) {
      this.transport.sendLog(finalItem).then(success => this.onAfterTransportSend(finalItem, success));
      finalItem?.msg && this.totalKeylinks.push(finalItem.msg);
    }
    return this;
  }

  /**
   * 全量日志上报
   * @key 全量上报方法
   * @param msg  消息
   * @param key1 一级分类key1字段值
   * @param optionsOrKey2 二级分类key2字段值或者上报options
   */
  public logInfoAll(msg: string, key1?: string, optionsOrKey2: LoggerItemOption | string = {}): LoggerCore {
    if (typeof optionsOrKey2 === 'string') {
      this.logInfo(msg, key1, { logscene: LogScene.fullscene, key2: optionsOrKey2 as string });
    } else {
      this.logInfo(msg, key1, { logscene: LogScene.fullscene, ...(optionsOrKey2 as LoggerItemOption) });
    }
    return this;
  }

  /**
   * 将非实时要求的错误信息打印到链路日志中, 同时通过指令的方式进行聚合上报
   */
  public logErrorToKeylink(errOrMsg: Error | string, key1?: string, cmd: KeylinkKey = KeylinkCmd.LOG_ERROR): string {
    if (!errOrMsg) return 'logErrorToKeylink, errOrMsg is empty';
    return this.addKeylink({ key1, msg: formatAnyVal(errOrMsg) }, cmd);
  }

  /**
   * 上报一个错误
   * @key 全量上报方法
   * @param errOrMsg
   * @param key1 一级分类key1字段值
   * @param optionsOrKey2 二级分类key2字段值或者上报options, 默认值是{}
   */
  public logError(errOrMsg: Error | string, key1?: string, optionsOrKey2: LoggerItemOption | string = {}): LoggerCore {
    const itemTmp = {
      ...this.envInfo,
      logtype: LogType.error,
      key1: key1 || LogType.error || '',
      key2: typeof optionsOrKey2 === 'string' ? (optionsOrKey2 as string) : '',
      msg: formatAnyVal(errOrMsg),
      keylinks: this.getKeylinks(),
      costtime: numberFixed(Date.now() - this.originTime),
      ...(typeof optionsOrKey2 === 'object' ? optionsOrKey2 : {}),
    };
    const item = this.checkTransportReadyAndBuffer(itemTmp);
    this.showError &&
      console.warn(`${TAG} logError, check passed: ${!!item}, err: `, errOrMsg, ', item=', item || itemTmp);
    if (item) {
      this.transport.sendLog(item).then(success => this.onAfterTransportSend(item, success));
      item?.msg && this.totalKeylinks.push(item.msg);
    }
    return this;
  }

  /**
   * 上报自定义测试，两点之间. 该方法调用后会返回一个logEnd函数, 调用logEnd就执行上报
   * @key 非全量上报方法, 只有命中特定用户/特定渠道/特定场景/特定时间才会上报
   */
  public logTime(name: string): (options?: LoggerItemOption) => void {
    const s = Date.now();
    return (options?: LoggerItemOption) => {
      this.logTimeNow(name, Date.now() - s, options);
    };
  }

  /**
   * 时间上报方法
   * @key 非全量上报方法, 只有命中特定用户/特定渠道/特定场景/特定时间才会上报
   */
  public logTimeNow(name: string, costtime: number, options?: LoggerItemOption): LoggerCore {
    const itemTmp = {
      ...this.envInfo,
      logtype: LogType.costtime,
      key1: LogKey.logtime,
      key2: name,
      msg: name,
      keylinks: this.getKeylinks(),
      costtime: costtime ? numberFixed(costtime) : numberFixed(Date.now() - this.originTime),
      ...options,
    };
    const item = this.checkTransportReadyAndBuffer(itemTmp);
    this.showDebug && console.log(`${TAG} logTimeNow, check passed: ${!!item}, item=`, item || itemTmp);
    if (item) {
      this.transport.sendLog(item).then(success => this.onAfterTransportSend(item, success));
    }
    return this;
  }

  /**
   * 时间上报方法
   * @key 全量上报方法
   */
  public logTimeNowAll(name: string, costtime: number, options?: LoggerItemOption): LoggerCore {
    return this.logTimeNow(name, costtime, { logscene: LogScene.fullscene, ...options });
  }

  /**
   * 包装全局的错误, 不同端可以自定义实现
   */
  public wrapGlobError(hostGlobal?: any): void {
    this.showDebug && console.log(`${TAG} wrapGlobError do nothing`);
    if (!hostGlobal) this.showDebug && console.log(`${TAG} Please specify hostGlobal arg!`);
  }

  /**
   * 添加心跳监控钩子, 该钩子会在心跳上报前执行, 同时返回删除方法
   */
  public addHeartbeatListener(listener: HeartbeatListener): () => void {
    if (!this.heartbeatListeners.find(item => item === listener)) {
      this.heartbeatListeners.push(listener);
    }
    return () => {
      this.heartbeatListeners = this.heartbeatListeners.filter(fn => fn !== listener);
    };
  }

  /**
   * 退出前上报链路日志
   */
  public flushKeylinks(): void {
    try {
      const { enable = false } = this.heartbeatOption;
      let flushMsg = '';
      if (this.keylinks.length === 0) {
        this.showDebug && console.log(TAG, 'flushKeylinks, Ignore as keylinks is empty');
        return;
      }
      if (enable) {
        // 有心跳上报
        this.heartbeatListeners.map(fn => fn());
        const currSecond = Math.floor((Date.now() - this.originTime) / 1000);
        const durationSec = Math.floor(this.heartbeatOption.duration / 1000);
        flushMsg = `flush before exit(the-${durationSec}s-heartbeat-in-${currSecond}s), ${
          this.keylinks[this.keylinks.length - 1]
        }`;
      } else {
        // 没有心跳上报
        flushMsg = `flush before exit(heartbeat-disable), ${this.keylinks[this.keylinks.length - 1]}`;
      }
      this.logInfoAll(flushMsg, enable ? LogScene.heartbeat : LogScene.fullscene, {
        logscene: enable ? LogScene.heartbeat : LogScene.fullscene,
        logtype: enable ? LogType.heartbeat : LogType.loginfo,
        key3: 'flushkeylinks',
      });
    } catch (err) {
      this.showError && console.warn(`${TAG} flushKeylinks throw error, `, err);
    }
  }

  /**
   * 判断通道是否ready, 如果ready就返回item, 否则就加入buffer并返回null
   * 所有的上报都会经过这个方法才走入transport.
   * 这里的参数item会被格式化掉
   */
  public checkTransportReadyAndBuffer(item: LoggerItemOption): LoggerItemOption | null {
    item.logscene = this.getLogScene(item);
    // 格式化key1, key2, key3
    if (item.key1) item.key1 = item.key1.replace(/\|/g, '.');
    if (item.key2) item.key2 = item.key2.replace(/\|/g, '.');
    if (item.key3) item.key3 = item.key3.replace(/\|/g, '.');

    // 加上客户端的时间, 方便后续排序
    if (!item.clienttime) item.clienttime = getFormatTime();
    // 在msg的前面带上项目标识, 方便快速区分
    const msgPrefix = `【${this.envInfo.os}】`;
    if (item.msg && !item.msg?.startsWith(msgPrefix)) {
      item.msg = `${msgPrefix} #${this.sendIndex} ${item.msg}`;
    }
    // 记录上报的日志索引
    if (!item.numextinfo1) item.numextinfo1 = this.sendIndex;
    // 记录日志中keylinks的大小
    if (!item.numextinfo2) item.numextinfo2 = item.keylinks?.length || 0;

    // 处理keylinks, 过滤里面的|符号
    if (item.keylinks) item.keylinks = item.keylinks.replace(/\|/gi, '\\|');
    // 自定义的检查钩子
    if (!this.checkReportRule(item)) {
      return null;
    }
    // 通道是否ready
    if (this.transport.isReady()) {
      return item;
    }
    // 最多保存3条
    if (this.itemBuffer.length >= 3) {
      this.itemBuffer.splice(2, this.itemBuffer.length - 2, item);
    } else {
      this.itemBuffer.push(item);
    }
    return null;
  }

  /**
   * 处理通道发送日志之后的事情.
   */
  protected onAfterTransportSend = (item: LoggerItemOption, success: boolean): void => {
    if (success) {
      // 成功则清空链路日志
      this.clearKeylinks();
    } else {
      // 失败则把msg写入链路日志中, 以待下一条发送
      const { msg, clienttime } = item;
      this.addKeylink(
        {
          key1: 'transport-send-failed',
          msg: `${decodeURIComponent(msg || '')} (${clienttime})`,
        },
        KeylinkCmd.LOG_FETCH_ERROR,
      );
    }
    // 每次发送完后都更新次数值
    this.sendIndex += 1;
  };

  /** 链路指令set集合, 用于存放一次上报周期内的指令 */
  protected getKeylinkCmdSet(): Set<KeylinkKey> {
    return this.keylinkCmdSet;
  }

  /**
   * 激活心跳上报任务, 会先清除之前已经存在的任务
   */
  private activeHeartTask = (): void => {
    const { enable = false, duration } = this.heartbeatOption;
    if (!enable) {
      this.showDebug && console.log(`${TAG} activeHeartTask, NOT ENABLE`);
      return;
    }
    try {
      const sendIndexLimited = this.sendIndex >= LoggerCore.MAX_SEND_INDEX;
      if (sendIndexLimited) {
        this.addKeylink(`ticked sendIndexLimit(${this.sendIndex})`, 'logger');
        return;
      }
      this.heartbeatTask && clearTimeout(this.heartbeatTask);
      this.heartbeatTask = setTimeout(this.tickHearbeatReport, duration) as NodeJS.Timeout;
    } catch (err) {
      this.showError && console.warn(`${TAG} activeHeartTask() throw error, `, err);
    }
  };

  /**
   * 触发心跳逻辑
   */
  private tickHearbeatReport = (): void => {
    try {
      this.heartbeatListeners.map(fn => fn());
      const currSecond = Math.floor((Date.now() - this.originTime) / 1000);
      const durationSec = Math.floor(this.heartbeatOption.duration / 1000);
      if (this.keylinks.length) {
        this.logInfoAll(
          `the-${durationSec}s-heartbeat-in-${currSecond}s, ${this.keylinks[this.keylinks.length - 1]}`,
          LogScene.heartbeat,
          {
            logscene: LogScene.heartbeat,
            logtype: LogType.heartbeat,
          },
        );
        // 只有上报一次后, 才将间隔时间延长1/5
        this.heartbeatOption.duration += Math.floor(this.heartbeatOption.duration / 5);
      } else {
        this.showDebug &&
          console.log(
            `${TAG} Ignore heartbeat report as keylinks empty IN (the-${durationSec}s-heartbeat-in-${currSecond}s)`,
          );
      }
      this.activeHeartTask();
    } catch (err) {
      this.showError && console.warn(`${TAG} tickHearbeatReport throw error`, err);
    }
  };

  /**
   * 检查是否通过上报规则, 只有特定用户/渠道/场景/时间及非loginfo的才允许上报
   */
  private checkReportRule(item: LoggerItemOption): boolean {
    if (item.logtype !== LogType.loginfo || (item.logscene && item.logscene !== LogScene.default)) {
      return true;
    }

    const { isSpecialScene } = this.options;
    return isSpecialScene || false;
  }

  /**
   * 根据上报item, 获取logscene
   * todo: 根据需求区分场景
   */
  private getLogScene(item: LoggerItemOption): LogScene {
    if (item.logscene && item.logscene !== LogScene.default) return item.logscene;
    const { isSpecialScene } = this.options;
    if (isSpecialScene) return LogScene.specialscene;
    return LogScene.default;
  }
}
