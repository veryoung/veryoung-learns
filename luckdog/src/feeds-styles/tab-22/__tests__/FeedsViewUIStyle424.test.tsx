import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle424 from '../FeedsViewUIStyle424';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/FeedsViewUIStyle424';

describe('<FeedsViewUIStyle424/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        itemBean: itemBean as any,
      };
      const tree = renderer.create(<FeedsViewUIStyle424 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
