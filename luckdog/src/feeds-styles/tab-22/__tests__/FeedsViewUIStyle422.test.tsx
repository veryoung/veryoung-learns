import React from 'react';
import renderer from 'react-test-renderer';

import FeedsViewUIStyle422 from '../FeedsViewUIStyle422';
import { commonProps } from '@test/mocks/props';
import { itemBean } from './mocks/FeedsViewUIStyle422';
import { shallow } from 'enzyme';

describe('<FeedsViewUIStyle422/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        isEdit: true,
        itemBean: itemBean as any,
        parent: {
          state: {
            isEdit: false,
          },
          mViewModel: {
            deleteExtParam: jest.fn(),
            setExtParams: jest.fn(),
          },
          handleEdit: jest.fn(),
        },
      };
      const tree = renderer.create(<FeedsViewUIStyle422 {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('click edit', () => {
      const props = {
        ...commonProps,
        index: 0,
        isEdit: true,
        itemBean: itemBean as any,
        parent: {
          state: {
            isEdit: false,
          },
          mViewModel: {
            deleteExtParam: jest.fn(),
            setExtParams: jest.fn(),
          },
          handleEdit: jest.fn(),
        },
      };
      const dom = shallow(<FeedsViewUIStyle422 {...props} />);
      dom.find('.edit').simulate('click');
    });
  });
});
