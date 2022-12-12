import { Animation, AnimationSet } from '@tencent/hippy-react-qb';

// 动画效果参考 https://animate.style/
// https://github.com/animate-css/animate.css/tree/master/source

/**
 * 先放大再缩小动画
 * @param {放大缩小半程速度} duration
 * @param {放大倍数} time
 */
export const scale = (duration = 150, time = 1.01) => new AnimationSet({
  children: [
    {
      animation: new Animation({
        mode: 'timing',
        startValue: 1,
        toValue: time,
        duration,
        timingFunction: 'ease_bezier', // 动画缓动函数
      }), follow: true, // 配置子动画的执行是否跟随执行
    },
    {
      animation: new Animation({
        mode: 'timing',
        startValue: time,
        toValue: 1,
        duration,
        timingFunction: 'ease_bezier', // 动画缓动函数
      }), follow: true,
    },
  ],
});

/**
 * 淡入
 * @param {淡入速度}} duration
 */
export const fadeIn = (duration = 150) => new Animation({
  mode: 'timing',
  startValue: 0,
  toValue: 1,
  duration,
  timingFunction: 'ease_bezier',
});
