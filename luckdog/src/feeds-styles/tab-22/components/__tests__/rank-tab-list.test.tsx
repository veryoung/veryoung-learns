import React from 'react';
import renderer from 'react-test-renderer';

import { RankTabList, RankTabType } from '../rank-tab-list';
import { commonProps } from '@test/mocks/props';
import { TAB_LIST } from './mocks/rank-tab-list';

describe('<RankTabList />', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        tabList: TAB_LIST,
        tabType: RankTabType.SMALL,
        initSelectedIndex: 0,
      };
      const tree = renderer.create(<RankTabList {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
