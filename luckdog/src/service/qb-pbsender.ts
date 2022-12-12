import { callNativeWithPromise } from '@tencent/hippy-react';
import * as base64 from 'base64-js';
import { logError } from '@/luckdog';
import { ErrorCode } from './types';

export const pbSend = async (options, req, rsp) => {
  let base64data = '';
  try {
    if (req && typeof req.constructor === 'function') {
      const ReqStruct = req.constructor;
      if (ReqStruct.encode) {
        const writer = ReqStruct.encode(req);
        const view = writer.finish();
        base64data = base64.fromByteArray(view);
      }
    }

    const requestData = {
      ...options,
      base64data,
    };

    const result = await callNativeWithPromise('QBWupModule', 'pbSend', requestData);

    if (result.code === 0 && rsp && typeof rsp.constructor === 'function') {
      const buffer = base64.toByteArray(result.body);
      const RspStruct = rsp.constructor;
      if (RspStruct.decode) {
        rsp = RspStruct.decode(buffer);
      }
    }

    return {
      code: result.code,
      data: rsp, // 解包失败时,返回默认值
    };
  } catch (e) {
    logError(e, 'qb-pbsender.pbsend');
    return {
      code: ErrorCode.PBSENDE_ERROR,
      data: rsp, // 解包失败时,返回默认值
    };
  }
};

