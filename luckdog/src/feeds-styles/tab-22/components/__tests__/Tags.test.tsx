import React from 'react';
import renderer from 'react-test-renderer';

import { Tags } from '../Tags';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/Tags';

describe('<Tags/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        itemBean: itemBean as any,
        tags: [],
        line: 1,
        cardIndex: 1,
      };
      const tree = renderer.create(<Tags {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
