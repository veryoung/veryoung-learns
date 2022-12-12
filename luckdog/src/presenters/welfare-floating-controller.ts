import { OpInfoType, TabId } from '@/entity';
import { getDeviceVisitor, isTopTab } from '@/luckbox';
import { welfarePendantRule } from './expert-controller';

export const WEAK_EXCLUDE_POPTYPES = [
  OpInfoType.NEWUSER_RED_PACK,
  OpInfoType.OP_HALF_POP,
  OpInfoType.OP_HALF_WEBVIEW,
  OpInfoType.FULL_SCREEN_POP,
];

export const STRONG_EXCLUDE_POPTYPES = [
  ...WEAK_EXCLUDE_POPTYPES,
  OpInfoType.BTM_OP_INFO,
];

export enum WelfarePendantShowType {
  /** 展示 */
  SHOW = 'SHOW',
  /** 吸边 */
  ASIDE = 'ASIDE',
  /** 隐藏 */
  HIDDEN = 'HIDDEN',
}

/** 激励视频广告要求QB版本大于11.5.0 */
const minVersion = 1150;
export const isQBVersionValidForAd = () => getDeviceVisitor().getQbVersionNum() >= minVersion;

/** 获取福袋展示类型 */
export const getWelfarePendantShowType = (curTabId: TabId, popType: OpInfoType | undefined): WelfarePendantShowType => {
  // 非推荐tab不展示福袋
  if (curTabId !== TabId.BOTTOM_RECOMM1 || isTopTab()) return WelfarePendantShowType.HIDDEN;

  // 无弹窗时可展示福袋
  if (!popType) return WelfarePendantShowType.SHOW;

  // 命中强退避原则
  if (welfarePendantRule.strong() && STRONG_EXCLUDE_POPTYPES.includes(popType)) {
    return WelfarePendantShowType.ASIDE;
  }

  // 命中弱退避原则
  if (welfarePendantRule.weak() && WEAK_EXCLUDE_POPTYPES.includes(popType)) {
    return WelfarePendantShowType.ASIDE;
  }

  return WelfarePendantShowType.SHOW;
};
