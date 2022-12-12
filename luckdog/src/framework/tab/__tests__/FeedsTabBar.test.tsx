import { TabIconType } from '@/entity';
import { DynamicTabType } from '@/luckbox';
import React from 'react';
import renderer from 'react-test-renderer';
import FeedsTabBar from '../FeedsTabBar';

const tabInfo = tabIcons => ({
  tabId: 190,
  tabTitle: '故事馆',
  tabType: DynamicTabType.webview,
  webViewUrl: 'https://ugssr-server.html5.qq.com/novel-video-tab?resourcefrom=webview&can_media_play=1&canhorizontalscroll=1&ch=&tabfrom=bottom&novelfeedsversion=8345&strageid=969631_2367983_2253370_2253367_2178766_2075047_1980613_1979053_1958206_1957471_1810049_1715607_1584413_2337220',
  hippyViewName: 'storyView',
  feedsViewId: '-1',
  tabIcons: tabIcons,
  specialTitle: '故事馆',
  extinfo: {},
  status: 1,
  priority: 3,
  experiment: {
    experKey: 'showUgVideoTab',
    experVal: [1],
  },
  tabBackground: {},
  limitVersion: {},
  tabRule: {
    jumpRule: {
      startTime: '',
      endTime: '',
      validDays: '1',
      clearDays: '',
      clearTime: '',
    },
  },
});

const tabIcons = {
  textTab: [],
  iconTab: [
    {
      scene: 0,
      normalIconUrl: 'https://qbnovel.qq.com/static/ug_video_tap',
      selectedIconUrl: 'https://qbnovel.qq.com/static/ug_video_tab_on',
      iconType: TabIconType.PIC_TWO,
    }, {
      scene: 1,
      normalIconUrl: 'https://qbnovel.qq.com/static/ug_video_tapD',
      selectedIconUrl: 'https://qbnovel.qq.com/static/ug_video_tab_onD',
      iconType: TabIconType.PIC_TWO,
    },
  ],
  // 图片请求失败
  iconFetchErrorTab: [
    {
      scene: 0,
      normalIconUrl: 'https://qbnovel.qq.com/an_error_url',
      selectedIconUrl: 'https://qbnovel.qq.com/static/an_error_url',
      iconType: TabIconType.PIC_TWO,
    }, {
      scene: 1,
      normalIconUrl: 'https://qbnovel.qq.com/static/an_error_url',
      selectedIconUrl: 'https://qbnovel.qq.com/static/an_error_url',
      iconType: TabIconType.PIC_TWO,
    },
  ],
};

describe('<FeedsTabBar/>', () => {
  describe('render testing', () => {
    it('render text tab', () => {
      const props = {
        curTabId: 181,
        left: true,
        redDotNum: 0,
        right: false,
        tabInfo: tabInfo(tabIcons.textTab),
        tabsCount: 6,
      };
      const tree = renderer.create(<FeedsTabBar {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('render icon tab', () => {
      const props = {
        curTabId: 181,
        left: true,
        redDotNum: 0,
        right: false,
        tabInfo: tabInfo(tabIcons.iconTab),
        tabsCount: 6,
      };
      const tree = renderer.create(<FeedsTabBar {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('render icon tab when icon fetch error', () => {
      const props = {
        curTabId: 181,
        left: true,
        redDotNum: 0,
        right: false,
        tabInfo: tabInfo(tabIcons.iconFetchErrorTab),
        tabsCount: 6,
      };
      const tree = renderer.create(<FeedsTabBar {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
