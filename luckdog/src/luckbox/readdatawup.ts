import { ReadDataProxy } from '@tencent/luckbox-readdata-feedswup';
import { addKeylink, createSpanId, getJSVersion, getTraceId, logError } from '@/luckdog';
import { getUserVisitor } from './native-adapter';
import { isLocationReady, getQbUrl, isTopTab } from './location';
import { ABTBizId } from '.';
import { formatCookieLikeKV } from './base';
import { getReaderVersionSync } from './crossappvars';
import { isFSRendered } from '@/presenters';
import { FeedsFSResp, DEF_FEEDS_FIRSTSCREEN_RESP, TabType } from '../entity';

/** 小说频道tabid */
const NOVEL_TABID = '22';

let readDataProxy: ReadDataProxy;

/** 构造WUP请求的extinfo */
const makeWupExtInfo = (param?: { lucktraceid?: string; }) => formatCookieLikeKV({
  jsversion: getJSVersion(),
  readerVersion: getReaderVersionSync(),
  // 给readdata所有的请求都加上lucktraceid和luckspanid参数
  lucktraceid: param?.lucktraceid ? param.lucktraceid : getTraceId(),
  luckspanid: createSpanId(),
  isFSRendered: isFSRendered() ? '1' : '0',
});

/**
 * 获取ReadData接入层的代理对象
 */
export const getReadDataProxy = (): ReadDataProxy => {
  if (readDataProxy) return readDataProxy;

  readDataProxy = new ReadDataProxy({
    isDebug: false,
    stUserPromise: getUserVisitor().isStUserReady() as any,
    logError: logError as any,
    getQBUrl: () => isLocationReady().then(() => getQbUrl()),
    wupCookies: Promise.resolve(''), // TOOD: 后续考虑把cookie存储到本地, 异步读写
  });
  return readDataProxy;
};

/**
 * 获取首屏接口数据
 */
export const getFeedsFirstScreenData = async (): Promise<FeedsFSResp> => {
  try {
    const resp = await getReadDataProxy().GetFeedsFirstScreenData({
      tabid: NOVEL_TABID,
      abtBizId: ABTBizId.NOVEL_TAB,
      tabType: isTopTab() ? TabType.TopTab : TabType.BottomTab,
    }, makeWupExtInfo());
    addKeylink('getFeedsFirstScreenData resp success', 'readdatawup');
    return resp.jsonRes as FeedsFSResp;
  } catch (error) {
    logError(error, 'readdatawup.getFeedsFirstScreenData');
    return DEF_FEEDS_FIRSTSCREEN_RESP;
  }
};

/** 收藏书籍 */
export const collectBook = async (resourceId: string): Promise<number> => {
  try {
    const resp = await getReadDataProxy().CollectBook({
      resourceId,
    }, makeWupExtInfo());
    const { code, msg } = resp.jsonRes;
    if (Number(code) !== 0) {
      logError(`msg=${msg}, code=${code}`, 'readdatawup.collectBook');
    }
    return Number(code);
  } catch (error) {
    logError(error, 'readdatawup.collectBook');
    return -1;
  }
};
