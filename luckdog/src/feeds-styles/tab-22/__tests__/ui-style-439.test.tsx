import { TabId } from '../../../entity';
import React from 'react';
import renderer from 'react-test-renderer';

import RankCard from '../ui-style-439';
import { itemBean } from './mocks/FeedsViewUIStyle424';

describe('<RankCard />', () => {
  describe('render testing', () => {
    it('render rank card', () => {
      const props = {
        index: 1,
        selectTabID: TabId.BOTTOM_RECOMM1,
        itemBean: itemBean as any,
        globalConf: {},
      };
      const tree = renderer.create(<RankCard {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
