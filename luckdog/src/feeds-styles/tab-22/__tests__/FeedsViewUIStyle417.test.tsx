import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle417 from '../FeedsViewUIStyle417';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle417/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle417 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
