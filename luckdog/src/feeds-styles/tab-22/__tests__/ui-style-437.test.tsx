import { TabId } from '../../../entity';
import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle437 from '../ui-style-437';
import { FeedsViewUIStyle437Props } from './mocks/ui-style-437';

describe('<FeedsViewUIStyle437/>', () => {
  describe('render testing', () => {
    it('render oneRowThreeColumns', () => {
      const props = {
        index: 1,
        selectTabID: TabId.BOTTOM_RECOMM1,
        itemBean: {
          parsedObject: {
            sData: FeedsViewUIStyle437Props,
          },
        },
      };
      const tree = renderer.create(<FeedsViewUIStyle437 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
