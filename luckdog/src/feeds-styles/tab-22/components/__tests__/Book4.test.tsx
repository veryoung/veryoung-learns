import React from 'react';
import renderer from 'react-test-renderer';

import { Book4 } from '../Book4';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/Book4';

describe('<Book4/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        itemBean: itemBean as any,
        slideEnable: true,
        books: [],
        cardIndex: 0,
        numberOfLines: 1,
        changeable: true,
        iposition: 0,
        showSubTitle: true,
        doBeaconByClickLocal: () => {
          /*  */
        },
      };
      const tree = renderer.create(<Book4 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
