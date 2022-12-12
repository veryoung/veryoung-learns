
import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsLineHeight } from '@/framework/FeedsConst';
import FeedsTheme from '@/framework/FeedsTheme';
import FeedsIcon from '@/framework/FeedsIcon';
import { Topic } from '@/framework/protocol';

interface Props {
  topic: Topic
  onLayout: (event: Record<string, any>) => void;
  onClick: (() => void) | undefined;
  height: number,
  width: number,
}

export const TopicItem = (props: Props): JSX.Element => {
  const { topic, onLayout, onClick, height, width } = props;
  const { topicId, topicName } = topic;
  return (
    <View
      key={topicId}
      style={{ ...styles.item, width }}
      onLayout={onLayout}
      onClick={onClick}
    >
      <Image
        source={{ uri: FeedsIcon.topicLabel }}
        style={{ height, width: height }}
        noPicMode={{ enable: false }}
      />
      <Text style={{ ...styles.itemText, width: width - 20 }} numberOfLines={1}>{topicName}</Text>
    </View >
  );
};

const styles = StyleSheet.create({
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T2,
    lineHeight: FeedsLineHeight.T3,
    marginLeft: 2,
  },
});
