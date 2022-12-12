import React from 'react';
import renderer from 'react-test-renderer';

import { TitleContainer } from '../TitleContainer';
import { commonProps } from '@test/mocks/props';

describe('<TitleContainer/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
      };
      const tree = renderer.create(<TitleContainer {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
