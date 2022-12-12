
import { trpc } from '@tencent/tpro_pcgnovel_common_portal';
import { isGuidEmpty } from '../framework/Utils';
import { FeedAppID, Request, RequestType, TabID } from '../framework/protocol';
import { getQbUrl, isTopTab, getDeviceVisitor, getUserVisitor } from '@/luckbox';
import { addKeylink, KeylinkCmd, logError, logErrorToKeylink } from '@/luckdog';
import FeedsConst from '../framework/FeedsConst';
import { pbSend } from './qb-pbsender';
import { ErrorCode, TabListRequestParam, UpdatePageNumScene } from './types';
import { getTabCardPageNumMap, getTabPageNum, increaseTabCardPageNum, updateTabPageNum } from './utils';

const { InvokeAPIReq, InvokeAPIRsp, SerializationData, NovelUserInfo } = trpc.pcgnovel.common;

/** 请求地址 */
const options = {
  serviceName: 'trpc.pcgnovel.novelfeedserver.WUPPortal',
  funcName: '/trpc.pcgnovel.common.Portal/invokeAPI',
};

const sendPBRequest = async (apiName: string, request: Request): Promise<{
  code: number;
  data: Record<string, any>;
}> => {
  const apiKey = `${apiName}_${request.requestType}`;
  // 实力话请求体 返回体 请求内容
  const globalConf = FeedsConst.getGlobalConf();
  const user = new NovelUserInfo({
    GUID: globalConf.guid,
    QUA: globalConf.qua2,
  });
  try {
    const [userInfo, guid] = await Promise.all([
      getUserVisitor().isUserReady(),
      isGuidEmpty(globalConf.guid) ? getDeviceVisitor().isReady()
        .then(({ guid }) => guid) : globalConf.guid,
    ]);
    user.GUID = guid;
    user.QBID = userInfo.qbid;
  } catch (err) {
    logErrorToKeylink(err, `${apiKey}-catch-deviceuser`);
  }

  const req = new InvokeAPIReq({
    APIName: apiName, // 方法名
    Header: {},
    Body: new SerializationData({
      Data: new (Buffer.from as any)(JSON.stringify(request)),
      Type: 1,
    }),
    User: user,
    Referer: getQbUrl(),
  });
  const starttime = Date.now();
  let res;
  try {
    res = await pbSend(options, req, new InvokeAPIRsp());
    addKeylink(`${apiKey}=${Date.now() - starttime}`, KeylinkCmd.RPC_COSTTIME_AVG);
  } catch (err) {
    addKeylink(`${apiKey}=${Date.now() - starttime}`, KeylinkCmd.RPC_COSTTIME_AVG);
    logErrorToKeylink(err, `${apiKey}-catch-pbsend`, KeylinkCmd.LOG_RPC_ERROR);
  }
  if (!res) return { code: ErrorCode.RESPONSE_ERROR, data: {} };

  const { code } = res;
  if (code !== 0) {
    addKeylink(`${apiKey}-errcode-${code}`, KeylinkCmd.RPC_RETCODE_SUM);
    return { code, data: {} };
  }

  // 反序列化一次回包
  const data: Uint8Array = res.data?.Body?.Data;
  if (!data) {
    addKeylink(`${apiKey}-data-null`, KeylinkCmd.RPC_ERROR_SUM);
    return { code: ErrorCode.BODY_DATA_ERROR, data: {} };
  }

  try {
    const result = JSON.parse(Buffer.from(data).toString('utf-8'));
    return { code: 0, data: result };
  } catch (err) {
    logErrorToKeylink(err, `${apiKey}-catch-parsedata`, KeylinkCmd.LOG_RPC_ERROR);
    return { code: ErrorCode.EXCEPTION_ERROR, data: {} };
  }
};

/**
 * 请求feeds新协议接口, 支持刷新、加载下一刷、布局刷新卡片等场景
 * 布局刷新注意传: cardKey、itemIdMap、cardKeyPageNum
 */
export const requestTabListData = async (params: TabListRequestParam): Promise<{
  code: number;
  success: boolean;
  count: number;
  data: Record<string, any>;
  error?: Record<string, any>;
}> => {
  try {
    const {
      tabId,
      requestType,
      cardKey = [],
      itemIdMap = {},
    } = params;
    const request = new Request();
    request.feedAppID = isTopTab() ? FeedAppID.TOP : FeedAppID.BOTTOM;
    request.tabID = `${tabId}` as TabID;
    request.pageNum = requestType === RequestType.SPECIFIED_CARD ? 1 : getTabPageNum(tabId, requestType);
    request.requestType = requestType;
    request.cardKey = cardKey;
    request.extInfo = {
      itemIdMap,
      cardKeyPageNum: await getTabCardPageNumMap(tabId),
    };
    const result = await sendPBRequest('getFeedTabPage', request);
    const { code, data } = result;

    if (code === 0) {
      // 后台返回pageNum会在前端的基础上加1返回
      requestType !== RequestType.SPECIFIED_CARD && updateTabPageNum(tabId, data.pageNum, UpdatePageNumScene.SERVER);
      // 有需要更新pageNum的卡片，更新pageNum
      await increaseTabCardPageNum(tabId, data.cards);
      return {
        code: 0,
        success: true,
        count: data.cards.length,
        data,
      };
    }
    return {
      code,
      success: false,
      count: 0,
      data: {},
    };
  } catch (err) {
    logError(err, 'service.requestTabListData');
    return {
      code: ErrorCode.REQUEST_ERROR,
      success: false,
      count: 0,
      data: {},
      error: err,
    };
  }
};
