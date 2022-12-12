import { RequestType } from '../../framework/protocol';
import { requestTabListData } from '../request';
import { TabId } from '../../entity';

describe('Service', () => {
  describe('getFeedTabPage', () => {
    it('request', async () => {
      const params = {
        tabId: TabId.BOTTOM_RECOMM1,
        requestType: RequestType.REFRESH,
      };
      const result = await requestTabListData(params);
      expect(result).toBeInstanceOf(Object);
    });
  });
});
