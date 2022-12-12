import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle403 from '../FeedsViewUIStyle403';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle403/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle403 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
