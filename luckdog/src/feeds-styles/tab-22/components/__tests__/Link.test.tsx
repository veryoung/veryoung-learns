import React from 'react';
import renderer from 'react-test-renderer';

import Link from '../Link';
import { commonProps } from '@test/mocks/props';

describe('<Link/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        stMoreUrl: { vText: '' },
        styleNormal: {},
      };
      const tree = renderer.create(<Link {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
