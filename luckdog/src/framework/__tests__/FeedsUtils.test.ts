import FeedsUtils from '../FeedsUtils';

describe('FeedsUtils', () => {
  describe('getQbBuild', () => {
    it('case1', () => {
      expect(FeedsUtils.getQbBuild('11.3.5.1234')).toBe(1135);
    });

    it('case2', () => {
      expect(FeedsUtils.getQbBuild('')).toBe(0);
    });

    it('case3', () => {
      expect(FeedsUtils.getQbBuild('11.3.5')).toBe(1135);
    });

    it('case4', () => {
      expect(FeedsUtils.getQbBuild('11.3')).toBe(1130);
    });
  });
});
