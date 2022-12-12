import { TabId } from '../../../entity';
import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle432 from '../ui-style-432';
import { oneRowThreeColumns, twoRowTwoColumns } from './mocks/ui-style-432';

describe('<FeedsViewUIStyle432/>', () => {
  describe('render testing', () => {
    it('render oneRowThreeColumns', () => {
      const props = {
        curTabId: TabId.BOTTOM_RECOMM1,
        iUIStyleId: 432,
        mpReportInfo: {},
        cardData: oneRowThreeColumns,
      };
      const tree = renderer.create(<FeedsViewUIStyle432 {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('render twoRowTwoColumns', () => {
      const props = {
        curTabId: TabId.BOTTOM_RECOMM1,
        iUIStyleId: 432,
        mpReportInfo: {},
        cardData: twoRowTwoColumns,
      };
      const tree = renderer.create(<FeedsViewUIStyle432 {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
