import { UICard } from './card';

/**
 * 响应体类
 */
export class Response {
  /** 所在tab */
  public tabID = '';
  /** 是否还有更多数据 */
  public pageEnd = false;
  /** 当前tab下的卡片数据集合 */
  public cards: UICard[] = [];
  /** 当前是第几刷 */
  public pageNum = 1;
  /** 实验信息 */
  public abInfo?: {
    [extra: string]: number
  };
}

/**
 * 请求体类
 */
export class Request {
  /** feeds响应业务 */
  public feedAppID = FeedAppID.BOTTOM;
  /** 所在tab（枚举） */
  public tabID = TabID.BOTTOM_RECOMMEND_ID;
  /** 当前是第几刷 默认从1开始 */
  public pageNum = 1;
  /** 当天第几刷 */
  public currentDayPageNum = 1;
  /** 请求类型(枚举区分 加载更多和刷新) */
  public requestType: RequestType = RequestType.REFRESH;
  /** 操作类型 */
  public opType: OpType = OpType.READ;
  /** 指定拉取卡片的cardKey */
  public cardKey: string[] = [];
  /** 扩展字段，map类型，参照ExtInfo类型 */
  public extInfo: ExtInfo = {
    itemIdMap: {},
    cardKeyPageNum: {},
  };
}

/** 请求扩展字段，对应Request.extInfo */
export interface ExtInfo {
  /** 指定卡片刷新内容的数据标识，key为cardKey，value为标识 */
  itemIdMap: { [key: string]: string };
  /** 上次记录的卡片的第几刷数据，key为cardKey, value为数字 */
  cardKeyPageNum: { [key: string]: number };
}

/** 刷新类型 */
export enum RequestType {
  /** 加载更多 */
  LOAD_MORE = 'LOAD_MORE',
  /** 刷新页面 */
  REFRESH = 'REFRESH',
  /** 指定卡片内容进行刷新 */
  SPECIFIED_CARD = 'SPECIFIED_CARD',
}

/** 操作类型 */
export enum OpType {
  /** 创建 */
  CREATE = 'CREATE',
  /** 更新 */
  UPDATE = 'UPDATE',
  /** 读取 */
  READ = 'READ',
  /** 删除 */
  DELETE = 'DELETE',
}

/** feeds响应业务 */
export enum FeedAppID {
  /** 顶部tab业务id */
  TOP = '0',
  /** 底部频道业务id */
  BOTTOM = '138'
}

/** feeds响应业务 */
export enum TabID {
  /** 顶部小说频道 */
  TOP = '22',
  /** 底部书架tab */
  BOTTOM_BOOKSHELF_ID = '180',
  /** 底部推荐tab */
  BOTTOM_RECOMMEND_ID = '181',
  /** 底部男生tab */
  BOTTOM_BOY_ID = '182',
  /** 底部女生tab */
  BOTTOM_GIRL_ID = '183',
  /** 底部最新上架tab */
  BOTTOM_NEWS_ID = '184',
  /** 分类Tab */
  BOTTOM_CATEGORY = '185',
  /** UG活动tab */
  BOTTOM_UGACT = '186',
  /** UG福利Tab */
  BOTTOM_UGWC = '187',
  /** 书外人Tab */
  BOTTOM_SHUWAIREN = '188',
  /** 斗罗专区 */
  BOTTOM_DOULUO = '189',
  /** UG视频Tab */
  BOTTOM_UG_VIDEO = '190',
  /** 见识Tab */
  BOTTOM_KNOWLEDGE = '191',
}
