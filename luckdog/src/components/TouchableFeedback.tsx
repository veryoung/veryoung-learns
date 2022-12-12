/**
 *  TouchableFeedback组件, 从react-native-qb中copy出来。
 *  修正了原来在react-native-qb中的bug.
 *  并且增加了View层包裹Text组件。
 */
import React from 'react';
import { View, QBWindowModule, TouchableWithoutFeedback } from '@tencent/hippy-react-qb';

interface Props {
  disableState?: boolean;
  source?: any;
  url?: string;
  pressBgColor?: string;
  pressTextColor?: string;
  pressTextSize?: string;
  subViewStyle?: any;
  pressOpacity?: number;
  onPress?: () => void;
}

interface State {
  isClicked: boolean;
}

export default class TouchableFeedback extends React.Component<Props, State> {
  public constructor(props) {
    super(props);

    this.state = {
      isClicked: false,
    };
  }

  public onPressIn = () => {
    // 没有点击态
    if (this.props.disableState) return;
    this.setState({ isClicked: true });
  };

  public onPressOut = () => {
    this.setState({ isClicked: false });
  };

  public loadUrl = () => {
    const { onPress, url, source } = this.props;
    if (onPress) {
      onPress();
    } else if (url && source) {
      QBWindowModule.loadUrl(url, source);
    } else {
      return false; // 没有就冒泡
    }
  };

  public render() {
    const { pressBgColor, pressTextColor, pressTextSize, subViewStyle } = this.props;
    let templeSubViewStyle = subViewStyle;
    let children: any = null;

    if (this.props.children) {
      if (this.state.isClicked) {
        let newStyle = {} as any;
        try {
          const originStyle = (this.props.children as any).props.style;
          JSON.parse(JSON.stringify(originStyle));
        } catch (error) { /* nothing */ }

        if (pressBgColor) {
          templeSubViewStyle = { ...templeSubViewStyle, backgroundColors: pressBgColor };
          delete newStyle.backgroundColor;
          delete newStyle.backgroundColors;
        }

        if (pressTextColor) {
          newStyle = Object.assign(newStyle, {
            colors: pressTextColor,
          });
        }

        if (pressTextSize) {
          newStyle = Object.assign(newStyle, {
            textSize: pressTextSize,
          });
        }

        children = React.cloneElement(this.props.children as any, { style: newStyle });
      } else {
        children = this.props.children;
      }
    }

    return (
      <TouchableWithoutFeedback
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        onClick={this.loadUrl}
      >
        <View style={templeSubViewStyle}>{children || <View />}</View>
      </TouchableWithoutFeedback>
    );
  }
}
