/** 书封圆角尺寸 */
export enum BookCoverRadiusStyle {
  /** 小圆角尺寸 */
  SMALL = 6,
  /** 普通圆角尺寸 */
  NORMAL = 6,
  /** 大圆角尺寸 */
  BIG = 6,
}

/** 标签的类型 */
export interface TagsStyle {
  /** 宽度 */
  width: number
  /** 高度 */
  height: number,
  /** x轴偏移值 */
  offsetX: number,
  /** y轴偏移值 */
  offsetY: number,
}

/** 左标签数据 */

export type LeftTag = {
  /** 标签文案 */
  sText: string
  /** 是否采用新样式 */
  bIsNew: boolean
  /** 本地书样式 */
  iColor?: number
} | string[] | undefined | null;

