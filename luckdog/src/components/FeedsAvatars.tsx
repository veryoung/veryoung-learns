import React from 'react';
import { View, Image, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsProtect from '../mixins/FeedsProtect';

const styles = StyleSheet.create({
  container: {
    width: 59,
    height: 23,
    alignItems: 'center',
    marginRight: 8,
  },
  background: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColors: ['white', '#23282C', 'white', '#23282C'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

const LEFT_PADDING = 18;

interface Props {
  avatars: string[];
  style: Record<string, any>;
}

@FeedsProtect.protect
export default class FeedsAvatars extends React.Component<Props> {
  public render() {
    const { avatars = [] } = this.props;
    if (!avatars || avatars.length < 3) {
      return null;
    }
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={[styles.background, { left: 0 }]}>
          <Image
            style={styles.img}
            source={{ uri: avatars[0] }}
            reportData={{ sourceFrom: 'FeedsAvatars0' }}
          />
        </View>
        <View style={[styles.background, { left: LEFT_PADDING * 1 }]}>
          <Image
            style={styles.img}
            source={{ uri: avatars[1] }}
            reportData={{ sourceFrom: 'FeedsAvatars1' }}
          />
        </View>
        <View style={[styles.background, { left: LEFT_PADDING * 2 }]}>
          <Image
            style={styles.img}
            source={{ uri: avatars[2] }}
            reportData={{ sourceFrom: 'FeedsAvatars2' }}
          />
        </View>
      </View>
    );
  }
}
