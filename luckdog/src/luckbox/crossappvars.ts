import { CrossAppVarsVisitor, CrossAppVars } from '@tencent/luckbox-hippy-crossappvars';

import { bundleConfig } from '../../package.json';
import { logError } from '@/luckdog';

const TAB_VERSION = `${bundleConfig.VC}`;

let visitor: CrossAppVarsVisitor;

const getVisitor = () => {
  if (visitor) return visitor;
  visitor = new CrossAppVarsVisitor({
    logError,
  });
  visitor.isReady().then(() => visitor.setItem('tabVersion', TAB_VERSION));

  return visitor;
};

/**
 * 跨应用变量加载是否完成
 */
export const isLoadReady = (): Promise<CrossAppVars> => getVisitor().isReady();

/**
 * 获取阅读器版本号
*/
export const getReaderVersion = (): Promise<string> => isLoadReady()
  .then(() => getVisitor().getReaderVersion());

/** 同步获取阅读器版本号, 可能为空 */
export const getReaderVersionSync = () => getVisitor().getReaderVersion();

/**
 * 获取频道版本号
 */
export const getTabVersion = (): string => TAB_VERSION;
