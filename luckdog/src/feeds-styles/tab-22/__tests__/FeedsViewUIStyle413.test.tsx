import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle413 from '../FeedsViewUIStyle413';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle413/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle413 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
