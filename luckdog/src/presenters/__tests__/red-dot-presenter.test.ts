import { AsyncStorage } from '@tencent/hippy-react-qb';
import { getRedDotPresenter, RedDotPresenter, CacheKey } from '../red-dot-presenter';

jest.mock('@/communication/FeedsTraversal', () => ({
  traversal: () => Promise.resolve({
    success: true,
    content: {
      updateNum: 5,
      lastUpdatedTime: 200,
      isNewStyle: true,
      isUpdateBookCardStyle: false,
    },
  }),
}));

describe('red-dot-presenter', () => {
  const redDotPresenter = getRedDotPresenter();
  it('case1: getRedDotPresenter should be RedDotPresenter instance', () => {
    expect(redDotPresenter).toBeInstanceOf(RedDotPresenter);
  });

  it('case2: getRedDotPresenter should be single instance', () => {
    expect(redDotPresenter).toBe(getRedDotPresenter());
  });

  it('case3: setRedDotConfig', async () => {
    await redDotPresenter.setRedDotConfig();
    expect(redDotPresenter.getRedDot).toEqual({
      lastUpdatedTime: 200,
      updateNum: 5,
      isNewStyle: true,
      isUpdateBookCardStyle: false,
    });
  });

  it('case4: cancelRedDot', async () => {
    await redDotPresenter.setRedDotConfig();
    redDotPresenter.cancelRedDot();
    const cache = await AsyncStorage.getItem(CacheKey);
    expect(cache).toBe(200);
  });

  it('case5: getRedDotConfig have updateNum and lastUpdatedTime', async () => {
    await redDotPresenter.setRedDotConfig();
    const ret = await redDotPresenter.getRedDotConfig();
    redDotPresenter.cancelRedDot();
    expect(ret).toEqual({
      lastUpdatedTime: 200,
      updateNum: 0,
      isNewStyle: true,
      isUpdateBookCardStyle: false,
    });
  });

  it('case5: getRedDotConfig lastUpdatedTime === lastTime', async () => {
    redDotPresenter.setRedDot({ updateNum: 0, lastUpdatedTime: 0 });
    await AsyncStorage.setItem(CacheKey, 200);
    const ret = await redDotPresenter.getRedDotConfig();
    expect(ret).toEqual({
      lastUpdatedTime: 200,
      updateNum: 0,
      isNewStyle: true,
      isUpdateBookCardStyle: false,
    });
  });

  it('case6: getRedDotConfig lastUpdatedTime !== lastTime', async () => {
    redDotPresenter.setRedDot({ updateNum: 0, lastUpdatedTime: 0 });
    await AsyncStorage.setItem(CacheKey, 100);
    const ret = await redDotPresenter.getRedDotConfig();
    expect(ret).toEqual({
      lastUpdatedTime: 200,
      updateNum: 0,
      isNewStyle: true,
      isUpdateBookCardStyle: false,
    });
  });

  it('case7: enableRedDotShow', () => {
    expect(redDotPresenter.enableRedDotShow({
      lastUpdatedTime: 0,
      updateNum: 0,
      isNewStyle: false,
      isUpdateBookCardStyle: true,
    })).toBeTruthy();

    expect(redDotPresenter.enableRedDotShow({
      lastUpdatedTime: 0,
      updateNum: 0,
      isNewStyle: true,
      isUpdateBookCardStyle: false,
    })).toBeFalsy();

    expect(redDotPresenter.enableRedDotShow({
      lastUpdatedTime: 0,
      updateNum: 0,
      isNewStyle: true,
      isUpdateBookCardStyle: true,
    })).toBeTruthy();
  });
});
