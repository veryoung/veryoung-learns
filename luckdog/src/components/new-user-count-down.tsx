/**
 * 新用户免广告卡倒计时组件
 */
import React from 'react';
import { FeedsUIStyle } from '../framework/FeedsConst';
import FeedsTheme from '../framework/FeedsTheme';
import { getDeviceVisitor } from '@/luckbox';
import { CountDown, CountDownProps } from './count-down';

const styles = {
  wrap: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  time: {
    fontSize: FeedsUIStyle.T3_6,
    fontFamily: 'DINNextLTPro-Medium',
    fontWeight: 'bold',
    ...(!getDeviceVisitor().isAdr() && {
      fontFamily: 'DIN Next LT Pro',
    }),
    textAlign: 'center',
    width: 28,
    height: 28,
    backgroundColors: FeedsTheme.SkinColor.B5,
    colors: FeedsTheme.SkinColor.D2_1,
    borderRadius: 4,
    overflow: 'hidden',
    lineHeight: 26,
  },
  spliter: {
    wrap: { width: 11, justifyContent: 'center', alignItems: 'center' },
    dot: { width: 3, height: 3, borderRadius: 2, backgroundColors: FeedsTheme.SkinColor.B5, marginTop: 4 },
  },
};

/** 新用户倒计时卡片倒计时组件 */
export const NewUserCountDown = (props: Omit<CountDownProps, 'styles'>) => <CountDown key={props.remainTime} styles={styles} {...props} />;
