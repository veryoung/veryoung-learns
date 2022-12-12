import { WelfarePendantShowType } from '@/presenters';
import { TreasureStatus } from '../constant';
import { fetchTreasureStatus, openTreasure, receiveVideoAdReward } from '../model';

jest.mock('@/luckbox/fetch', () => ({
  doFetch: () => ({}),
}));

export const getContext = () => ({
  props: { showType: WelfarePendantShowType.HIDDEN },
  state: {
    status: TreasureStatus.UNKNOWN,
    coolingTime: 0,
    isUnfreeze: false,
    isWeakModalShow: false,
    rewardNum: 0,
    powerRewardMax: 0,
    isPowerModalShow: false,
    powerRewardNum: 0,
    powerModalCountdown: 0,
  },
  setState: () => ({}),
  showToast: () => ({}),
});

describe('welfare treasure model', () => {
  it('should fetch success', () => {
    fetchTreasureStatus(getContext(), false);
  });

  it('should open treasure success', () => {
    openTreasure(getContext());
  });

  it('should receive award success', () => {
    receiveVideoAdReward(getContext());
  });
});
