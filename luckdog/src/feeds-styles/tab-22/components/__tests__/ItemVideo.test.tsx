import React from 'react';
import renderer from 'react-test-renderer';

import ItemVideo from '../ItemVideo';
import { commonProps } from '@test/mocks/props';

describe('<ItemVideo/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        ...commonProps,
        index: 0,
        itemBean: {},
        sPicUrl: '',
        sPlayUrl: '',
        width: 100,
        height: 100,
        style: {},
        sIconImg: '',
        showTag: true,
        autoPlay: true,
        isMuted: true,
        controls: false,
        customBar: true,

        doBeaconByPlay: () => { /*  */ },
        doBeaconByPause: () => { /*  */ },
        doBeaconByMute: () => { /*  */ },
        click: () => { /*  */ },
        setliveRoomState: () => { /*  */ },
      };
      const tree = renderer.create(<ItemVideo {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
