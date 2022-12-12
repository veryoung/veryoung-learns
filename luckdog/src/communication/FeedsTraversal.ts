import { client } from '@tencent/hippy-rpc';
import { bundleConfig } from '../../package.json';
import { MTT } from '@tencent/luckbox-hippyjce-homepage';
import { BOTTOM_BUSINESS_ID, EXT_PARAMS_MAP } from '../framework/FeedsConst';
import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { getQbUrl, isTopTab, getReaderVersion, getDeviceVisitor, getUserVisitor } from '@/luckbox';

const prx = client.stringToProxy(MTT.HomepageFeedsForClientProxy, 'FeedsHomepage');

/** 阅读器版本 */
let readerVersion = '';

/**
 * 处理响应结果
 */
const handleTraversalResp = (rsp: any, KEY1: string) => {
  if (rsp.code !== 0) {
    addKeylink(KEY1, KeylinkCmd.RPC_RETCODE_SUM);
    return {
      success: false,
      code: rsp.code,
    };
  }
  if (rsp.iRet !== 0) {
    addKeylink(KEY1, KeylinkCmd.RPC_RETCODE_SUM);
    return {
      success: false,
      code: rsp.iRet,
    };
  }
  if (rsp.bUseGzip) {
    addKeylink(KEY1, KeylinkCmd.RPC_ERROR_SUM);
    // 暂时不支持
    return {
      success: false,
      error: 'ReactNative cannot use gzip',
    };
  }
  if (rsp.sData !== '') {
    return {
      success: true,
      content: JSON.parse(rsp.sData),
      mpExtInfo: rsp.mpExtInfo,
    };
  }
  if (rsp.vData && rsp.vData.length > 0) {
    return {
      success: true,
      content: rsp.vData,
      mpExtInfo: rsp.mpExtInfo,
    };
  }
  return {
    success: true,
    content: null,
    mpExtInfo: rsp.mpExtInfo,
  };
};

export default class FeedsTraversal {
  public static async traversal(
    tabId, business, content, globalConf = {} as any, extInfoObj = {},
    forceBusiness = false, appid = 0,
  ) {
    // 跟后台的透传服务接口 mark by uct
    const req = new MTT.HomepageFeedsGetOrReportDataReq();
    const starttime = Date.now();
    const KEY1 = `getOrReportDataByBusinessId${content?.func ? `-${content.func}` : ''}`;
    try {
      if (!globalConf.qbid) {
        globalConf.qbid = getUserVisitor().getQBID();
      }
      if (!readerVersion)  readerVersion = await getReaderVersion();
      const { guid, qua2 } = await getDeviceVisitor().isReady();
      req.iBusiness = isTopTab() || forceBusiness ? business : BOTTOM_BUSINESS_ID;
      req.sContent = JSON.stringify(content) || '';
      req.iAppId = appid || (isTopTab() ? 0 : 138);
      req.iTabId = tabId;
      req.sQBId = globalConf.qbid || '';
      req.sGuid = guid || globalConf.guid || '';
      req.sQua = qua2 || globalConf.qua2 || '';
      req.sRnVersion = bundleConfig.RUA;
      // todo: 将FeedsTraversal和requestItemList固定字段收到一个地方管理
      req.mpExtInfo.readFromObject({
        ...extInfoObj,
        qbUrl: getQbUrl(), // 透传地址到后台,以解析参数
        [EXT_PARAMS_MAP.novelReader]: readerVersion, // 将阅读器版本带给后台
        accountType: `${getUserVisitor().getAccountType()}`,
      });
      let rsp = { code: -1 } as any;
      addKeylink(`send request -> ${KEY1}, req: ${req.sContent}, iTabId=${tabId}`);
      const { response } = await prx.getOrReportDataByBusinessId(req);
      addKeylink(`${KEY1}=${Date.now() - starttime}`, KeylinkCmd.RPC_COSTTIME_AVG);

      if (response.return === 0 && response.arguments && response.arguments.rsp) {
        ({ rsp } = response.arguments);
        rsp.code = 0;
      } else {
        addKeylink(KEY1, KeylinkCmd.RPC_RETCODE_SUM);
        return rsp;
      }
      return handleTraversalResp(rsp, KEY1);
    } catch (e) {
      addKeylink(KEY1, KeylinkCmd.RPC_ERROR_SUM);
      logError(e, 'FeedsTraversal.traversal');
      return {
        success: false,
        error: e,
      };
    }
  }
}
