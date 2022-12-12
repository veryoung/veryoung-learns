import React from 'react';
import renderer from 'react-test-renderer';

import { PicTextBtn } from '../PicTextBtn';
import { commonProps } from '@test/mocks/props';

describe('<PicTextBtn/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        picUrl: '',
        text: '',
        subText: '',
        btnText: '',
      };
      const tree = renderer.create(<PicTextBtn {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
