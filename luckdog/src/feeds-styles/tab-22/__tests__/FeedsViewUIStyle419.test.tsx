import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle419 from '../FeedsViewUIStyle419';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle419/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle419 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
