import React from 'react';
import renderer from 'react-test-renderer';

import Rank from '../Rank';
import { commonProps } from '@test/mocks/props';

describe('<Rank/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        cardIndex: 1,
        books: [],
      };
      const tree = renderer.create(<Rank {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
