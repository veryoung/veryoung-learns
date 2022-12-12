import { reportUDS } from '../beacon';
import { BusiKey } from '../beacon-key';

describe('beacon', () => {
  it('should report enter event', async () => {
    const result = await reportUDS(BusiKey.ENTER__PAGE_INIT) as any;
    expect(result).toEqual(expect.objectContaining({
      act: 'enter',
      event_module: 'page_init',
      isRealTime: true,
      eventName: 'novel_uds_event',
      last_action: 5940089,
    }));
  });
});
