import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle415 from '../FeedsViewUIStyle415';
import { commonProps } from '@test/mocks/props';

describe('<FeedsViewUIStyle415/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const tree = renderer.create(<FeedsViewUIStyle415 {...commonProps} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
