import { logError, addKeylink, KeylinkCmd } from './logger';
import { UDSHippy, UDSHippyTransport, UDSEvent } from '@tencent/luckdog-uds-hippysdk';
import FeedsConst from '../framework/FeedsConst';
import { reportOnActiveEventKeys } from '.';

// 记录到luckdog中的uds事件字段
const loggerEventKeys: string[] = ['act', 'page_module', 'event_module', 'last_action', 'traceid', 'reqid'];

// 过滤出logger需要的UDS字段
const filterUDSEvent = (event: Partial<UDSEvent>) => loggerEventKeys.reduce((acc: Record<string, any>, key: any) => {
  if ((event as any)[key] !== undefined && (event as any)[key] !== '') {
    acc[key] = (event as any)[key];
  }
  return acc;
}, { });


/** 兼容旧灯塔的上报数据 */
export interface FeedsUDSEvent extends Partial<UDSEvent> {
  /** 传给终端灯塔的事件名 */
  eventName: string;
  /** 书籍的序号 */
  rank?: number;
  /** 旧灯塔用到的平台类型 */
  novel_platfrom: string;
  /** 旧灯塔用到的 Hippy 版本号 */
  rn_version: number;
}

let UDSHippyInstance: UDSHippy;

const getUDSHippy = (): UDSHippy => {
  if (!UDSHippyInstance) {
    UDSHippyInstance = new UDSHippy({
      showDebug: false,
      showError: false,
      transport: new UDSHippyTransport(),
      eventExtGetters: {},
      logError,
      beforeReport: (event) => {
        const eventKey = Number(event?.last_action) as any;
        if (!FeedsConst.getGlobalConfKV('initActive') && reportOnActiveEventKeys.includes(eventKey)) {
          return false;
        }
        return true;
      },
    });
  }
  return UDSHippyInstance;
};

/** UDS 事件上报方法 */
export const sendEvent: UDSHippy['sendEvent'] = (eventCode, eventModule, event) => {
  if (event.act !== 'read_duration') {
    addKeylink(JSON.stringify(filterUDSEvent(event)), KeylinkCmd.UDS_REPORT);
  }
  return getUDSHippy().sendEvent(eventCode, eventModule, event);
};
