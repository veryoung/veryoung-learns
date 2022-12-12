import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle426 from '../FeedsViewUIStyle426';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle426/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle426 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
