/**
 * 全宽大图卡片
 */

import React from 'react';
import { View, Image, StyleSheet } from '@tencent/hippy-react-qb';
import { ConstantUtils } from '../../../feeds-styles/common/utils';
import { strictExposeReporter, logError } from '@/luckdog';
import { FullWidthImageCard } from '../../protocol';
import { useImageSize } from '../../../hooks/use-image-size';

const TAG = 'FullWidthImage';

const onLayout = (event: Record<string, any>, cardIndex: number): void => {
  strictExposeReporter.addExpoItem({
    cardIndex,
    rect: event.layout,
  });
};

 type Props = {
   data: FullWidthImageCard;
   index: number;
 };

export type Ref = HTMLDivElement;

export const FullWidthImage: React.FC<Props> = ({ data, index }): JSX.Element | null => {
  const { image, imageShowRatio } = data || {};
  const isRatioValid = imageShowRatio > 0 && imageShowRatio < 1;

  if (!image || !isRatioValid) {
    logError(`传入的data错误：${data}`, TAG);
    return null;
  }

  // 获取背景图的高度
  const { height } = useImageSize(image);

  // 背景图伸入到下面内容的高度
  const marginBottom = - height * (1 - imageShowRatio);

  return (<View
    onLayout={event => onLayout(event, index)}
    style={[styles.wrap, { height, marginBottom }]}
  >
    <Image source={{ uri: image }} style={[styles.image, { height }]} />
  </View>);
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    width: ConstantUtils.getScreenWidth(),
  },
});
