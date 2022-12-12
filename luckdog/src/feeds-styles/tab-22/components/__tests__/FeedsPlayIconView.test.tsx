import React from 'react';
import renderer from 'react-test-renderer';

import FeedsPlayIconView from '../FeedsPlayIconView';
import { commonProps } from '@test/mocks/props';

describe('<FeedsPlayIconView/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
      };
      const tree = renderer.create(<FeedsPlayIconView {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
