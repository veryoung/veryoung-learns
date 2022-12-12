/* eslint-disable react-native/no-unused-styles */
import React, { Component } from 'react';
import { View, Image, Text, StyleSheet, Modal } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender, OpPopBtnData, OpPopBtnActionType } from '@/luckbox';
import { ConstantUtils } from '../../feeds-styles/common/utils';
import { FeedsTheme, FeedsUtils } from '../../feeds-styles/tab-22/components/utils';
import { reportUDS, BusiKey } from '@/luckdog';
import { STRICT_EXPOSE_DELAY } from '../../framework/FeedsConst';
import { FSOpContentItem } from '@/presenters';

/** 书籍信息 */
interface Book {
  picUrl: string;
  bookName: string;
  jumpUrl: string;
  resId: string;
}

/** 半屏弹窗props类型 */
interface OpHalfPopUpProps {
  globalConf: any;
  halfPopInfo?: FSOpContentItem;
  visible: boolean;
  onClickClose: (book: Book) => void;
  onClick: () => void;
}

const windowWidth = ConstantUtils.getScreenWidth();
const popUpWidth = windowWidth - (10 * 2);
const coverWidth = (120 * windowWidth) / 750;
const coverHeight = (coverWidth * 160) / 120;
const OP_HALF_POPUP_TAG = 'OpHalfPopUp';
let exposeTimer: NodeJS.Timeout; // 严口径上报定时器

/**
 * 半屏弹窗
 * 主要功能： 1. 展示书籍 2. 存在点击跳转、点击关闭的按钮
 */
@FeedsProtect.protect
export default class OpHalfPopUp extends Component<OpHalfPopUpProps> {
  private hasStrictExposed = false; // 是否严口径上报过

  public constructor(props: OpHalfPopUpProps) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, OP_HALF_POPUP_TAG);
  }

  public UNSAFE_componentWillMount() {
    const { picUrl } = this.getPopUpInfo();
    picUrl && Image.prefetch(picUrl);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: OpHalfPopUpProps) {
    const { halfPopInfo: { opInfo: { picUrl = '' } = {} as any } = {} } = nextProps || {};
    const oldPicUrl = this.getPopUpInfo()?.picUrl;
    if (picUrl && picUrl !== oldPicUrl) {
      Image.prefetch(picUrl);
    }
  }

  public componentWillUnmount() {
    this.clearExposeTimer();
  }

  public render() {
    countReRender(this, OP_HALF_POPUP_TAG);

    const { visible = false, onClick } = this.props;
    const { title = '' } = this.getPopUpInfo();

    return (
      <Modal
        animationType="fade"
        visible={visible}
        onRequestClose={() => onClick?.()}
        supportedOrientations={['portrait']}
        transparent
      >
        <View style={styles.container}>
          <View
            style={[styles.popContainer]}
            onAttachedToWindow={this.onAttachedToWindow}
          >
            {!title ? null : (<View>
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            </View>)}
            {this.renderContentBlock()}
            {this.renderBtnBlock()}
          </View>
        </View>
      </Modal>
    );
  }

  /** 清除定时器 */
  private clearExposeTimer = () => {
    if (exposeTimer) {
      clearTimeout(exposeTimer);
    }
  };

  /** 获得弹窗内容数据 */
  private getPopUpInfo = (): any => {
    const { halfPopInfo: { opInfo = {} } = {} } = this.props;
    return opInfo;
  };

  /** 获得上报数据 */
  private getItemBean = () => {
    const { halfPopInfo: { itemBean = {} } = {} } = this.props;
    return itemBean;
  };

  /** 上屏事件，进行曝光上报 */
  private onAttachedToWindow = () => {
    this.hasStrictExposed = false;
    const itemBean = this.getItemBean();

    // 宽口径曝光上报到灯塔
    reportUDS(BusiKey.WIDE_EXPOSE__CARD, { itemBean } as any);
    // 严口径上报
    this.reportStrictExpose(true);
  };

  /** 严口径曝光上报 */
  private strictExpose = () => {
    const itemBean = this.getItemBean();

    // 严口径曝光上报到灯塔
    reportUDS(BusiKey.EXPOSE__HALF_SCREEN_POP, { itemBean } as any);
    this.hasStrictExposed = true;
  };

  /**
   * 严口径上报曝光
   * @param isDelay 是否需要延迟1s上报
   */
  private reportStrictExpose = (isDelay = true) => {
    this.clearExposeTimer();
    if (isDelay) {
      exposeTimer = setTimeout(() => {
        this.strictExpose();
      }, STRICT_EXPOSE_DELAY);
    } else {
      this.strictExpose();
    }
  };

  /** 点击按钮根据按钮类型执行对应跳转/收藏操作 */
  private onClickBtn = (btn: OpPopBtnData) => {
    if (!this.hasStrictExposed) {
      this.reportStrictExpose(false);
    }

    const { actionType } = btn;

    switch (actionType) {
      case OpPopBtnActionType.JUMP:
        this.onClickReadBtn(btn);
        break;
      case OpPopBtnActionType.CLOSE:
        this.onClickCloseBtn();
        break;
      default:
        break;
    }
  };

  /** 点击跳转阅读 */
  private onClickReadBtn = (btn: OpPopBtnData) => {
    const { onClick } = this.props;
    const { jumpUrl = '' } = btn;
    const itemBean = this.getItemBean();
    const { resId = '' } = this.getPopUpInfo();

    FeedsUtils.doLoadUrl(jumpUrl, '22', false, itemBean);
    onClick?.();

    // 点击上报到灯塔
    reportUDS(BusiKey.CLICK__HALF_SCREEN_POP_READ, { itemBean } as any, {
      book_id: resId,
      bigdata_contentid: '',
    });
  };

  /** 点击看看别的 */
  private onClickCloseBtn = () => {
    const { onClickClose } = this.props;
    const { picUrl = '', text: bookName = '', buttons = [], resId = '' } = this.getPopUpInfo();
    const itemBean = this.getItemBean();
    let jumpUrl = '';

    buttons.forEach((btn: OpPopBtnData) => {
      if (btn.actionType === OpPopBtnActionType.JUMP) {
        jumpUrl = btn.jumpUrl as string;
      }
    });

    onClickClose?.({
      picUrl,
      bookName,
      jumpUrl,
      resId,
    });

    // 点击上报到灯塔
    reportUDS(BusiKey.CLICK__HALF_SCREEN_POP_CLOSE, { itemBean } as any);
  };

  /** 弹窗中按钮部分 */
  private renderBtnBlock = () => {
    const { buttons = [] } = this.getPopUpInfo();
    const [btn1 = {}, btn2 = {}] = (buttons.length && buttons) || [];

    return (
      <View style={styles.btnBlock} >
        { !btn1 ? null : (<View style={styles[`${btn1.uiType}Btn`]} onClick={() => this.onClickBtn(btn1)}>
          <Text style={[styles.btnText, styles[`${btn1.uiType}BtnText`]]}>{btn1.text}</Text>
        </View>)}
        { !btn2 ? null : (<View style={styles[`${btn2.uiType}Btn`]} onClick={() => this.onClickBtn(btn2)}>
          <Text style={[styles.btnText, styles[`${btn2.uiType}BtnText`]]}>{btn2.text}</Text>
        </View>)}
      </View>
    );
  };

  /** 弹框中书籍内容部分 */
  private renderContentBlock = () => {
    const { picUrl = '', text = '', subText = '' } = this.getPopUpInfo();

    return (
      <View style={styles.bookContainer}>
        <View style={styles.bookCover}>
          <Image
            style={styles.coverImg}
            source={{ uri: picUrl }}
            noPicMode={{ enable: true }}
            reportData={{ sourceFrom: OP_HALF_POPUP_TAG }}
          />
        </View>
        <View style={styles.bookText}>
          {!text ? null : <Text style={styles.bookTitle} numberOfLines={2}>{text}</Text>}
          {!subText ? null : <Text style={styles.bookSubTitle} numberOfLines={1}>{subText}</Text>}
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    backgroundColors: ['rgba(0,0,0,0.4)'],
  },
  popContainer: {
    position: 'absolute',
    bottom: 32,
    width: popUpWidth,
    borderRadius: 30,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColors: FeedsTheme.SkinColor.D6,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  titleText: {
    lineHeight: 30,
    fontSize: 20,
    colors: FeedsTheme.SkinColor.N1,
  },

  bookContainer: {
    marginTop: 24,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: coverHeight,
  },
  bookCover: {
    marginRight: 14,
    width: coverWidth,
    height: coverHeight,
    borderRadius: 2,
    overFlow: 'hidden',
  },
  coverImg: {
    width: coverWidth,
    height: coverHeight,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColors: ['rgba(36,36,36,0.04)'],
  },
  bookText: {
    height: coverHeight,
    justifyContent: 'center',
  },
  bookTitle: {
    lineHeight: 18,
    fontSize: 16,
    colors: FeedsTheme.SkinColor.N1,
  },
  bookSubTitle: {
    marginTop: 12,
    lineHeight: 15,
    fontSize: 14,
    colors: FeedsTheme.SkinColor.A3,
  },

  btnBlock: {
    marginBottom: 22,
    flexDirection: 'column',
    alignItems: 'center',
  },
  btnText: {
    lineHeight: 22,
    fontSize: 18,
  },
  primaryBtn: {
    height: 48,
    width: popUpWidth - 60,
    borderRadius: 22.5,
    backgroundColors: FeedsTheme.SkinColor.B9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    colors: FeedsTheme.SkinColor.A5,
  },
  textBtn: {
    height: 18,
    justifyContent: 'center',
    marginTop: 18,
  },
  textBtnText: {
    colors: FeedsTheme.SkinColor.A3,
  },
});
