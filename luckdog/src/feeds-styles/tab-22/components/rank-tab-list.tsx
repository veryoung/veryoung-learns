/* eslint-disable react-native/no-unused-styles */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsTheme from '../../../framework/FeedsTheme';
import { FeedsUIStyle } from '../../../framework/FeedsConst';

type Tab = {
  sGroupName: string;
  sGroupId: string;
};

export enum RankTabType {
  /** 全宽 tab */
  BIG = 'BIG',
  /** 小 tab，放在标题位置 */
  SMALL = 'SMALL',
}

type Props = {
  /** tab 列表 */
  tabList: Tab[];
  /** tab 样式类型 */
  tabType: RankTabType;
  /** 选中 tab 的索引 */
  initSelectedIndex: number;
  /** tab 点击事件函数 */
  onTabClick?: (index: number) => void;
  /** layout 事件函数 */
  onLayout?: (event: Record<string, any>) => void;
};

const getTabStyle = (index: number, length: number, styles: Record<string, any>) => {
  if (index === 0) return styles.tabWithLeftBorderRadius;

  if (index === length - 1) {
    return {
      ...styles.tabSpace,
      ...styles.tabWithRightBorderRadius,
    };
  }

  return styles.tabSpace;
};

export const RankTabList = ({ tabType, tabList, initSelectedIndex = 0, onTabClick, onLayout }: Props) => {
  if (!tabList?.length) return null;

  const [selectedIndex, setSelectedIndex] = useState(initSelectedIndex);

  const styles = stylesMap[tabType];

  const onClick = (index: number): void => {
    setSelectedIndex(index);
    onTabClick?.(index);
  };

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {tabList.map(({ sGroupName, sGroupId }, index) => (
        <View
          key={sGroupId}
          style={[
            styles.tab,
            getTabStyle(index, tabList.length, styles),
            index === selectedIndex ? styles.tabSelected : null,
          ]}
          onClick={() => onClick(index)}
        >
          <Text style={[styles.tabName, index === selectedIndex ? styles.tabNameSelected : null]}>{sGroupName}</Text>
        </View>
      ))}
    </View>
  );
};

const smallTabStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
  },
  tab: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    colors: FeedsTheme.SkinColor.N1,
    backgroundColors: FeedsTheme.SkinColor.N8,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabName: {
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1,
    opacity: 0.7,
  },
  tabSpace: {
    marginLeft: 1,
  },
  tabSelected: {
    backgroundColors: FeedsTheme.SkinColor.N2,
  },
  tabNameSelected: {
    opacity: 1,
  },
  tabWithLeftBorderRadius: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  tabWithRightBorderRadius: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
});

const bigTabStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: FeedsUIStyle.T1,
    paddingBottom: 20,
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColors: FeedsTheme.SkinColor.N8,
    height: 36,
  },
  tabName: {
    fontSize: FeedsUIStyle.T1_5,
    colors: FeedsTheme.SkinColor.N1,
    opacity: 0.7,
  },
  tabSpace: {
    marginLeft: 2,
  },
  tabSelected: {
    backgroundColors: FeedsTheme.SkinColor.N2,
  },
  tabNameSelected: {
    opacity: 1,
  },
  tabWithLeftBorderRadius: {
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  tabWithRightBorderRadius: {
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
});

const stylesMap = {
  [RankTabType.BIG]: bigTabStyles,
  [RankTabType.SMALL]: smallTabStyles,
};
