import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle440 from '../ui-style-440';


describe('<FeedsViewUIStyle440/>', () => {
  describe('render testing', () => {
    it('render style440', () => {
      const props = {
        itemBean: {
          parsedObject: {
            sData: '',
          },
        },
        index: 0,
      };
      const tree = renderer.create(<FeedsViewUIStyle440 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
