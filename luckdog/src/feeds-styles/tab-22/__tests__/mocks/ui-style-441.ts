import { RightBehavior, UIType } from '@/framework/protocol';

const JumpLinkUrl = 'qb://qlight?needtitle=false&titlebartype=2&layoutfromtop=true&fullscreen=false&needshare=false&&needback=true&enablepulldown=false&supportnight=true&reurl=https%3A%2F%2Fnoveltest.html5.qq.com%2Fqbread%2Fhot-topic-list%3Fch%3D%26reqid%3D4ab3dc10f0d71852a1df45ea073588cb11310877724638162667487676290%26srctabid%3D181%26tabfrom%3Dbottom%26traceid%3D0994001%26cursor%3D104';
const TopicUrl = 'qb://qlight?needtitle=false&titlebartype=1&layoutfromtop=true&fullscreen=false&needshare=false&&needback=true&enablepulldown=false&supportnight=true&reurl=https%3A%2F%2Fnoveltest.html5.qq.com%2Fqbread%2Fugc-topic-detail%3Fch%3D%26reqid%3D4ab3dc10f0d71852a1df45ea073588cb11310877724638162667487676290%26srctabid%3D181%26tabfrom%3Dbottom%26traceid%3D0994002%26topic_id%3Dce78e0005f25eecb8b6f5dc48d4e247e';

export const ITEM_BEAN = {
  cardKey: 'Topic',
  uiType: UIType.TOPIC,
  title: '书荒补给站',
  debugReason: '',
  hiddenHead: false,
  reportInfo: {
    bigdata_contentid: '85c7f6d66304fe2185ea198ebe533d2d',
    bigdata_reason: '',
    channelid: '',
    position: '',
    reqid: '3a65d92dd6add8138dfec9f413b788cb1112061451095260162631976996437',
    sceneid: 'FeedsTab',
    strageid: '2253377_1390354_2253369_2389713_1884115_1894807_1978958_2265094_2039782_969632_2153176_2340704_2192036_2400775_2253365_1536621_1980613_2399843_2377110_2361953_969628_969629_2186571_1536720_2253384_2253381_2263219_2337221_2177076_2187231_1978935_1957469_2310209_2177091_2367140_2075045_2192045_2399413',
    traceid: '0994000',
    squence: '',
    ui_type: UIType.TOPIC,
  },
  behavior: RightBehavior.LINK_MORE,
  slidable: true,
  isRow: false,
  jumpLink: {
    linkName: '查看全部',
    linkUrl: JumpLinkUrl,
  },
  layoutList: [
    {
      isRow: true,
      dataList: [
        {
          topicId: '85c7f6d66304fe2185ea198ebe533d2d',
          topicName: '快穿也内卷，我穿到的身体多奇葩',
          topicUrl: TopicUrl,
        },
        {
          topicId: '85c7f6d66304fe2185ea198ebe533d3d',
          topicName: '最奇葩的金手指大盘点',
          topicUrl: TopicUrl,
        },
        {
          topicId: '85c7f6d66304fe2185ea198ebe533d4d',
          topicName: '婚后甜宠文！嗑到昏迷！',
          topicUrl: TopicUrl,
        },
      ],
    },
    {
      isRow: true,
      dataList: [
        {
          topicId: '85c7f6d66304fe2185ea198ebe533d2d',
          topicName: 'B站崩了',
          topicUrl: TopicUrl,
        },
        {
          topicId: '85c7f6d66304fe2185ea198ebe533d3d',
          topicName: '蒙古上单',
          topicUrl: TopicUrl,
        },
        {
          topicId: '85c7f6d66304fe2185ea198ebe533d4d',
          topicName: '可能发生的往事',
          topicUrl: TopicUrl,
        },
      ],
    },
  ],
};
