import React from 'react';
import renderer from 'react-test-renderer';

import { PicText } from '../PicText';
import { commonProps } from '@test/mocks/props';

describe('<PicText/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        title: '',
        score: '',
        intro: '',
        type: '',
        status: '',
      };
      const tree = renderer.create(<PicText {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
