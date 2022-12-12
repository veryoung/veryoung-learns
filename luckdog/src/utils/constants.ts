/**
 * 常量
 */
export const NEED_INSERT = [1, 2, 3];
export const MINUTE = 60 * 1000;
export const DAY = 24 * 60 * 60 * 1000;
export const AUTO_REFRESH_DURATION = 60 * MINUTE; // 1h默认自动刷新时间, self.mTabBean.autoRefreshTime
export const DELETED_ITEM_ID = 'DELETED_ITEM_ID'; // 需要删除的item id

export const UpdateModeType = {
  AUTO: '1',
  WIFI: '2',
  LITE: '3',
};

/** 数据请求类型 */
export enum RefreshType {
  /** 刷新 */
  REFRESH = 1,
  /** 加载更多 */
  LOAD_MORE = 2,
}
