import { parseTimestamp, isSameDay, getCountdown } from '../utils';

describe('welfare treasure utils', () => {
  it('parseTimestamp', () => {
    expect(parseTimestamp(1626782143000)).toBe(1626710400000);
  });

  it('isSameDay', () => {
    expect(isSameDay(1626782143, 1626710400)).toBeTruthy();
  });

  it('Countdown', () => {
    const countdown = getCountdown();
    countdown.set(10, () => 1);
    countdown.clear();
  });
});
