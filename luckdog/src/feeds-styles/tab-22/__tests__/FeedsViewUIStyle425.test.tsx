import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle425 from '../FeedsViewUIStyle425';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle425/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        itemBean: {},
      };
      const tree = renderer.create(<FeedsViewUIStyle425 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
