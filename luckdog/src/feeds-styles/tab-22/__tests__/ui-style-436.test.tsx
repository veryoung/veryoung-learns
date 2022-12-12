import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle436 from '../ui-style-436';
import { itemBean } from './mocks/ui-style-436';

describe('<FeedsViewUIStyle436 />', () => {
  describe('render testing', () => {
    it('render welfare card', () => {
      const props = {
        itemBean,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle436 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
