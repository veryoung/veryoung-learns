import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle429 from '../FeedsViewUIStyle429';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/FeedsViewUIStyle429';

describe('<FeedsViewUIStyle429/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        title: '',
        itemBean: itemBean as any,
        cardIndex: 0,
        selectTabID: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle429 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
