import React from 'react';
import { View, Text, Image, StyleSheet } from '@tencent/hippy-react-qb';

import { CommonCardStyle } from '../../FeedsConst';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { CategoryCard } from '../../protocol/card';
import { strictExposeReporter, BusiKey, reportUDS } from '@/luckdog';
import FeedsUtils from '../../FeedsUtils';
import { FeedsTheme } from '../../../feeds-styles/tab-22/components/utils';
import { Category } from '../../protocol/entity';

interface CompProps {
  index: number;
  globalConf: any;
  curTabId: number;
  data: CategoryCard;
}

/** 一行展示3个，适配的导航高宽 */
const { width } = FeedsUtils.getScreen();
const CategoryWidth = (width - (12 * 2)) / 3;

@FeedsProtect.protect
export class CategoryKnowledge extends React.Component<CompProps> {
  public constructor(props: CompProps) {
    super(props);
  }

  public render() {
    const { classifyList = [] } = this.props.data;
    const classifyLen = classifyList.length;
    if (classifyLen < 1) return null;

    const middleIdx = Math.ceil(classifyLen / 2);
    return <View style={[CommonCardStyle, styles.container]} onLayout={this.onCardLayout}>
      {this.renderRowCategory(classifyList.slice(0, middleIdx), 0)}
      {this.renderRowCategory(classifyList.slice(middleIdx, classifyLen), middleIdx)}
    </View>;
  }

  /** 更新card布局信息 */
  private onCardLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  /** 当行分类组件渲染 */
  private renderRowCategory = (categoryList: Category[], startIdx: number) => (
    <View style={styles.categoryRow}>
      {categoryList.map((item, index) => this.renderCategory(item, index + startIdx))}
    </View>
  );

  /** 渲染单个分类 */
  private renderCategory = (category: Category, index: number) => {
    const { cardKey } = this.props.data;
    const { name = '', icon = '', jumpUrl = '' } = category || {};
    return <View
      style={styles.categoryItem}
      key={`${cardKey}_${name}_${index}`}
      onClick={() => this.clickCategory(jumpUrl, index)}
    >
      <Text style={styles.tagName} numberOfLines={1}>{name}</Text>
      <Image style={styles.tagIcon} source={{ uri: icon }} />
    </View>;
  };

  /** 分类点击 */
  private clickCategory = (jumpUrl: string, index: number) => {
    const { curTabId } = this.props;
    const { reportInfo } = this.props.data;
    reportUDS(BusiKey.CLICK__CARD, {}, {
      ...reportInfo,
      ext_data1: `${index}`,
    }); // 点击上报

    if (!jumpUrl) return;
    FeedsUtils.doLoadUrl(jumpUrl, `${curTabId}`);
  };
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItem: {
    width: CategoryWidth,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tagName: {
    width: CategoryWidth - 32 - 40,
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1,
  },
  tagIcon: {
    width: 32,
    height: 32,
    borderRadius: 50,
  },
});
