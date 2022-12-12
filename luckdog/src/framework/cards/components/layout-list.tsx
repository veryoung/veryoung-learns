import React from 'react';
import { StyleSheet, View } from '@tencent/hippy-react-qb';

import FeedsProtect from '../../../mixins/FeedsProtect';
import { CardLayout } from '../../protocol/card';

interface CompProps<T> {
  /** 最外层容器的布局方式 */
  isRow: boolean;
  /** 行列组合后的item布局列表 */
  layoutList: CardLayout<T>[];
  /** item的行间距 */
  rowSpacing?: number;
  /** item的列间距 */
  columnSpacing?: number;
  /** item的渲染函数 */
  onItemRender: (
    /** 是否是行列结合布局后的小item */
    isSmallItem: boolean,
    /** layout索引 */
    layoutIdx: number,
    /** dataItem索引 */
    itemIdx: number,
  ) => JSX.Element | null;
  /** item的layout回调 */
  onItemLayout?: (
    /** 事件回调参数，主要取layout属性 */
    event: any,
    /** 是否是行列结合布局后的小item */
    isSmallItem: boolean,
    /** layout索引 */
    layoutIdx: number,
    /** dataItem索引 */
    itemIdx: number,
    /** 扩展信息，一般传dataItem对象 */
    extInfo?: Record<string, any>,
  ) => void;
}

/** 判断当前dataList所在layout是否处于行列结合后的小卡 */
const isInCardSmallItem = <T extends unknown>(
  dataList: T[],
  layoutList: CardLayout<T>[],
): boolean => layoutList.some(item => dataList.length > item.dataList.length);


/**
 * 行列各种组合的布局参考:
 * https://codesign.woa.com/s/YDgGjYrrNb9wEVQ
 * https://codesign.woa.com/s/XgRxnjPM8E9Lmqr
 */
@FeedsProtect.protect
export class LayoutList<T> extends React.Component<CompProps<T>> {
  public constructor(props: CompProps<T>) {
    super(props);
  }

  public render() {
    const { isRow, layoutList = [], rowSpacing = 0, columnSpacing = 0 } = this.props;
    // 外侧容器样式
    const contentStyle = isRow ? styles.row : styles.column;
    // 每个layout间距
    const spacingStyle = isRow ? { marginLeft: columnSpacing } : { marginTop: rowSpacing };
    return <View collapsable={false} style={contentStyle}>
      {
        layoutList.map((layoutItem, layoutIdx) => <View
          key={`layoutItem_${layoutIdx}`}
          style={layoutIdx > 0 ? spacingStyle : {}}
        >
          {this.renderLayout(layoutItem, layoutIdx)}
        </View>)
      }
    </View>;
  }

  /** 外层layout渲染 */
  private renderLayout = (layoutItem: CardLayout<T>, layoutIdx: number) => {
    const { layoutList = [], rowSpacing = 0, columnSpacing = 0, onItemRender, onItemLayout } = this.props;
    const { isRow, dataList = [] } = layoutItem || {};
    // layout容器样式
    const layoutStyle = isRow ? styles.row : styles.column;
    // 每个item间距
    const spacingStyle = isRow ? { marginLeft: columnSpacing } : { marginTop: rowSpacing };
    const isSmallItem = isInCardSmallItem(dataList, layoutList);
    return <View style={layoutStyle} collapsable={false}>
      {
        dataList.map((_dataItem, itemIdx) => <View
          key={`listItem_${itemIdx}`}
          style={itemIdx > 0 ? spacingStyle : {}}
          onLayout={event => onItemLayout?.(event, isSmallItem, layoutIdx, itemIdx)}
        >
          {onItemRender(isSmallItem, layoutIdx, itemIdx)}
        </View>)
      }
    </View>;
  };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});
