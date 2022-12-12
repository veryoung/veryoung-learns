/**
 * Created by teddylin on 2018/2/27.
 */
import React from 'react';
import { View, Image } from '@tencent/hippy-react-qb';

import FeedsIcon from '../../../framework/FeedsIcon';
import FeedsProtect from '../../../mixins/FeedsProtect';

interface Props {
  globalConf: any;
  style?: Record<string, any>;
  iconStyle?: Record<string, any>;
  iconClick?: () => void;
}

const styles = {
  imagePlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  icon: {
    width: 44,
    height: 44,
  },
};

@FeedsProtect.protect
export default class FeedsPlayIconView extends React.Component<Props> {
  public render() {
    const { globalConf, style: extraStyle, iconStyle: extIconStyle, iconClick, ...restProps } = this.props;
    const iconStyle = [styles.icon, extIconStyle];
    return (
      <View style={[styles.imagePlayContainer, extraStyle]} {...restProps}>
        <Image
          style={iconStyle}
          source={{ uri: FeedsIcon.playIcon }}
          noPicMode={{ enable: false }}
          resizeMode='contain'
          onClick={iconClick}
        />
      </View>
    );
  }
}
