import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';
import { useInterval } from '../hooks/use-interval';
import FeedsTheme from '../framework/FeedsTheme';

const styles = StyleSheet.create({
  wrap: {
    height: 20,
    width: 154,
    borderRadius: 10,
    backgroundColor: '#FFFFFF20',
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 2,
  },
  text: {
    maxWidth: 130,
    fontSize: 12,
    colors: FeedsTheme.SkinColor.N1_9,
    lineHeight: 20,
    marginLeft: 4,
    paddingRight: 2,
  },
});

type AwardRecord = {
  /** 头像 */
  avatar: string;
  /** 中奖纪录信息 */
  awardDesc: string;
};

type Props = {
  awardRecordList: AwardRecord[];
};

const AwardRecordCarousel = ({ awardRecordList }: Props) => {
  const [index, setIndex] = useState(0);
  const record = awardRecordList[index];

  useInterval(() => setIndex(index => (index < awardRecordList.length - 1 ? index + 1 : 0)), 3000);

  return (<View style={styles.wrap}>
    <Image style={styles.image} source={{ uri: record.avatar }} />
    <Text style={styles.text} numberOfLines={1}>{record.awardDesc}</Text>
  </View>);
};

export default AwardRecordCarousel;
