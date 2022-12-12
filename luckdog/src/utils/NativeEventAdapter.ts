import { logError } from '@/luckdog';

type NativeEventListener = () => void;

/** 终端支持的响应事件 */
export enum NativeEventCode {
  ACTIVE = 'onActive',
  DEACTIVE = 'onDeactive'
}

interface NativeEventListenerMap {
  [extra: string]: NativeEventListener[]
}

class NativeEventAdapter {
  private nativeEventListenersMap: NativeEventListenerMap = {};

  /** 添加终端响应事件 */
  public addNativeEventListener(eventCode: NativeEventCode, listener: NativeEventListener) {
    if (!this.nativeEventListenersMap[eventCode]) {
      this.nativeEventListenersMap[eventCode] = [];
    }
    if (!this.nativeEventListenersMap[eventCode].includes(listener)) {
      this.nativeEventListenersMap[eventCode].push(listener);
    } else {
      logError(`addEventListener repeated, eventCode is ${eventCode}`, 'NativeEventAdapter.addNativeEventListener');
    }
  }

  /** 触发终端响应事件 */
  public emitNativeEventListener(eventCode: NativeEventCode) {
    const eventListener = this.nativeEventListenersMap[eventCode];
    eventListener?.length && eventListener.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        logError(e, 'NativeEventAdapter.emitNativeEventListener');
      }
    });
  }

  /** 移除终端响应监听 */
  public removeNativeEventListener(eventCode: NativeEventCode) {
    switch (eventCode) {
      case NativeEventCode.ACTIVE:
        this.nativeEventListenersMap[eventCode] = [];
        break;
      default:
        break;
    }
  }
}

let adapter: NativeEventAdapter;

export const getNativeEventAdapter = () => {
  if (adapter) return adapter;
  adapter = new NativeEventAdapter();
  return adapter;
};

/** 页面激活事件 */
export const activeEventObserver = {
  addEventObserver: listener => getNativeEventAdapter().addNativeEventListener(NativeEventCode.ACTIVE, listener),
  emitEvent: () => getNativeEventAdapter().emitNativeEventListener(NativeEventCode.ACTIVE),
  removeEventObserver: () => getNativeEventAdapter().removeNativeEventListener(NativeEventCode.ACTIVE),
};

export const deActiveEventObserver =  {
  addEventObserver: listener => getNativeEventAdapter().addNativeEventListener(NativeEventCode.DEACTIVE, listener),
  emitEvent: () => getNativeEventAdapter().emitNativeEventListener(NativeEventCode.DEACTIVE),
  removeEventObserver: () => getNativeEventAdapter().removeNativeEventListener(NativeEventCode.DEACTIVE),
};
