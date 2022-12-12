import { DynamicTabType } from '../../entity';
import { getTabpageBackgroundManager } from '../tabpage-bg-setting';

const defaultTabInfo = {
  experiment: {},
  extinfo: {},
  feedsViewId: '-1',
  hippyViewName: 'NULL',
  priority: 1,
  specialTitle: 'NULL',
  status: 1,
  tabBackground: {},
  tabIcons: [],
  tabId: 191,
  tabTitle: '见识',
  tabType: DynamicTabType.feedsview,
  webViewUrl: 'http://novel.html5.qq.com/?ch=&tabfrom=bottom&novelfeedsversion=8340&strageid=969632_2253385_2253381_2253376_2253370_1980612_1726975',
};

const tabInfoWithImage = {
  ...defaultTabInfo,
  tabBackground: {
    statusBarType: 'dark',
    type: 'IMG',
    url: 'https://novel.imqq.com/novelfeeds/1624503694/BG.png',
    color: 0,
  },
};

const tabInfoWithColor = {
  ...defaultTabInfo,
  tabBackground: {
    statusBarType: 'light',
    type: 'COLOR',
    url: '',
    color: 0x00000000,
  },
};

jest.mock('@/framework/FeedsAbilities', () => ({
  checkEnabled: () => true,
  presetTabPageImages: async () => true,
  setTabPageBgImage: async () => true,
  clearTabPageBgImage: async () => true,
}));


describe('tabpage background settings', () => {
  it('should prefetch images success', async () => {
    const result = await getTabpageBackgroundManager().prefetchTabBgImage([tabInfoWithImage]);
    expect(result).toBe(undefined);
  });

  it('should settting tabpage background to color', async () => {
    const result = await getTabpageBackgroundManager().setTabPageBgImage(tabInfoWithImage as any);
    expect(result).toBe(true);
  });

  it('should setting tabpage background to image', async () => {
    const result = await getTabpageBackgroundManager().setTabPageBgImage(tabInfoWithColor as any);
    expect(result).toBe(true);
  });
});
