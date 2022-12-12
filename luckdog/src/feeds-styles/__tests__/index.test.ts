
import  getFeedsView from '../index';
import FeedsViewUIStyle403 from '../tab-22/FeedsViewUIStyle403';

describe('getFeedsView', () => {
  it('not matched should be undefined', () => {
    expect(getFeedsView(0)).toBe(undefined);
  });

  it('matched 403 should be FeedsViewUIStyle403', () => {
    expect(getFeedsView(403)).toBe(FeedsViewUIStyle403);
  });
});
