import { TabId } from '../entity';
import { RequestType } from '../framework/protocol';

/** 请求错误码 */
export enum ErrorCode {
  EXCEPTION_ERROR = -999,
  RESPONSE_ERROR = -998,
  BODY_DATA_ERROR = -997,
  REQUEST_ERROR = -996,
  PBSENDE_ERROR = -995,
}

/** 更新pageNum的场景来源 */
export enum UpdatePageNumScene {
  LOCAL = 'local',
  SERVER = 'server',
}

/** 请求feeds新协议接口参数类型 */
export interface TabListRequestParam {
  /** 当前哪个tab请求数据 */
  tabId: TabId;
  /** 请求类型(枚举区分 加载更多和刷新) */
  requestType: RequestType;
  /** 指定拉取卡片的cardKey */
  cardKey?: string[];
  /** 指定卡片刷新内容的数据标识，key为cardKey，value为标识 */
  itemIdMap?: { [key: string]: string },
}
