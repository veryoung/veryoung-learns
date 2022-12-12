/* 卡片左上角链接类型 */
export enum CardLinkType {
  NONE = 0, // 无实验下发(即本地刷新换一换，用已有的书籍进行轮换)
  MORE = 1, // 更多
  CHANGE = 2, // 局部刷新换一换（命中该实验，通过预加载远程书籍换一换）
}


/** 局部刷新换一换请求参数 */
export interface CardReportReq {
  tabId: number, // 当前tab的selectTabID
  tabIdx: number, // 卡片位于tab下的索引
  pageNum: number, // 页码
  refreshKey?: string, // 卡片的refreshKey
}


/** 局部刷新上报参数 */
export interface CardReportInfo {
  [extra: string]: string;
}
