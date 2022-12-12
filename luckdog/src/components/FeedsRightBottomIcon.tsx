import React from 'react';
import { View, StyleSheet, Text, Image, Platform } from '@tencent/hippy-react-qb';
import { FeedsUIStyle } from '../framework/FeedsConst';
import FeedsTheme from '../framework/FeedsTheme';
import FeedsProtect from '../mixins/FeedsProtect';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColors: FeedsTheme.SkinColor.IMG_TAG_BG,
    borderRadius: 8,
    bottom: 4,
    flexDirection: 'row',
    height: 17,
    justifyContent: 'center',
    paddingHorizontal: 6,
    position: 'absolute',
    right: 4,
  },
  iconView: {
    height: 7,
    marginLeft: Platform.OS === 'android' ? 0 : 1,
    marginRight: 4,
    width: 7,
  },
  textView: {
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.T0,
    top: Platform.OS === 'android' ? -0.5 : 0,
  },
});

interface Props {
  icon: string;
  text: string;
}

@FeedsProtect.protect
export default class FeedsRightBottomIcon extends React.Component<Props> {
  public render() {
    const { icon } = this.props;
    const { text } = this.props;
    if (!icon && !text) {
      return null;
    }
    let iconView: any;
    let textView: any;
    if (icon) {
      iconView = (
        <Image
          reportData={{ sourceFrom: 'FeedsRightBottomIcon_icon' }}
          style={styles.iconView}
          source={{ uri: icon }}
          noPicMode={{ enable: false }}
        />
      );
    }
    if (text) {
      textView = (
        <Text style={styles.textView} numberOfLines={1}>
          {text}
        </Text>
      );
    }
    return (
      <View style={styles.container}>
        {iconView}
        {textView}
      </View>
    );
  }
}
