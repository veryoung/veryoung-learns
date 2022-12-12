import { callNativeWithPromise } from '@tencent/hippy-react';

interface readFileParams {
  businessName: string;
  subFilePath: string;
}

interface writeFileParams {
  businessName: string;
  subFilePath: string;
  isAppend: boolean;
  data: string;
}

const QBFileOPModule = {
  deleteFile(params: readFileParams) {
    return callNativeWithPromise('QBFileOPModule', 'deleteFile', params);
  },
  readFile(params: readFileParams) {
    return callNativeWithPromise('QBFileOPModule', 'readFileByString', params);
  },
  isFileExist(params: readFileParams) {
    return callNativeWithPromise('QBFileOPModule', 'isFileExist', params);
  },
  mkdir(params: readFileParams) {
    return callNativeWithPromise('QBFileOPModule', 'mkdir', params);
  },
  writeFile(params: writeFileParams) {
    return callNativeWithPromise('QBFileOPModule', 'writeFileByString', params);
  },
  getFileList(params: readFileParams) {
    return callNativeWithPromise('QBFileOPModule', 'fetchFileList', params);
  },
};

export default QBFileOPModule;
