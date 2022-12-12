import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle402 from '../FeedsViewUIStyle402';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle402/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle402 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
