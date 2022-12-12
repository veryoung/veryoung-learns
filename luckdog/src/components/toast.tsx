/**
 * 自定义居中 toast 组件
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsTheme from '@/framework/FeedsTheme';

interface IOption {
  message: string; // toast 文案
  duration?: number; // 延迟关闭时间
}

export type IShowToast = (option: string | IOption) => void;

// 参数是个对象
const isOptionObject = (option: string | IOption): option is IOption => typeof option === 'object';

export const useToast = (): [() => JSX.Element | null, IShowToast] => {
  const [state, setState] = useState({
    isShow: false,
    message: '',
    timer: 0,
  });

  // 组件
  const Toast = () => (state.isShow ? (
    <View style={styles.toastBox}>
      <View style={styles.toast}>
        <Text style={styles.toastText}>{state.message}</Text>
      </View>
    </View>
  ) : null);

  // 操作方法
  const showToast = (option: string | IOption) => {
    const message = isOptionObject(option) ? option.message : option;
    const duration = (isOptionObject(option) && option.duration) || 2000;

    // 清除上一个计时器
    clearTimeout(state.timer);
    // 延迟关闭
    const timer = setTimeout(() => {
      setState({
        isShow: false,
        message: '',
        timer: 0,
      });
    }, duration);

    setState({
      isShow: true,
      message,
      timer: timer as any as number,
    });
  };

  return [Toast, showToast];
};

const styles = StyleSheet.create({
  toastBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  toast: {
    height: 45,
    backgroundColors: ['rgba(0, 0, 0, .8)'],
    justifyContent: 'center',
    paddingLeft: 24,
    paddingRight: 24,
    borderRadius: 35.5,
  },
  toastText: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: 16,
    colors: FeedsTheme.SkinColor.A8,
  },
});
