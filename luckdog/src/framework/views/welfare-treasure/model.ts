import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { showToast } from '@/luckbox';
import { doFetch } from '@/luckbox/fetch';

import { LOG_PREFIX, TreasureStatus, POWER_COUNTDOWN } from './constant';
import { TreasureContext, TreasureState, TreasureChestStatus, GetTreasureChestReply, OpenTreasureChestReply, ReceiveVideoAdRewardReply } from './types';
import { isSameDay, refreshToken, getCountdown } from './utils';
import reporter from './reporter';

const TAG = `${LOG_PREFIX}-model`;

// token 刷新标记位
let isTokenRefreshed = false;

// 获取 tprc 错误码
const getTrpcErrorCode = (result) => {
  const header = result?.headers?.['Trpc-Func-Ret'] || result?.headers?.['trpc-func-ret'];
  const value = Array.isArray(header) ? header[0] : header;
  return value || '';
};

/**
 * token 尝试刷新
 */
const tryToRefreshToken = async () => {
  // 尝试刷新一次 token 再重新执行
  if (!isTokenRefreshed) {
    isTokenRefreshed = true;
    await refreshToken();
    return true;
  }

  return false;
};

/**
 * 查询用户的福袋状态
 */
export const fetchTreasureStatus = async (context: TreasureContext, isLogin = true): Promise<TreasureStatus> => {
  const { error, result } = await doFetch<GetTreasureChestReply>(
    '/trpc.pcg_novel.welfare_incentives.WelfareIncentives/GetTreasureChest',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: 1 }),
    },
  );

  if (result?.body?.ret_code === 0) {
    const status = resolveTreasureStatus(context, result.body);

    // floating 曝光上报
    reporter.reportFloatingExposure({
      statusType: reporter.getStatusType(status, isLogin),
    });

    return status;
  }

  if (!result) {
    // 链路错误，如网络异常
    logError(`fetch status failed [1]: ${error}`, TAG);
  } else if (!result.body) {
    // 服务错误，如鉴权失败
    const errcode = getTrpcErrorCode(result);

    // 默认当 token 过期处理，尝试刷新一次 token
    const isRefreshed = await tryToRefreshToken();
    if (isRefreshed) return fetchTreasureStatus(context);

    logError(`fetch status failed [2]: ${errcode || -1}`, TAG);
  } else {
    // 业务错误，如参数有误
    logError(`fetch status failed [3]: ${result.body.ret_code || -999}`, TAG);
  }


  return TreasureStatus.UNKNOWN;
};

/**
 * 处理用户福袋状态查询结果
 */
const resolveTreasureStatus = (
  { setState }: TreasureContext,
  data: { status: TreasureChestStatus },
): TreasureStatus => {
  const { status } = data;
  const {
    can_open: canOpen,
    total_times: totalTimes,
    completed_times: completedTimes,
    svr_ts: svrTs,
    next_ts: nextTs,
  } = status;
  const { UNKNOWN, ENABLED, COOLING, DISABLED, NOTASK } = TreasureStatus;

  let state: Partial<TreasureState> = {
    isUnfreeze: false,
  };

  if (canOpen) {
    // 可以开启福袋
    state = { ...state, status: ENABLED };
  } else if (totalTimes === 0) {
    // 用户没有福袋任务
    state = { ...state, status: NOTASK };
  } else if (totalTimes === completedTimes) {
    // 已完成次数等于总次数，表示任务全部完成
    state = { ...state, status: DISABLED };
  } else if (nextTs > 0) {
    // 冷却中
    const isTomorrow = !isSameDay(svrTs, svrTs + nextTs);

    // 临界：冷却时间超过当天最晚时间，任务不可完成
    if (isTomorrow) {
      state = { ...state, status: DISABLED };
    } else {
      state = { ...state, status: COOLING, coolingTime: nextTs };
    }
  }

  addKeylink(`福袋状态: ${JSON.stringify({ status })}`, TAG);
  addKeylink(`welfare-floating-status=${TreasureStatus?.[state.status || '']}`, KeylinkCmd.PR_INFO_SUM);

  setState(state);

  return state.status || UNKNOWN;
};

/**
 * 开启福袋
 */
export const openTreasure = async (context: TreasureContext) => {
  const { error, result } = await doFetch<OpenTreasureChestReply>(
    '/trpc.pcg_novel.welfare_incentives.WelfareIncentivesHTTP/OpenTreasureChest',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: 1 }),
    },
  );

  if (result?.body?.ret_code === 0) {
    // 数据正常
    return resolveOpenTreasure(context, result.body);
  }

  if (!result) {
    // 链路错误，如网络异常
    logError(`open treasure failed [1]: ${error}`, TAG);
  } else if (!result.body) {
    // 服务错误，如鉴权失败
    const errcode = getTrpcErrorCode(result);

    // 默认当 token 过期处理，尝试刷新一次 token
    const isRefreshed = await tryToRefreshToken();
    if (isRefreshed) return openTreasure(context);

    logError(`open treasure failed [2]: ${errcode || -1}`, TAG);
  } else {
    // 业务错误，如参数有误
    logError(`open treasure failed [3]: ${result.body.ret_code || -999}`, TAG);
  }

  showToast('活动太火爆了，请稍后再试');
};

/**
 * 处理用户福袋开启结果
 */
const resolveOpenTreasure = (context: TreasureContext, data: OpenTreasureChestReply) => {
  const { setState } = context;
  const { result, show_video_ad: isShowVideoAd, video_ad_max_gold: videoAdMax } = data;

  // 展示弹窗
  setState({
    isWeakModalShow: true,
    rewardNum: result.reward_num,
    powerRewardMax: (isShowVideoAd && videoAdMax) || 0,
  });
  // 弹窗曝光上报
  reporter.reportWeakModalExposure();

  // 更新挂件状态
  resolveTreasureStatus(context, data);
};

/**
 * 领取激励视频奖励
 */
export const receiveVideoAdReward = async (context: TreasureContext) => {
  const { error, result } = await doFetch<ReceiveVideoAdRewardReply>(
    '/trpc.pcg_novel.welfare_incentives.WelfareIncentivesHTTP/ReceiveVideoAdReward',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ business_id: 314 }),
    },
  );

  if (result?.body?.ret_code === 0) {
    // 数据正常
    return resolveReceiveVideoAdReward(context, result.body);
  }

  if (!result) {
    // 链路错误，如网络异常
    logError(`receive video ad award failed [1]: ${error}`, TAG);
  } else if (!result.body) {
    // 服务错误，如鉴权失败
    const errcode = getTrpcErrorCode(result);

    // 默认当 token 过期处理，尝试刷新一次 token
    const isRefreshed = await tryToRefreshToken();
    if (isRefreshed) return receiveVideoAdReward(context);

    logError(`receive video ad award failed [2]: ${errcode || -1}`, TAG);
  } else {
    // 业务错误，如参数有误
    logError(`receive video ad award failed [3]: ${result.body.ret_code || -999}`, TAG);
  }

  showToast('活动太火爆了，请稍后再试');
};

/**
 * 处理用户福袋开启结果
 */
const resolveReceiveVideoAdReward = (context: TreasureContext, data: ReceiveVideoAdRewardReply) => {
  const { setState } = context;
  const { reward_num: rewardNum } = data;

  // 展示弹窗
  setState({
    isPowerModalShow: true,
    powerRewardNum: rewardNum,
    powerModalCountdown: POWER_COUNTDOWN,
  });

  // 开启关闭倒计时
  getCountdown().set(POWER_COUNTDOWN, (remainTime: number) => {
    let state: Partial<TreasureState> = {
      powerModalCountdown: remainTime,
    };

    if (remainTime === 0) {
      state = {
        ...state,
        isPowerModalShow: false,
      };
      // 清除倒计时
      getCountdown().clear();
    }

    setState(state);
  });

  // 弹窗曝光上报
  reporter.reportPowerModalExposure();
};
