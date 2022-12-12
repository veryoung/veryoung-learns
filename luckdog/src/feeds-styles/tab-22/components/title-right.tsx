import React, { ReactElement } from 'react';
import { View, Text, Image, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsIcon from '../../../framework/FeedsIcon';
import { FeedsLineHeight, FeedsUIStyle } from '../../../framework/FeedsConst';
import FeedsTheme from '../../../framework/FeedsTheme';

type TitleRightProps = {
  onClick?: () => void;
  showRedDot?: boolean;
  text: string;
};

/** 红点 */
const RedDot = (): ReactElement => <View style={styles.redDot} />;

export const TitleRight = ({ onClick, showRedDot = false, text }: TitleRightProps): ReactElement => (
  <View style={styles.moreView} onClick={onClick}>
    {showRedDot ? <RedDot /> : null}
    <Text style={[styles.moreStr]} numberOfLines={1}>
      {text}
    </Text>
    <Image source={{ uri: FeedsIcon.novel_card_arrow }} style={styles.arrow} noPicMode={{ enable: false }} />
  </View>
);

const styles = StyleSheet.create({
  moreView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  moreStr: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
  },
  arrow: {
    height: 9,
    width: 5,
    marginLeft: 4,
    tintColors: FeedsTheme.SkinColor.N1,
  },
  redDot: {
    height: 5,
    width: 5,
    borderRadius: 2.5,
    backgroundColors: FeedsTheme.LiteColor.B2,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
