/**
 * 倒计时组件
 */
import React, { useEffect, useState } from 'react';
import { View, Text } from '@tencent/hippy-react-qb';
import { useInterval } from '../hooks/use-interval';

type TimeSpanProps = {
  time: string;
  style: Record<string, any>;
};

// 时间值小于10则在前面补0
const fillZero = (num: number): string => `${num}`.padStart(2, '0');

// 把时间转换成字符串
const transformTime = (time: number): string[] => {
  const hour = Math.floor(time / 3600);
  const minute = Math.floor((time % 3600) / 60);
  const second = time % 60;
  return [hour, minute, second].map(fillZero);
};

/** 时间片段 */
const TimeSpan = ({ time, style }: TimeSpanProps) => <Text style={style}>{time}</Text>;

type SpliterStyle = {
  wrap: Record<string, any>;
  dot: Record<string, any>;
};

type SpliterProps = {
  style: SpliterStyle;
};

/** 时间片段之间的分隔符 */
const TimeSpliter = ({ style }: SpliterProps) => <View style={style.wrap}>
  {[1, 2].map(key => <View
    key={key}
    style={[style.dot, { marginTop: key === 1 ? 0 : style.dot.marginTop }]}
  />)}
</View>;


export interface CountDownProps {
  /** 用于组件更新的key */
  key?: number;
  /** 剩余时间，单位秒 */
  remainTime: number;
  /** 样式 */
  styles: {
    wrap: Record<string, any>;
    time: Record<string, any>;
    spliter: SpliterStyle;
  }
  /** 倒计时结束事件 */
  onTimeEnd?: () => void;
}

/** 倒计时组件 */
export const CountDown = ({ remainTime, styles, onTimeEnd }: CountDownProps) => {
  const [time, setTime] = useState(remainTime);

  // 倒计时
  useInterval(() => setTime(time - 1), time > 0 ? 1000 : null);

  // 触发倒计时完成事件
  useEffect(() => {
    if (time <= 0) onTimeEnd?.();
  }, [time]);

  const [hour, minute, second] = transformTime(time);
  return <View style={[styles.wrap, {}]}>
    <TimeSpan key={`${hour}_${second}`} style={styles.time} time={hour} />
    <TimeSpliter style={styles.spliter} />
    <TimeSpan key={`${hour}_${minute}_${second}`} style={styles.time} time={minute} />
    <TimeSpliter style={styles.spliter} />
    <TimeSpan style={styles.time} time={second} />
  </View>;
};
