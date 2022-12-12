import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle431 from '../ui-style-431';
import { itemBean } from './mocks/ui-style-436';

describe('<FeedsViewUIStyle431/>', () => {
  describe('render testing', () => {
    it('render adsfree card', () => {
      const props = {
        itemBean,
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle431 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
