import { UIType } from './ui-type';
import {
  Author,
  Banner,
  BaseBook,
  BookInShelf,
  CatchUpBooks,
  Category,
  CollectionInShelf,
  Nav,
  RankItem,
  AwardRecord,
  Award,
  Topic,
} from './entity';


/** 上报信息 */
export interface ReportInfo {
  strageid: string;
  channelid: string;
  traceid: string;
  sceneid: string;
  reqid: string;
  bigdata_contentid: string;
  bigdata_reason: string;
  squence: string;
  position: string;
  ui_type: UIType;
}

/**
 * 卡片实体的基类
 */
export class BaseCard {
  /** 跟后台关联的唯一key(用于后台感知,和局部刷新) */
  public cardKey = '';
  /** 卡片ui标记 后台共同维护数据和卡片样式的映射关系 */
  public uiType: UIType = UIType.BANNER;
  /** 卡片名 */
  public title?: string;
  /** 用于调试的reason */
  public debugReason?: string;
  /** 上报信息 */
  public reportInfo?: ReportInfo;
  /** 是否隐藏头部title */
  public hiddenHead = false;
}

/** 卡片右上角用户行为类型 */
export enum RightBehavior {
  /** 卡片右上角无内容 */
  NONE = 'NONE',
  /** 查看更多，跳转落地页 */
  LINK_MORE = 'LINK_MORE',
  /** 刷新换一换，本地数据替换 */
  REFRESH_LOCAL = 'REFRESH_LOCAL',
  /** 刷新换一换，服务数据替换 */
  REFRESH_SERVER = 'REFRESH_SERVER',
}

/** 卡片落地页链接 */
export class Link {
  /** 卡片落地页链接名称 */
  public linkName = '';
  /** 卡片落地页链接地址 */
  public linkUrl = '';
}

/** 书架卡片 */
export class BookShelfCard extends BaseCard {
  /** 已加入的书籍数 */
  public totalNum = 0;
  /** 收藏书籍数据 */
  public items: (BookInShelf | CollectionInShelf)[] = [];
}

/** 推书卡片 */
export class CatchUpBookCard extends BaseCard {
  public items: CatchUpBooks[] = [];
}

/** 书籍卡片 */
export class BaseBookCard extends BaseCard {
  /** 外层容器是否横向排列，默认是false，竖向排列 */
  public isRow = false;
  /** 右上角行为类型 */
  public behavior: RightBehavior = RightBehavior.NONE;
  /** 右上角点击落地页，当behavior=LINK_MORE时有值 */
  public jumpLink = new Link();
  /** 是否可以滑动 */
  public slidable = false;
  /** 是否支持点击空白处跳转落地页 */
  public canBlankJump = false;
}

/** 各种排列方式的书籍卡片的布局 */
export class CardLayout<T = BaseBook> {
  /** 是否横向排列，默认是false，竖向排列 */
  public isRow = false;
  /** 展示内容列表 */
  public dataList: T[] = [];
}

/** 非换一换书籍卡片 */
export class NormalCard extends BaseBookCard {
  /** 各种排列后的书籍卡片列表 */
  public layoutList: CardLayout<BaseBook>[] = [];
}

/** 换一换书籍卡片 */
export class RefreshCard extends BaseBookCard {
  /** 分页的书籍卡片布局列表 */
  public pageList: CardLayout<BaseBook>[][] = [];
}


/** 排行榜卡片 */
export class RankCard extends BaseCard {
  /** 排行榜内容，定义成数组为了兼容多榜单 (抽成具体的类型)*/
  public rankList?: RankItem[];
  /** 是否可以滑动 */
  public slidable?: false;
  /** 是否支持点击空白处跳转落地页 */
  public canBlankJump?: boolean = false;
}

/** 导航入口卡片 */
export class NavCard extends BaseCard {
  /** 导航内容 */
  public navList: Nav[] = [];
}

/** banner图卡片，支持多banner轮播 */
export class BannerCard extends BaseCard {
  /** banner列表 */
  public bannerList: Banner[] = [];
  /** 是否锚点导航 */
  public showDot?: false;
}

/** 阅读喜好卡片（uiType字段区分  新老阅读喜好卡片->重新抽象） */
export class ReadInterestCard extends BaseBook {
  /** 跳转的落地页地址 */
  public jumpLink: Link = new Link();
}

/** 分类标签卡片 */
export class CategoryCard extends BaseCard {
  /** 是否横向排列 */
  public isRow = false;
  /** 分类标签行数（不传前端默认值为2） */
  public rowNum = 2;
  /** 分类标签 */
  public classifyList: Category[] = [];
  /** 是否可以滑动 */
  public slidable = false;
  /** 跳转的落地页地址 */
  public jumpLink = new Link();
  /** 是否支持点击空白处跳转落地页 */
  public canBlankJump = false;
}

/** 分类加推荐内容卡片 */
export class CategoryContentBookCard extends CategoryCard {
  /** 展示内容列表 */
  public dataList: BaseBook[] = [];
}

/** 新用户免广告倒计时卡片 */
export class NewUserAdFreeCard extends BaseCard {
  /** 免广告剩余时长 */
  public remainTime = 0;
  /** 背景图片 */
  public bgImage = '';
  /** 背景图片露出高度和总高度的比例 */
  public bgImageShowRatio = 0.5;
}

/** 新浅用户福利卡 */
export class NewUserWelfareCard extends BaseCard {
  /** 福利卡倒计时 */
  public remainTime = 0;
  /** 背景图片 */
  public bgImage = '';
  /** 背景图片露出高度和总高度的比例 */
  public bgImageShowRatio = 0.5;
  /** 轮播记录列表 */
  public awardRecordList: AwardRecord[] = [];
  /** 奖品信息列表 */
  public awardList: Award[] = [];
}

/** 书单卡片 */
export class BookListCard extends BaseCard {
  /** 描述语 */
  public description = '';
  /** 右上角行为类型 */
  public behavior: RightBehavior = RightBehavior.REFRESH_SERVER;
  /** 右上角点击落地页，当behavior=LINK_MORE时有值 */
  public jumpLink = new Link();
  /** 是否可以滑动 */
  public slidable = false;
  /** 展示书籍列表 */
  public dataList: BaseBook[] = [];
}

/** 作者卡片 */
export class AuthorListCard extends BaseCard {
  /** 作者列表 */
  public authors: Author[] = [];
  /** 外层容器是否横向排列，默认是false，竖向排列 */
  public isRow = false;
  /** 纵横排列组合后的书籍布局列表 */
  public layoutList: CardLayout<BaseBook>[] = [];
  /** 卡片背景色，是[日间、夜间、深色、浅色]的数组 */
  public bgColor: string[] = [];
}

/** 全宽大图卡 */
export class FullWidthImageCard extends BaseCard {
  /** 图片url */
  public image = '';
  /** 图片露出高度和总高度的比例 */
  public imageShowRatio = 0.5;
}

/** 话题卡 */
export class TopicCard extends BaseCard {
  /** 右上角行为类型 */
  public behavior: RightBehavior = RightBehavior.LINK_MORE;
  /** 右上角点击落地页，当behavior=LINK_MORE时有值 */
  public jumpLink = new Link();
  /** 是否可以滑动 */
  public slidable = false;
  /** 是否横向排列，默认是false，竖向排列 */
  public isRow = false;
  /** 纵横排列组合后的话题布局列表 */
  public layoutList: CardLayout<Topic>[] = [];
}

/** 支持下发的卡片内容 */
export type UICard = (
  NormalCard
  | RefreshCard
  | RankCard
  | NavCard
  | BannerCard
  | ReadInterestCard
  | CategoryCard
  | BookShelfCard
  | CatchUpBookCard
  | BookListCard
  | AuthorListCard
  | TopicCard
);
