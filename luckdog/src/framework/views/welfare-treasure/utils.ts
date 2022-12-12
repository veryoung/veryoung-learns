import { getAccountInfo, showLoginPanel, checkLogin as $checkLogin } from '@/framework/utils/user';
import { getUserVisitor } from '@/luckbox';
import { logError } from '@/luckdog';

import { LOG_PREFIX } from './constant';

type ISetCountdown = (
  remainTime: number,
  callback: (remainTime: number) => void
) => void;

const step = 1000;

/**
 * 登录
 */
export const checkLogin = async (forceUpdate = false) => {
  // 神奇操作，查证登录态之前必须先调用 getAccountInfo 接口
  if (forceUpdate) {
    await getAccountInfo(true);
  }

  return $checkLogin();
};

/**
 * 登录
 */
export const doLogin = async () => {
  try {
    const { result = 0 } = await showLoginPanel();

    if (result === 1) {
      const accountInfo = await getAccountInfo(true); // 更新账户信息
      // [TODO]
      getUserVisitor().updateUserInfo(accountInfo as any);
      return true;
    }
  } catch (err) {
    logError(err, `${LOG_PREFIX}-doLogin`);
  }

  return false;
};

/**
 * 刷新 token
 */
export const refreshToken = async () => {
  const accountInfo = await getUserVisitor().refreshToken();
  getUserVisitor().updateUserInfo(accountInfo);
};

/**
 * 时间戳取整到天
 * @param ts
 * @returns
 */
export const parseTimestamp = (ts: number) => {
  const date = new Date(ts);

  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);

  return date.getTime();
};

/**
 * 判断两个时间是否同一天
 * @param timestamp
 */
export const isSameDay = (t1: number, t2: number) => {
  const d1 = parseTimestamp(t1 * 1000);
  const d2 = parseTimestamp(t2 * 1000);

  return d1 === d2;
};

/**
 * 防冒泡事件包装
 */
export const callbackWrap = (callback: () => any) => () => {
  callback();
  return true;
};

/**
 * 创建倒计时
 */
class Countdown {
  private timer: any = null;

  // 清除倒计时
  public clear = () => {
    clearInterval(this.timer);
  };

  // 设置倒计时
  public set: ISetCountdown = (
    remainTime: number,
    callback: (remainTime: number) => void,
  ) => {
    let time = remainTime;
    this.timer = setInterval(() => {
      time -= 1;
      callback(time);
    }, step);
  };
}

let countdownInstance: Countdown;
export const getCountdown = (): Countdown => {
  if (!countdownInstance) {
    countdownInstance = new Countdown();
  }
  return countdownInstance;
};
