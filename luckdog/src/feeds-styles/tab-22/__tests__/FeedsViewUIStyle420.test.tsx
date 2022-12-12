import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle420 from '../FeedsViewUIStyle420';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle420/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle420 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
