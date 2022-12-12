/** 右上角跳转链接 */
export interface RightLink {
  /** 跳转地址 */
  sUrl: string;
  /** 跳转地址文案 */
  sText: string;
}

/** 跳转更多 */
export interface MoreUrl {
  vText?: string;
}

export interface ItemBean {
  report_info?: Array<Array<string>>;
  ui_style?: number;
  parsedObject?: Record<string, any>;
  item_id?: string;
  tab_id?: string;
  title?: string;
  bottomLineStyle?: number;
  reportState?: boolean;
  symbolKey?: string;
  business?: number;
  url?: string;
}
