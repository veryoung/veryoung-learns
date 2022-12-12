import FeedsIcon from '../../../../framework/FeedsIcon';
import React from 'react';
import renderer from 'react-test-renderer';

import FeedsLoading from '../FeedsLoading';

describe('<FeedsLoading/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const tree = renderer.create(<FeedsLoading imgUri={FeedsIcon.VideoLoadingCircle} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
