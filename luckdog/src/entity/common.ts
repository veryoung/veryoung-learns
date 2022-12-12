import { View } from '@tencent/hippy-react-qb';
import { ItemBean } from './bean';

export interface CommonProps {
  /** 父元素 */
  parent?: any;
  parents?: any;
  /** 全局变量 */
  globalConf?: any;

  itemBean?: ItemBean;

  index?: number;
  selectTabID?: number;

  /** 组件渲染回调 */
  onLayout?: (event: { layout: Layout }) => void;

  doBeaconByClick?: (...args) => void;

  doBeaconBySlide?: (...args) => void;
}

/** 终端布局 */
export interface Layout {
  /** 相对父元素 x轴上偏向量 */
  x: number,
  /** 相对父元素 y轴上偏向量 */
  y: number,
  /** 宽度 */
  width: number,
  /** 高度 */
  height: number
}

export type ViewRef = View;
