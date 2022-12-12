import FeedsIcon from './FeedsIcon';

const config = {
  baseurl: 'https://today.imtt.qq.com/newreadLike/',
  bg: 'newBg.png',
  nightBg: 'nightBg.png',
  normalChoose: FeedsIcon.normalChoose,
  list: {
    male: [
      '玄幻',
      '都市',
      '仙侠',
      '科幻',
      '游戏',
      '历史',
      '奇幻',
      '灵异',
      '军事',
      '武侠',
      '体育',
      '轻小说',
    ],
    female: [
      '现言',
      '古言',
      '幻情',
      '悬疑',
      '仙侠',
      '青春',
      '科幻',
      '游戏',
    ],
  },
  ids: {
    male: [
      '110',
      '114',
      '113',
      '118',
      '119',
      '115',
      '111',
      '117',
      '116',
      '112',
      '148',
      '150',
    ],
    female: [
      '226',
      '225',
      '247',
      '230',
      '213',
      '222',
      '218',
      '219',
    ],
  },
  maleIndex: '1',
  femaleIndex: '2',
};

export default config;
