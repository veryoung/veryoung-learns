import React from 'react';
import renderer from 'react-test-renderer';
import FeedsHomePage from '../FeedsHomePage';

describe('<FeedsHomePage/>', () => {
  describe('render testing', () => {
    it('render normal', () => {
      const props = {
        abilities: '',
        feedsType: '0',
        guid: '6990ff33d33be28eaa048bc9073588cb',
        isFeedsRecommendEnabled: true,
        primaryKey: '0B7EDAE7-6634-41CA-8245-B69904A1E464',
        qbConfig: { isFullScreen: false, skinMode: 0, noPicMode: true, orientation: 2 },
        qbVersion: '11.3.5.16342',
        qua: '',
        qua2: 'PR=QB&PP=com.tencent.mttlite.dailybuild&PPVN=11.3.5.6342&CO=SYS&QV=3&PL=IOS&CHID=50001&LCID=12364&RL=1125*2436&MO=x86_64SIMU&PB=GE&VE=GA&DE=…',
        refreshStyleVer: 1,
        sdkVersion: '3.8',
        startUpType: 0,
        tabUrl: 'qb://tab/feedschannel?ForMttTab=MttYes&component=FeedsNovelPage&module=novelsingletab&title=小说&tabId=112&backupUrl=qb%3a%2f%2fhome%2ffeeds%3…',
        updateMode: '0',
        qbId: '',
        firstInstallTime: 0,
        lastUpdateTime: 0,
        url: 'qb://ext/rn?ForMttTab=MttYes&component=FeedsNovelPage&module=novelsingletab&title=小说&tabId=112&backupUrl=qb%3a%2f%2fhome%2ffeeds%3ftabId%3d2…',
      };
      const tree = renderer.create(<FeedsHomePage {...props} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
