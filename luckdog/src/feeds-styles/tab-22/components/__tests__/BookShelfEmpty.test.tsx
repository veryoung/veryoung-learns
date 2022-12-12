import React from 'react';
import renderer from 'react-test-renderer';

import { BookShelfEmpty } from '../BookShelfEmpty';
import { commonProps } from '@test/mocks/props';

describe('<BookShelfEmpty/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        parsedObject: {},
      };
      const tree = renderer.create(<BookShelfEmpty {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
