import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle428 from '../FeedsViewUIStyle428';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle428/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle428 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
