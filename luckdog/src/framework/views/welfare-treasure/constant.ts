// 福袋状态
export enum TreasureStatus {
  UNKNOWN = 0, // 未知
  ENABLED = 1, // 可以开启福袋
  COOLING = 2, // 冷却时间内，暂不能开启福袋
  DISABLED = 3, // 今日次数耗尽，今日内不能开启福袋
  NOTASK = 4, // 当前用户没有福袋任务
  HIDDEN = 5, // 不展示福袋
}

// 日志前缀
export const LOG_PREFIX = 'welfare-treasure';

// 可展示福袋的状态
export const SHOWABLE_STATUS = [TreasureStatus.ENABLED, TreasureStatus.COOLING];

// 激励弹窗倒计时/秒
export const POWER_COUNTDOWN = 3;
