import React from 'react';
import renderer from 'react-test-renderer';

import { BigBanner } from '../Bigbanner';
import { commonProps } from '@test/mocks/props';

describe('<Bigbanner/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        cardIndex: 0,
        books: [],
      };
      const tree = renderer.create(<BigBanner {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
