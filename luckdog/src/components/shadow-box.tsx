import React from 'react';
import { View } from '@tencent/hippy-react-qb';

const ShadowBox = (props) => {
  const { width, height, children, bgColors, borderRadius, boxShadowRadius, boxShadowOpacity, boxShadowColors } = props;
  return (
    <View
      style={{
        borderRadius,
        boxShadowRadius,
        boxShadowColors,
        boxShadowOpacity,
        position: 'relative',
        backgroundColor: 'transparent', // 规避 iOS 异常渲染成灰色背景的问题
        top: -boxShadowRadius,
        left: -boxShadowRadius,
        width: width + (boxShadowRadius * 2),
        height: height + (boxShadowRadius * 2),
      }}
    >
      <View
        style={{
          width,
          height,
          borderRadius,
          top: boxShadowRadius,
          left: boxShadowRadius,
          position: 'relative',
          backgroundColors: bgColors,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default ShadowBox;
