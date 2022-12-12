import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import { FeedsItemBottomLineType } from '../framework/FeedsConst';
import FeedsProtect from '../mixins/FeedsProtect';
import { DEFAULT_FEEDS_STYLE } from '../framework/FeedsDefaultStyle';

interface Props {
  style: Record<string, any>;
  title?: string;
  ui_style?: any;
  lineStyle?: number;
}

@FeedsProtect.protect
export default class FeedsSpliter extends React.Component<Props> {
  public render() {
    const lineStyle = this.props.lineStyle || FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_NONE;
    const styles = DEFAULT_FEEDS_STYLE.data['*'];
    let borderStyle: any[] = [];

    if (lineStyle === FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_NONE) {
      borderStyle = [styles.SPLITTER.NONE];
    } else if (lineStyle === FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_BOLD) {
      borderStyle = [styles.SPLITTER.BOLD];
    } else if (lineStyle === FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_THIN) {
      borderStyle = [styles.SPLITTER.THIN];
    } else if (
      lineStyle === FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_THIN_MATCH_PARENT
    ) {
      borderStyle = [styles.SPLITTER.THIN_MATCH_PARENT];
    } else if (lineStyle === FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_WHITE_BOLD) {
      borderStyle = [styles.SPLITTER.WHITE_BOLD];
    } else if (lineStyle === FeedsItemBottomLineType.FEEDS_VIEW_BOTTOM_LINE_TYPE_NEW_BOLD) {
      borderStyle = [styles.SPLITTER.NEW_BOLD];
    } else {
      return null;
    }

    return <View style={borderStyle} />;
  }
}
