import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle421 from '../FeedsViewUIStyle421';
import { commonProps } from '@test/mocks/props';
import { itemBean } from '../components/__tests__/mocks/Tags';

describe('<FeedsViewUIStyle421/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        itemBean: itemBean as any,
      };
      const tree = renderer.create(<FeedsViewUIStyle421 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
