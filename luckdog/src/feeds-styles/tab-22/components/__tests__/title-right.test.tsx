import React from 'react';
import renderer from 'react-test-renderer';

import { TitleRight } from '../title-right';
import { commonProps } from '@test/mocks/props';

describe('<RankTabList />', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        text: '查看全部',
      };
      const tree = renderer.create(<TitleRight {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
