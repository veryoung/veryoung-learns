import React from 'react';
import renderer from 'react-test-renderer';

import { TextPic } from '../TextPic';
import { commonProps } from '@test/mocks/props';

describe('<TextPic/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        itemBean: {},
        style: {},
        sMainText: '',
        sSubText: '',
        sImage: '',
        openUrl: () => { /*  */ },
      };
      const tree = renderer.create(<TextPic {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
