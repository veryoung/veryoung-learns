import React from 'react';
import renderer from 'react-test-renderer';

import { ChangeableComment } from '../changeable-commend';
import { changeableCommendData } from './mocks/changeable-commend';

describe('<ChangeableComment/>', () => {
  describe('render testing', () => {
    it('render changeable commend', () => {
      const props = {
        data: changeableCommendData as any,
        index: 3,
        key: 'test',
        globalConf: {},
        totalLength: 32,
        curTabId: 181,
      };
      const tree = renderer.create(<ChangeableComment {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
