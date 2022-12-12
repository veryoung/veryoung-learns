import { shallow } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';

import { Title } from '../Title';
import { commonProps } from '@test/mocks/props';

/**
 * @author azeryang
 * @priority P0
 * @casetype unit
 */
describe('<Title />', () => {
  describe('test render', () => {
    it('with title', () => {
      const props = {
        ...commonProps,
        title: '标题',
      };
      const tree = renderer.create(<Title {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('with changeable（换一换）', () => {
      const props = {
        ...commonProps,
        title: '标题',
        changeable: true,
      };
      const tree = renderer.create(<Title {...props} />);
      expect(tree).toMatchSnapshot();
    });

    it('with right（右上角链接 + 红点）', () => {
      const props = {
        ...commonProps,
        right: {
          sUrl: 'https://novel.html5.qq.com/qbread/intro?bookid=1100480477',
          sText: '简介页',
        },
        showDot: true,
      };
      const tree = renderer.create(<Title {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('test click', () => {
    it('change click（换一换点击）', () => {
      const props = {
        ...commonProps,
        changeable: true,
        doBeaconByClick: jest.fn(),
        switchNovel: jest.fn(),
      };
      const wrap = shallow(<Title {...props} />);
      wrap.find('.change-view').simulate('click');
      expect(props.doBeaconByClick.mock.calls.length).toBe(1);
      expect(props.switchNovel.mock.calls.length).toBe(1);
    });

    it('right click（右上角点击）', () => {
      const props = {
        ...commonProps,
        right: {
          sUrl: 'https://novel.html5.qq.com/qbread/intro?bookid=1100480477',
          sText: '简介页',
        },
        doBeaconByClick: jest.fn(),
        showDot: true,
      };
      const wrap = shallow(<Title {...props} />);
      expect(wrap.state('hasClick')).toBeFalsy();
      wrap.find('.right-view').simulate('click');
      expect(wrap.state('hasClick')).toBeTruthy();
      expect(props.doBeaconByClick.mock.calls.length).toBe(1);
    });
  });
});
