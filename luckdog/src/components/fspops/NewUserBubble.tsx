import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, Animation, AnimationSet } from '@tencent/hippy-react-qb';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { ConstantUtils } from '../../feeds-styles/common/utils';
import { FeedsTheme, FeedsUIStyle } from '../../feeds-styles/tab-22/components/utils';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, BusiKey } from '@/luckdog';
import { OpInfoType } from '@/luckbox';
import { getFSPopPresenter } from '@/presenters';
import { STRICT_EXPOSE_DELAY } from '../../framework/FeedsConst';
import { CommonProps } from '../../entity';

const SCREEN_WIDTH = ConstantUtils.getScreenWidth();

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
    left: ((SCREEN_WIDTH * 3) / 10) - 60,
    bottom: 0,
    alignItems: 'center',
  },
  main: {
    width: 120,
    height: 115,
    backgroundColors: FeedsTheme.SkinColor.A2,
    borderRadius: 8,
    alignItems: 'center',
  },
  img: {
    height: 50,
    width: 100,
    marginTop: 5,
  },
  txt: {
    colors: FeedsTheme.SkinColor.A5,
    fontSize: FeedsUIStyle.T2_5,
    lineHeight: 24,
    textAlign: 'center',
  },
  arrow: {
    top: -1,
    height: 6,
    borderStyle: 'solid',
    borderWidth: 6,
    borderTopColors: FeedsTheme.SkinColor.A2,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

let exposeTimer; // 严口径上报定时器

interface Props extends CommonProps {
  bubbleInfo: any;
  onClose: () => void;
}

@FeedsProtect.protect
export default class NewUserBubble extends Component<Props> {
  private floatAnimation: any;

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'NewUserBubble');
    this.floatAnimation = new AnimationSet({
      children: [
        {
          animation: new Animation({
            startValue: 0,
            toValue: -8,
            duration: 800,
            delay: 0, // 至动画真正开始的延迟时间
            timingFunction: 'ease-out', // 动画缓动函数
          }),
        },
        {
          animation: new Animation({
            startValue: -8,
            toValue: 0,
            duration: 800,
            delay: 0, // 至动画真正开始的延迟时间
            timingFunction: 'ease-out', // 动画缓动函数
          }), follow: true,
        },
      ],
      repeatCount: 3,
    });
  }

  public componentDidMount() {
    const { onClose } = this.props;
    this.floatAnimation.start();
    setTimeout(() => onClose(), 5000); // 三个完整浮动动画后自动消失
  }

  public componentWillUnmount() {
    this.floatAnimation.destroy();
    this.clearExposeTimer();
  }

  /** 清除定时器 */
  public clearExposeTimer = () => {
    if (exposeTimer) {
      clearTimeout(exposeTimer);
    }
  };

  /**
   * 上屏事件，1. 宽口径曝光上报到uds 2. 严口径曝光上报到uds和venus
   */
  public onAttachedToWindow = () => {
    const { bubbleInfo = {} } = this.props;
    const { itemBean = {} } = bubbleInfo;
    // 宽口径曝光上报到灯塔
    reportUDS(BusiKey.WIDE_EXPOSE__CARD, { itemBean });

    // 严口径上报
    this.clearExposeTimer();
    exposeTimer = setTimeout(() => {
      // 严口径曝光上报到灯塔
      reportUDS(BusiKey.EXPOSE__NEW_USER_BUBBLE, { itemBean });
    }, STRICT_EXPOSE_DELAY);

    // 记录是否曝光过，曝光过之后不再出现
    getFSPopPresenter().updateCachedExposedTime(OpInfoType.NEW_USER_BUBBLE);
  };

  public render() {
    countReRender(this, 'NewUserBubble');
    const { texts = [], img = '' } = this.getBubbleInfo();
    if (!img && !texts) return null;

    img && Image.prefetch(img);
    const [text1, text2] = texts.length > 1 && texts;
    return (
      <View
        style={[styles.container, { transform: [{ translateY: this.floatAnimation }] }]}
        onClick={() => false}
        onAttachedToWindow={ this.onAttachedToWindow }
      >
        <View style={styles.main}>
          <Image
            style={styles.img}
            source={{ uri: img }}
          />
          <Text style={styles.txt}>{ text1 || '' }</Text>
          <Text style={styles.txt}>{ text2 || '' }</Text>
        </View>
        <View style={styles.arrow}></View>
      </View>
    );
  }

  /** 获得气泡内容数据 */
  private getBubbleInfo = () => {
    const { bubbleInfo = {} } = this.props;
    const { opInfo = {} } = bubbleInfo;
    return opInfo;
  };
}
