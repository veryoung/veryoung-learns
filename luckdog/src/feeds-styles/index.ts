/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Created by piovachen on 2017/4/13.
 */

import { addKeylink, KeylinkCmd } from '@/luckdog';
import { FeedsViewUIStyle441 } from './tab-22/ui-style-441';

const MAP = {
  8: require('./tab-22/FeedsViewUIStyle8').default, // 顶tab猜你喜欢
  23: require('./common/FeedsViewUIStyle23').default, // Banner
  41: require('./common/FeedsViewUIStyle41').default, // 入口导航
  399: require('./tab-22/FeedsViewUIStyle399').default, // 热门好书
  401: require('./tab-22/FeedsViewUIStyle401').default, // 猜你喜欢/更多好书
  402: require('./tab-22/FeedsViewUIStyle402').default, // 继续阅读
  403: require('./tab-22/FeedsViewUIStyle403').default, // 阅读tab卡片-带推荐理由（小说）
  407: require('./tab-22/FeedsViewUIStyle407').default, // 选择阅读喜好
  413: require('./tab-22/FeedsViewUIStyle413').default, // 精彩节选
  415: require('./tab-22/FeedsViewUIStyle415').default,
  417: require('./tab-22/FeedsViewUIStyle417').default, // 我的书架
  // 418: require('./tab-22/FeedsViewUIStyle418').default, // 新用户选择阅读喜好
  419: require('./tab-22/FeedsViewUIStyle419').default, // 热门影视原著
  420: require('./tab-22/FeedsViewUIStyle420').default, // 排行榜外露卡片
  421: require('./tab-22/FeedsViewUIStyle421').default, // 分类标签
  422: require('./tab-22/FeedsViewUIStyle422').default, // 书架
  423: require('./tab-22/FeedsViewUIStyle418').default, // 新用户选择阅读喜好 底Tab为了兼容低版本，使用新的卡片展示新用户选择阅读喜好，原卡为418
  424: require('./tab-22/FeedsViewUIStyle424').default, // 排行榜外露卡片
  // 425: require('./tab-22/FeedsViewUIStyle425').default, // KOL推书
  // 426: require('./tab-22/FeedsViewUIStyle426').default, // 视频推送
  427: require('./tab-22/FeedsViewUIStyle401').default, // 无限流卡片
  428: require('./tab-22/FeedsViewUIStyle428').default, // 新用户pick主角/技能卡片
  429: require('./tab-22/FeedsViewUIStyle429').default, // 阅读tab卡片-带推荐理由（小说）(5本新样式)
  430: require('./tab-22/FeedsViewUIStyle430').default, // 有声书直播卡片
  431: require('./tab-22/ui-style-431').default, // 新用户免广告倒计时卡片
  434: require('./tab-22/ui-style-434').default, // 新用户视频卡片
  435: require('./tab-22/ui-style-435').default, // 新用户KOL卡片
  436: require('./tab-22/ui-style-436').default, // 新浅用户福利卡
  437: require('./tab-22/ui-style-437').default, // 新分类卡片(不含书籍)
  438: require('./tab-22/ui-style-438').default, // 新分类卡片(含书籍)
  439: require('./tab-22/ui-style-439').default, // 新样式榜单卡片
  440: require('./tab-22/ui-style-440').default, // 书架更新提示Tip卡片
  441: FeedsViewUIStyle441, // 书荒补给站
};

export default function getFeedsView(uiType) {
  if (MAP[uiType]) {
    return MAP[uiType];
  }
  addKeylink(`nonexistent-uitype-${uiType}=1`, KeylinkCmd.PR_ERROR_SUM);
  return undefined;
}
