import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle430 from '../FeedsViewUIStyle430';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle430/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle430 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
