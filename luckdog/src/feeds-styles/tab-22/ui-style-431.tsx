/**
 * 新用户免广告倒计时卡
 */

import React, { ForwardRefRenderFunction, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Text } from '@tencent/hippy-react-qb';
import { ConstantUtils, FormatUtils } from '../common/utils';
import { NewUserCountDown } from '../../components/new-user-count-down';
import { strictExposeReporter, logError } from '@/luckdog';
import { FeedsUIStyle } from '../../framework/FeedsConst';
import FeedsTheme from '../../framework/FeedsTheme';
import { ViewRef } from '@/entity';

const TAG = 'ui-style-431';

/** 图片加载失败时内容区高度 */
const IMAGE_ERROR_CONTENT_HEIGHT = 116;

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  imageErrorWrap: {
    height: IMAGE_ERROR_CONTENT_HEIGHT,
    marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    position: 'absolute',
    width: ConstantUtils.getScreenWidth(),
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    colors: FeedsTheme.SkinColor.B5,
    textAlign: 'center',
    lineHeight: 31,
  },
  subTitle: {
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1_5,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 7,
  },
});

const onLayout = (event: Record<string, any>, cardIndex: number): void => {
  strictExposeReporter.addExpoItem({
    cardIndex,
    tabIndex: 0,
    bookIndex: 0,
    bookId: '0',
    rect: event.layout,
  });
};

type Props = {
  itemBean: {
    parsedObject: {
      sData: string;
    }
  },
  index: number;
};

const UserAdFreeCard: ForwardRefRenderFunction<ViewRef, Props> = (
  props,
  ref: React.Ref<ViewRef>,
): JSX.Element | null => {
  const { remainTime, bgImage, bgImageShowRatio } = JSON.parse(props.itemBean?.parsedObject?.sData || '{}');
  if (!remainTime || !bgImage) {
    logError(`免广告卡数据错误：${props.itemBean?.parsedObject?.sData}`, TAG);
    return null;
  }

  const [height, setHeight] = useState(0);

  useEffect(() => {
    const fetchImageSize = async () => {
      try {
        const size = await Image.getSize(bgImage);
        const height = FormatUtils.formatDesignLength(size.height);
        setHeight(height);
      } catch (err) {
        logError(err, `${TAG}.fetchImageSize`);
      }
    };

    fetchImageSize();
  }, [bgImage]);

  return (<View
    ref={ref}
    onLayout={event => onLayout(event, props.index)}
    style={[styles.wrap, height === 0 ? styles.imageErrorWrap : { height }]}
  >
    { height === 0
      ? <View>
        <Text style={styles.title}>全场小说限时免广告</Text>
        <Text style={styles.subTitle}>海量正版小说整本免费</Text>
      </View>
      : <Image source={{ uri: bgImage }} style={[styles.image, { height }]} />
    }
    <View style={[{ marginTop: height * bgImageShowRatio }]}>
      <NewUserCountDown remainTime={remainTime} onTimeEnd={() => setHeight(0)} />
    </View>
  </View>);
};

export default React.forwardRef(UserAdFreeCard);
