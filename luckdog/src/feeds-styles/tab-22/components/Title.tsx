// UI8的title信息，包括title和右边的快链
import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
} from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsLineHeight, FeedsTheme } from './utils';
import FeedsIcon from '../../../framework/FeedsIcon';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { getWidthHeight } from '../../../framework/utils/device';
import { strictExposeReporter } from '@/luckdog';
import { CLICK_STEP } from '../../../framework/FeedsConst';
import { throttle } from '@/luckbox';
import { CommonProps, RightLink } from '../../../entity';

const windowWidth = getWidthHeight().width;
const titleMaxWidth = ((windowWidth - 24) / 4) * 3;

const styles = StyleSheet.create({
  arrow: {
    height: 9,
    width: 5,
    marginLeft: 4,
    tintColors: FeedsTheme.SkinColor.N1,
  },
  box: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
  },
  moreStr: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
  },
  moreView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: FeedsUIStyle.FEED_TITLE_HEIGHT,
    paddingTop: FeedsUIStyle.FEED_TITLE_HEIGHT,
    position: 'relative',
  },
  redDot: {
    height: 5,
    width: 5,
    borderRadius: 2.5,
    backgroundColors: FeedsTheme.LiteColor.B2,
    marginRight: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: FeedsUIStyle.T3,
    fontWeight: 'bold',
    lineHeight: FeedsLineHeight.T3,
    paddingBottom: FeedsUIStyle.FEED_TITLE_HEIGHT,
    paddingTop: FeedsUIStyle.FEED_TITLE_HEIGHT,
    maxWidth: titleMaxWidth,
  },
});

interface TitleProps extends CommonProps {
  /** 标题 */
  title?: string;
  /** 右上角跳转 */
  right?: RightLink;
  /** 是否展示换一换 */
  changeable?: boolean;
  /** 是否显示红点 */
  showDot?: boolean;
  /** 右上角跳转自定义样式 */
  moreTextStyle?: Record<string, any>;
  /** 标题自定义样式 */
  titleStyle?: Record<string, any>;
  /** 点击上报 */
  doBeaconByClick?: () => void;
  /** 点击换一换 */
  switchNovel?: () => void;
  /** 点击右上角事件 */
  rightClick?: () => void;
  /** 不需要补报曝光 */
  noExposeAddition?: boolean;
}

export class Title extends React.Component {
  public props!: TitleProps;
  public state: {
    hasClick: boolean;
  };

  public handleClick = throttle(() => {
    const { parent = {}, right, doBeaconByClick } = this.props;
    this.setState({ hasClick: true });
    doBeaconByClick?.();
    parent.loadUrl?.(right?.sUrl);
  }, CLICK_STEP);

  public constructor(props: any) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'Title');
    this.state = {
      hasClick: false,
    };
  }

  public handleClickChange = () => {
    const { doBeaconByClick, switchNovel } = this.props;
    doBeaconByClick?.();
    switchNovel?.();
  };

  /**
 * 展示：假使用户我的收藏书籍中有任一书籍保持在更新状态且不外露在首屏，则查看全部红点会展示
   消失：假使用户我的收藏书籍中所有书籍都不再更新状态，或主动点击了查看全部红点后，查看全部红点会消失
 */
  public render() {
    countReRender(this, 'Title');
    const {
      title = '',
      right,
      changeable,
      showDot,
      moreTextStyle = {},
      titleStyle = {},
      rightClick,
      noExposeAddition,
    } = this.props || {};
    let link;
    const { hasClick } = this.state;
    const rightClickHandler = rightClick ? rightClick : this.handleClick;

    if (right?.sUrl) {
      let redDot;
      if (showDot && !hasClick) {
        redDot = <View style={styles.redDot} />;
      }
      link = (
        <View
          className='right-view'
          style={styles.moreView}
          onClick={noExposeAddition ? rightClickHandler : strictExposeReporter.triggerExpoCheck(rightClickHandler)}
        >
          {redDot}
          <Text style={[styles.moreStr, moreTextStyle]} numberOfLines={1}>
            {right.sText}
          </Text>
          <Image
            source={{ uri: FeedsIcon.novel_card_arrow }}
            style={styles.arrow}
            noPicMode={{ enable: false }}
          />
        </View>
      );
    } else if (changeable) {
      link = (
        <View className='change-view' style={styles.moreView} onClick={strictExposeReporter.triggerExpoCheck(this.handleClickChange)}>
          <Text style={[styles.moreStr, moreTextStyle]} numberOfLines={1}>
            换一换
          </Text>
        </View>
      );
    }
    return (
      <View
        style={styles.box}
        onLayout={event => this.props.onLayout?.(event)}
      >
        <Text style={[styles.txt, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {link}
      </View>
    );
  }
}
