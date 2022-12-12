import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle401 from '../FeedsViewUIStyle401';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/FeedsViewUIStyle401';

describe('<FeedsViewUIStyle401/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        itemBean: itemBean as any,
      };
      const tree = renderer.create(<FeedsViewUIStyle401 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
