import React from 'react';
import renderer from 'react-test-renderer';

import { Floating } from '../components/floating';
import { getContext } from './model.test';

describe('render floating', () => {
  it('should render floating success', () => {
    const props = {
      context: getContext(),
      onClick: jest.fn(),
      onClose: jest.fn(),
    };
    const tree = renderer.create(<Floating {...props} />);
    expect(tree).toMatchSnapshot();
  });
});
