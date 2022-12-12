import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle399 from '../FeedsViewUIStyle399';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/FeedsViewUIStyle399';

describe('<FeedsViewUIStyle399/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        itemBean: itemBean as any,
      };
      const tree = renderer.create(<FeedsViewUIStyle399 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
