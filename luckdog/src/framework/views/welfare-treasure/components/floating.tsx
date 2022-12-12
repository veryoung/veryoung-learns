import React from 'react';
import { View, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';

import { CountDown } from '@/components/count-down';
import { WelfarePendantShowType } from '@/presenters/welfare-floating-controller';

import { callbackWrap } from '../utils';
import { SHOWABLE_STATUS, TreasureStatus } from '../constant';
import { TreasureContext } from '../types';
import source from '@/framework/FeedsIcon';
import { getDeviceVisitor } from '@/luckbox';
import FeedsTheme from '@/framework/FeedsTheme';

interface Props {
  context: TreasureContext;
  onClick: (context: TreasureContext) => any;
  onClose: (context: TreasureContext) => any;
}

const IMAGES = source.welfareTreasure;
const isAndroid = getDeviceVisitor().isAdr();

const countDownStyles = {
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
    width: 56,
    height: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  time: {
    height: 20,
    lineHeight: 18,
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'PingFangSC-Semibold',
    colors: FeedsTheme.SkinColor.A5,
  },
  spliter: {
    wrap: { width: 3, justifyContent: 'center', alignItems: 'center' },
    dot: { width: 1.5, height: 1.5, borderRadius: 1, backgroundColors: FeedsTheme.SkinColor.A5, marginTop: 2 },
  },
};

/**
 * 倒计时结束回调
 */
const onTimeEnd = async ({ setState }: TreasureContext) => {
  // 预加载解冻动效图片
  // await preloadImg(UNFREEZE_FRAME);

  setState({
    status: TreasureStatus.ENABLED,
    isUnfreeze: true,
  });
};

/**
 * 悬浮挂件提示文案
 */
const getFloatingTip = (context: TreasureContext) => {
  const { state } = context;
  const { status, coolingTime } = state;

  const strategies = {
    [TreasureStatus.ENABLED]: <Text style={styles.tip}>开福袋</Text>,
    [TreasureStatus.DISABLED]: <Text style={styles.tip}>明日再来</Text>,
    [TreasureStatus.COOLING]: (
      <CountDown
        key={coolingTime}
        remainTime={coolingTime}
        styles={countDownStyles}
        onTimeEnd={() => onTimeEnd(context)}
      />
    ),
  };

  return strategies[status];
};

/**
 * 悬浮挂件样式
 */
const getFloatingStyle = (context: TreasureContext) => {
  const styleList: Record<string, any>[] = [styles.floating];
  const { props: { showType } } = context;

  if (showType === WelfarePendantShowType.ASIDE) {
    styleList.push(styles.floatingAside);
  }

  if (showType === WelfarePendantShowType.HIDDEN) {
    styleList.push(styles.floatingHidden);
  }

  // iOS 夜间模式适配
  if (FeedsTheme.isNightMode() && !isAndroid) {
    styleList.push({ opacity: 0.7 });
  }

  return styleList;
};

export const Floating = (props: Props) => {
  const { context, onClick, onClose } = props;
  const { state: { status } } = context;

  // 非可展示状态时，不展示福袋
  if (!SHOWABLE_STATUS.includes(status)) return null;

  return (
    <View style={getFloatingStyle(context)} onClick={callbackWrap(() => onClick(context))}>
      <Image
        style={styles.icon}
        source={IMAGES.floating}
        noPicMode={{ enable: false }}
        nightMode={{ enable: isAndroid }}
      ></Image>
      <View style={styles.tipBox}>
        <Image
          style={styles.tipBg}
          source={IMAGES.floatingBtn}
          noPicMode={{ enable: false }}
          nightMode={{ enable: isAndroid }}
        ></Image>
        {getFloatingTip(context)}
      </View>
      <Image
        style={styles.close}
        source={IMAGES.floatingClose}
        onClick={callbackWrap(() => onClose(context))}
        noPicMode={{ enable: false }}
        nightMode={{ enable: isAndroid }}
      ></Image>
    </View>
  );
};

// css
const styles = StyleSheet.create({
  floating: {
    display: 'block',
    position: 'absolute',
    zIndex: 2,
    right: 13,
    bottom: 110,
    width: 90,
    height: 90,
  },
  floatingAside: {
    right: -51,
    opacity: 0.5,
  },
  floatingHidden: {
    display: 'none',
  },
  icon: {
    width: 90,
    height: 90,
  },
  tipBox: {
    position: 'absolute',
    left: 17,
    bottom: 9,
    width: 56,
    height: 20,
  },
  tipBg: {
    width: 56,
    height: 20,
  },
  tip: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 2,
    width: 56,
    height: 20,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'PingFangSC-Semibold',
    fontSize: 10,
    colors: FeedsTheme.SkinColor.A5,
  },
  close: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 14,
    height: 14,
  },
});
