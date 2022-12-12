import { TabId } from '../../../entity';
import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle438 from '../ui-style-438';
import { FeedsViewUIStyle438Props } from './mocks/ui-style-438';

describe('<FeedsViewUIStyle438/>', () => {
  describe('render testing', () => {
    it('render oneRowThreeColumns', () => {
      const props = {
        index: 1,
        selectTabID: TabId.BOTTOM_RECOMM1,
        itemBean: {
          parsedObject: {
            sData: FeedsViewUIStyle438Props,
          },
        },
        globalConf: {},
      };
      const tree = renderer.create(<FeedsViewUIStyle438 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
