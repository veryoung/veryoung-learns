import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle407 from '../FeedsViewUIStyle407';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle407/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle407 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
