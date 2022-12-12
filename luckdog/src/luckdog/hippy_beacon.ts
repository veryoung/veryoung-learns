import HippyBeacon from '@tencent/beacon4hippy-react-qb';

let beacon;
const initBeacon = () => new HippyBeacon({
  appkey: 'JS0MAAGJ3MLJ07',  // appKey，从灯塔官网获取,必填; 小说： JS0MAAGJ3MLJ07 ；实时联调： LOGDEBUGKEY00001
  // appkey: 'LOGDEBUGKEY00001', // 仅在开发期间使用，上线务必停用
  isDebug: false,
});

export default (eventName: string, data: Record<string, any>): void => {
  if (!beacon) {
    beacon = initBeacon();
  }
  beacon?.onEvent(eventName, eventName, data);
};
