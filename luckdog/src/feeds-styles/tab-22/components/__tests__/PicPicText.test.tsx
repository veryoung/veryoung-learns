import React from 'react';
import renderer from 'react-test-renderer';

import { PicPicText } from '../PicPicText';
import { commonProps } from '@test/mocks/props';

describe('<PicPicText/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        cardIndex: 1,
        sBookId: '',
        vTag: [],
        style: {},
        sImage: '',
        sSubImage: '',
        sSubText: '',
        sMainText: '',
        openUrl: () => { /*  */ },
      };
      const tree = renderer.create(<PicPicText {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
