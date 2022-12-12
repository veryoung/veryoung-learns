import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle418 from '../FeedsViewUIStyle418';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle418/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle418 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
