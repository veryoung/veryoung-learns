import { QBToastModule } from '@tencent/hippy-react-qb';
import FeedsTraversal from '../../communication/FeedsTraversal';
import FeedsEventEmitter from '../FeedsEventEmitter';
import { addKeylink, logError } from '@/luckdog';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { USER_QBID } from '../FeedsConst';

const TAG = 'doMergeBooks';
const doMergeBooks = async (globalConf, symbolKey, qbid) => {
  try {
    // 1. 获取上一次存下来的用户信息,并且保存本次用户信息
    const previousId = await readSharedSettings(USER_QBID) || '';
    addKeylink(`sharedSettings中的qbid为：${previousId}，当前qbid为：${qbid}`, TAG);

    // 2. 判断用户信息是否是由空到有 如果上一次有用户信息且 是不需要合并书的
    if (previousId !== '' && previousId === qbid) return;

    // 3. 发送需要合并书籍的请求，如果成功，就触发局部刷新
    FeedsTraversal.traversal(globalConf.curTabId, 2, {
      func: 'doMergeBooks',
    }, globalConf, {}, true).then((res) => {
      if ((res as any).success) {
        const { msg } = (res as any).content;
        addKeylink(`书籍合并请求调用成功，返回的content：${JSON.stringify(res?.content)}`, TAG);
        msg && QBToastModule.show(msg, '', 2500);
        writeSharedSettings(USER_QBID, qbid);
        FeedsEventEmitter.sendEventToList(symbolKey, (FeedsEventEmitter as any).event.refresh, {});
      }
    });
  } catch (e) {
    logError(e, 'doMergeBooks.doMergeBooks');
  }
};
export default doMergeBooks;
