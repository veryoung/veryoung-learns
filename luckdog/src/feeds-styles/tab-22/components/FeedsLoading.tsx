import React from 'react';
import { View, Image, Animation, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../../mixins/FeedsProtect';

interface CompProps {
  imgUri: string;
  colors?: string[];
}

@FeedsProtect.protect
export default class FeedsLoading extends React.Component<CompProps> {
  public constructor(props) {
    super(props);
    (this as any).rotateAnim = new Animation({
      mode: 'timing',
      startValue: 0.0,
      toValue: 360.0,
      duration: 1000,
      valueType: 'deg',
      timingFunction: 'linear',
      repeatCount: 'loop',
    });
  }
  public componentDidMount() {
    (this as any).rotateAnim.start();
  }

  public componentWillUnmount() {
    (this as any).rotateAnim.destroy();
  }

  public render() {
    const { imgUri, colors } = this.props;
    return (<View style={styles.loading}>
      <Image style={[
        {
          width: 22.5,
          height: 22.5,
          backgroundColor: 'transparent',
          transform: [{ rotate: (this as any).rotateAnim }],
        },
        colors ? { tintColors: colors } : {},
      ]} source={{ uri: imgUri }} noPicMode={{ enable: false }} reportData={{ sourceFrom: 'FeedsLoading' }} />
    </View>);
  }
}

const styles = StyleSheet.create({
  loading: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
});
