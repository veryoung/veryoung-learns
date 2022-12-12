import React from 'react';
import renderer from 'react-test-renderer';
import { TabId } from '../../../entity';
import { FeedsViewUIStyle441 } from '../ui-style-441';
import { ITEM_BEAN } from './mocks/ui-style-441';

describe('<FeedsViewUIStyle441/>', () => {
  describe('render testing', () => {
    it('render style441', () => {
      const props = {
        index: 0,
        selectTabID: TabId.BOTTOM_RECOMM1,
        itemBean: {
          parsedObject: {
            sData: ITEM_BEAN,
          },
        },
        globalConf: {},
      };
      const tree = renderer.create(<FeedsViewUIStyle441 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
