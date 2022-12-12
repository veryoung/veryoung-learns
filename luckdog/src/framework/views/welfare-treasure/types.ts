import { IShowToast } from '@/components/toast';
import { WelfarePendantShowType } from '@/presenters/welfare-floating-controller';
import { TreasureStatus } from './constant';

// 组件 props
export interface TreasureProps {
  showType: WelfarePendantShowType
}

// 组件 state
export interface TreasureState {
  status: TreasureStatus; // 福袋状态
  coolingTime: number; // 冷却时间，仅 status=COOLING 有效
  isUnfreeze: boolean; // 是否解冻
  isWeakModalShow: boolean; // 展示福袋弹窗
  rewardNum: number; // 开启福袋获得的金币数量
  powerRewardMax: number; // 继续观看激励视频还能获取到的最高金币数
  isPowerModalShow: boolean; // 展示激励视频弹窗
  powerRewardNum: number; // 观看激励视频获得的金币数量
  powerModalCountdown: number; // 激励视频弹窗关闭倒计时
}

// 组件 setState
export type SetTreasureState = (payload: Partial<TreasureState>) => void;

// 组件 context
export interface TreasureContext {
  props: TreasureProps;
  state: TreasureState;
  setState: SetTreasureState;
  showToast: IShowToast;
}

// 接口实体
export interface TreasureChestStatus {
  total_times: number;
  completed_times: number;
  can_open: boolean;
  svr_ts: number;
  next_ts: number;
}

export interface TreasureChestResult {
  reward_type: number;
  reward_num: number;
}

export interface GetTreasureChestReply {
  ret_code: number;
  err_msg: string;
  status: TreasureChestStatus;
}

export interface OpenTreasureChestReply {
  ret_code: number;
  err_msg: string;
  status: TreasureChestStatus;
  result: TreasureChestResult;
  show_video_ad: boolean;
  video_ad_max_gold: number;
}

export interface ReceiveVideoAdRewardReply {
  ret_code: number;
  err_msg: string;
  reward_type: number;
  reward_num: number;
}
