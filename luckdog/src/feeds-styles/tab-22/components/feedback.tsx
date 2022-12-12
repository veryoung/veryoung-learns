import React, { Component } from 'react';
import { View, StyleSheet, Modal, Image, Text } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@/luckbox';
import { ConstantUtils } from '../../common/utils';
import FeedsTheme from '../../../framework/FeedsTheme';
import FeedsIcon from '../../../framework/FeedsIcon';

export enum FeedsSourceType {
  /** 未知类型反馈 */
  UnknownFeedBack = 0,
  /** 书籍类反馈 */
  BookFeedBack = 1,
}

/** 负反馈props */
interface Props {
  visible: boolean;
  onClose?: () => void;
  itemClick?: (type: FeedBackType) => void;
}

/** 负反馈类型 */
enum FeedBackType {
  /** 不感兴趣 */
  NOTINTEREST = 'NotInterest',
  /** 之前读过了 */
  ALREDYREAD = 'AlreadyRead',
  /** 质量差 */
  LOWQUALITY = 'LowQuality'
}

/** 负反馈配置 */
interface FeedBackConfig {
  /** 反馈名 */
  name: string;
  /** 反馈类型 */
  type: FeedBackType;
  /** 反馈类型图标 */
  url: string
}
/** 模块关键字 */
const FEED_BACK = 'feedBack';
/** 半屏宽度 */
const WEB_PAGE_WIDTH = (ConstantUtils.getScreenWidth() / 750) * 590;
/** 支持负反馈的内容 */
const FEED_TYPE: FeedBackConfig[] = [{
  name: '不感兴趣',
  type: FeedBackType.NOTINTEREST,
  url: FeedsIcon.notInterest,
}, {
  name: '看过了',
  type: FeedBackType.ALREDYREAD,
  url: FeedsIcon.alreadyRead,
}, {
  name: '质量差',
  type: FeedBackType.LOWQUALITY,
  url: FeedsIcon.lowQuality,
}];

@FeedsProtect.protect
export default class FeedBack extends Component<Props> {
  private isShowed = false; // 是否展示了弹窗（针对iOS有效）
  public constructor(props: Props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, FEED_BACK);
  }
  public render() {
    countReRender(this, FEED_BACK);
    const { visible } = this.props;
    return (
      <Modal
        animationType="fade"
        supportedOrientations={['portrait']}
        transparent
        visible={visible && !this.isShowed}
      >
        <View style={styles.mask} onClick={this.onClickClose} >
          <View style={styles.container}>
            {
              FEED_TYPE.map(item => this.renderFeedBackItem(item))
            }
          </View>
        </View>
      </Modal>
    );
  }

  /** 选择一项反馈 */
  private chooseFeedBack = (type: FeedBackType) => {
    const { itemClick } = this.props;
    itemClick?.(type);
  };

  /** 渲染负反馈单个内容 */
  private renderFeedBackItem = (item: FeedBackConfig) => <View
    key={item.name}
    onClick={() => this.chooseFeedBack(item.type)}
    style={styles.itemContainer}
  >
    <Image
      style={styles.icon}
      source={item.url}
      noPicMode={{ enable: false }}
      reportData={{ sourceFrom: FEED_BACK }}
    />
    <Text>{item.name}</Text>
  </View>;

  /** 点击按钮根据按钮类型执行对应操作 */
  private onClickClose = () => {
    const { onClose } = this.props;
    onClose?.();
  };
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColors: ['rgba(0,0,0,0.4)'],
  },
  container: {
    width: WEB_PAGE_WIDTH,
    flexDirection: 'column',
    backgroundColors: FeedsTheme.SkinColor.D2_1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  itemContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    height: 24,
    width: 24,
    marginRight: 12,
  },
});
