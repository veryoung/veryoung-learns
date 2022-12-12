import { Hippy, QBDeviceEventEmitter } from '@tencent/hippy-react-qb';
import FeedsHomePage from './src/framework/tab/FeedsHomePage';
import { COMPONENT } from './src/framework/FeedsConst';
import { polyfill } from '@tencent/luckbox-basehp-common';
import { addKeylink, KeylinkCmd, logError, setEnvInfo, reportBeacon, TechKey, getJSVersion } from '@/luckdog';
import { setQbUrl, getQbUrl, getDeviceVisitor } from '@/luckbox';

(global as any).enterTime = Date.now();
(global as any).timerOfDoBeaconByEnterOver3s = setTimeout(() => {
  addKeylink('renderTimeOver3s', KeylinkCmd.FS_TIMEOUT_SUM);
  reportBeacon(TechKey.EXPOSE__FIRST_SCREEN_RENDER_OVERTIME_THREE);
}, 3000);
(global as any).Hippy.on('uncaughtException', (...args) => {
  logError(args[0], 'index_uncaughtException');
});
const handleLifecycleChanged = (res) => {
  const url = res.tabUrl || res.url || '';
  addKeylink(`previus qbUrl=${getQbUrl()}, qbUrl=${url}`, 'handleLifecycleChanged');
  url && setQbUrl(url);
};
// calliframe事件
QBDeviceEventEmitter.addListener('@hp:loadInstance', handleLifecycleChanged);
const hippy = new Hippy({
  appName: COMPONENT,
  entryPage: FeedsHomePage,
  silent: true,
});
hippy.regist();
getDeviceVisitor().isReady()
  .then(({ guid, qua2 }) => setEnvInfo({ guid, qua: qua2 }))
  .catch(err => logError(err, 'index.getDeviceVisitor'));
polyfill();

addKeylink(`jsversion--${getJSVersion()}`, KeylinkCmd.PR_INFO_SUM);
