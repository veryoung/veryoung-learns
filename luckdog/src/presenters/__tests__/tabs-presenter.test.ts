import { TabId } from '../../entity';
import {
  getFixedTabId,
  getBundleTabId,
  getCurrentIdFromUrl,
  updateTabList,
  getTabList,
  TAB_SHELF,
  TAB_RECOMM,
  initTabList,
} from '../tabs-presenter';

jest.mock('@/luckbox/location', () => ({
  isTopTab: () => false,
}));

describe('TabsPresenter', () => {
  describe('getFixedTabId', () => {
    it('case1: recomm tab 22', () => {
      expect(getFixedTabId(TabId.BOTTOM_RECOMM2)).toBe(TabId.BOTTOM_RECOMM1);
    });

    it('case2: recomm tab 181', () => {
      expect(getFixedTabId(TabId.BOTTOM_RECOMM1)).toBe(TabId.BOTTOM_RECOMM1);
    });

    it('case3: undefined', () => {
      expect(getFixedTabId('')).toBeUndefined();
    });
  });

  describe('getBundleTabId', () => {
    it('case: recomm tab 22', () => {
      expect(getBundleTabId(TabId.BOTTOM_RECOMM2)).toBe(TabId.BOTTOM_RECOMM2);
    });

    it('case: recomm tab 181', () => {
      expect(getBundleTabId(TabId.BOTTOM_RECOMM1)).toBe(TabId.BOTTOM_RECOMM2);
    });
  });

  describe('getCurrentIdFromUrl', () => {
    it('case: url with currentId', () => {
      const url = 'qb://tab/feedschannel?component=FeedsNovelPage&module=novelsingletab&refresh=1&tabId=112&currentId=188';
      expect(getCurrentIdFromUrl(url)).toBe(188);
    });

    it('case: url without currentId', () => {
      const url = 'qb://tab/feedschannel?component=FeedsNovelPage&module=novelsingletab&refresh=1&tabId=112&currentId=';
      expect(getCurrentIdFromUrl(url)).toBeUndefined();
    });

    it('case: url is empty', () => {
      const url = '';
      expect(getCurrentIdFromUrl(url)).toBeUndefined();
    });
  });

  describe('tabList', () => {
    // fixme: 需要解决Promise.race的单测问题
    it('case: initTabList', async () => {
      const url = 'qb://tab/feedschannel?component=FeedsNovelPage&module=novelsingletab&refresh=1&tabId=112&currentId=188';
      const { tabList, activeTabId } = await initTabList(url);
      expect(tabList).toEqual([]);
      expect(activeTabId).toBe(188);
    });
    it('case: updateTabList', () => {
      updateTabList([]);
      expect(getTabList()).toEqual([
        TAB_SHELF,
        TAB_RECOMM,
      ]);
    });

    it('case: updateTabList 去重', () => {
      updateTabList([TAB_RECOMM]);
      expect(getTabList()).toEqual([
        TAB_SHELF,
        TAB_RECOMM,
      ]);
    });
  });
});
