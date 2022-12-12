import React from 'react';
import { View, Text, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsTheme from '../framework/FeedsTheme';
import { colorDict, FeedsUIStyle } from '../framework/FeedsConst';

const styles = StyleSheet.create({
  tagBlock: {
    borderRadius: 3,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.SMALL_2,
    fontWeight: 'bold',
    marginHorizontal: 3,
    marginVertical: 2,
  },
});

/** 书籍右上角标组件 */
export const Tag = (props): JSX.Element => {
  // 书籍标签的默认底色
  const DEFAULT_TAG_COLOR = 4;
  const { icon = {}, text, type, fontSize } = props;
  const { sText = '', iColor } = icon;
  if (!sText && !text) {
    return <View/>;
  }
  return (
    <View style={[
      styles.tagBlock,
      { backgroundColors: colorDict[iColor || type] || colorDict[DEFAULT_TAG_COLOR] },

    ]}>
      <Text style={[styles.tagText, fontSize ? { fontSize } : null]}>
        {sText || text}
      </Text>
    </View>
  );
};
