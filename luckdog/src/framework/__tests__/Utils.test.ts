import { isGuidEmpty } from '../Utils';

describe('func: isGuidEmpty', () => {
  it('ret should be boolean', () => {
    expect(isGuidEmpty('')).toBe(true);
  });
});
