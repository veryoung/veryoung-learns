import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle8 from '../FeedsViewUIStyle8';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle8/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle8 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
