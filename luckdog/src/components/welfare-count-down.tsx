/**
 * 新人福利卡倒计时组件
 */
import React from 'react';
import { Text, View, StyleSheet } from '@tencent/hippy-react-qb';
import { FeedsUIStyle } from '../framework/FeedsConst';
import { getDeviceVisitor } from '@/luckbox';
import { CountDown, CountDownProps } from './count-down';
import FeedsTheme from '../framework/FeedsTheme';


const countDownStyles = {
  wrap: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  time: {
    fontSize: FeedsUIStyle.T1,
    fontFamily: 'DINNextLTPro-Medium',
    fontWeight: 'bold',
    ...(!getDeviceVisitor().isAdr() && {
      fontFamily: 'DIN Next LT Pro',
    }),
    textAlign: 'center',
    width: 18,
    height: 20,
    backgroundColors: FeedsTheme.SkinColor.D2_1,
    colors: FeedsTheme.SkinColor.N1,
    borderRadius: 4,
    overflow: 'hidden',
    lineHeight: 19,
  },
  spliter: {
    wrap: { width: 8, justifyContent: 'center', alignItems: 'center' },
    dot: { width: 2, height: 2, borderRadius: 1, backgroundColors: FeedsTheme.SkinColor.N1, marginTop: 2 },
  },

};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 12,
    colors: FeedsTheme.SkinColor.N1_9,
    lineHeight: 20,
    marginRight: 4,
  },
});

/** 新用户倒计时卡片倒计时组件 */
export const WelfareCountDown = (props: Omit<CountDownProps, 'styles'>) => (<View style={styles.wrap}>
  <Text style={styles.text}>限时</Text>
  <CountDown key={props.remainTime} styles={countDownStyles} {...props} />
</View>);

