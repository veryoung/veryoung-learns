import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';

import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import { showToast, throttle, getNovelAdSdk } from '@/luckbox';
import { useToast } from '@/components/toast';

import { Floating, WeakModal, PowerModal } from './components';
import { fetchTreasureStatus, openTreasure, receiveVideoAdReward } from './model';
import { LOG_PREFIX, TreasureStatus } from './constant';
import { TreasureContext, TreasureProps, TreasureState } from './types';
import { checkLogin, doLogin, getCountdown } from './utils';
import reporter from './reporter';

const TAG = `${LOG_PREFIX}-index`;
const duration = 800;

// 初始状态
const initialState: TreasureState = {
  status: TreasureStatus.UNKNOWN,
  coolingTime: 0,
  isUnfreeze: false,
  isWeakModalShow: false,
  rewardNum: 0,
  powerRewardMax: 0,
  isPowerModalShow: false,
  powerRewardNum: 0,
  powerModalCountdown: 0,
};

/**
 * 支持增量设置的 setState
 */
const createSetState = (setState: Dispatch<SetStateAction<TreasureState>>) => (payload: Partial<TreasureState>) => {
  setState(prevState => ({ ...prevState, ...payload }));
};

/**
 * floating 点击
 */
const onFloatingClick = throttle(async (context: TreasureContext) => {
  const { state, showToast } = context;
  const { status } = state;
  const isLogin = await checkLogin(true);

  addKeylink(`on floating click: ${JSON.stringify({ status: TreasureStatus[status], isLogin })}`, TAG);

  // floating 点击上报
  reporter.reportFloatingClick({
    statusType: reporter.getStatusType(status, isLogin),
  });

  // 冷却中
  if (status === TreasureStatus.COOLING) {
    showToast('等倒计时结束再领金币吧');
    // floating toast 曝光上报
    reporter.reportToastExposure();
    return;
  }

  // 今日份任务已完成
  if (status === TreasureStatus.DISABLED) {
    showToast('明日再来继续领金币吧');
    // floating toast 曝光上报
    reporter.reportToastExposure();
    return;
  }

  // 未登录：先执行登录
  if (!isLogin) {
    const isLogin = await doLogin();
    if (!isLogin) return;
  }

  // 开启福袋
  openTreasure(context);
}, duration);

/**
 * floating 关闭
 */
const onFloatingClose = ({ setState }: TreasureContext) => {
  setState({
    status: TreasureStatus.HIDDEN,
  });
};

/**
 * 福袋弹窗点击
 */
const onWeakModalClick = throttle(async (context: TreasureContext, isConfirm: boolean) => {
  const { state: { powerRewardMax }, setState } = context;

  if (!isConfirm) {
    // 点击关闭
    reporter.reportWeakModalClick({ elementName: 'close' });

    return setState({
      isWeakModalShow: false,
    });
  }

  if (powerRewardMax) {
    // 去看激励视频
    reporter.reportWeakModalClick({ elementName: 'watch_vedio_for_money' });
    addKeylink('welfare-watch-videoad', KeylinkCmd.PR_INFO_SUM);

    // 异步返回广告视频获取结果
    const ad = await getNovelAdSdk().showWelfareAd((
      isEnd: boolean,
      bundle: Record<string, any>,
      adData: Record<string, any>,
    ) => {
      if (bundle?.data === 'onError' || !isEnd) {
        logError(`福利广告视频加载错误，err：${JSON.stringify(bundle)}，isEnd：${isEnd}, adData: ${JSON.stringify(adData)}`, TAG);
        addKeylink('welfare-watch-videoad-error', KeylinkCmd.PR_ERROR_SUM);
        return showToast('活动太火爆了，请稍后再试');
      }

      if (isEnd) receiveVideoAdReward(context);
    });

    if (ad) {
      return setState({
        isWeakModalShow: false,
      });
    }

    // 为空则说明没有成功拿到广告视频
    return showToast('活动太火爆了，请稍后再试');
  }

  // 按钮「稍后再来」
  reporter.reportWeakModalClick({ elementName: 'continue' });
}, duration);

/**
 * 激励视频弹窗点击
 */
const onPowerModalClick = throttle((context: TreasureContext, isConfirm: boolean) => {
  const { setState } = context;

  setState({
    isPowerModalShow: false,
  });

  // 上报
  reporter.reportPowerModalClick({ elementName: isConfirm ? 'continue' : 'close' });

  // 清除关闭倒计时
  getCountdown().clear();
}, duration);

/**
 * 组件初始化
 */
const init = async (context: TreasureContext) => {
  const isLogin = await checkLogin(true);
  fetchTreasureStatus(context, isLogin);
};

/**
 * 视频广告监听事件注册
 */
const useAmsListener = () => {
  useEffect(() => {
    const listener = getNovelAdSdk().addAmsAdListener();

    return () => {
      getNovelAdSdk().removeAmsAdListener(listener);
    };
  }, []);
};

/**
 * floating 展示状态变更上报
 */
const useFloatingListener = (context: TreasureContext) => {
  const { props, state } = context;

  useEffect(() => {
    addKeylink(`floating show change: ${JSON.stringify({
      status: TreasureStatus[state.status],
      showType: props.showType,
    })}`, TAG);
  }, [props.showType, state.status]);
};

export default function treasure(props: TreasureProps) {
  const [state, setState] = useState(initialState);
  const [Toast, showToast] = useToast();
  const setPartialState = createSetState(setState);

  // 组件上下文
  const context: TreasureContext = {
    props,
    state,
    setState: setPartialState,
    showToast,
  };


  // 初始化
  useEffect(() => {
    init(context);

    return () => {
      // 清除激励弹窗关闭倒计时
      getCountdown().clear();
    };
  }, []);

  // 视频广告监听
  useAmsListener();

  // floating 展示监听
  useFloatingListener(context);

  return (
    <>
      <Floating context={context} onClick={onFloatingClick} onClose={onFloatingClose} />
      <WeakModal context={context} onClick={onWeakModalClick} />
      <PowerModal context={context} onClick={onPowerModalClick} />
      <Toast />
    </>
  );
}
