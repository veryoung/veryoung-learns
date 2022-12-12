/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import React, { Component } from 'react';
import { View, Image, Text, Modal, StyleSheet } from '@tencent/hippy-react-qb';
import { shouldComponentUpdate, countReRender, OpInfoType, getDeviceVisitor } from '@/luckbox';
import { FeedsUIStyle } from '../../feeds-styles/tab-22/components/utils';
import FeedsIcon from '../../framework/FeedsIcon';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsUtils from '../../framework/FeedsUtils';
import { FSOpContentItem, getFSPopPresenter } from '@/presenters';
import { BusiKey, reportUDS, logError } from '@/luckdog';
import { STRICT_EXPOSE_DELAY } from '../../framework/FeedsConst';
import { CommonProps } from '../../entity';

const TAG = 'RedPack';
let exposeTimer; // 严口径上报定时器

const { width } = FeedsUtils.getScreen();
const pr = width / 375;

interface Props extends CommonProps {
  redPackInfo: FSOpContentItem;
  visible: boolean;
  onClose?: () => void;
}

enum RedpackEnum {
  SingleBook = '0',
  MultiBook = '1'
}

// 素材额外信息
interface IExtInfo {
  redPackType: RedpackEnum
  coverUrlBook1?: string
  coverUrlBook2?: string
  coverUrlBook3?: string
  nameBook1?: string
  nameBook2?: string
  nameBook3?: string
  toUrlBook1?: string
  toUrlBook2?: string
  toUrlBook3?: string
  authorBook1?: string
  authorBook2?: string
  authorBook3?: string
}
export interface RedPackInfo {
  /** 点击后跳转的url */
  toUrl: string;
  /** 标题 */
  title: string;
  /** 子标题 */
  subTitle: string;
  /** 红包价值 */
  price: string;
  /** 红包封面 */
  coverUrl: string;
  /** 顶部居中的banner标题 */
  bannerTitle?: string;
  /** 包含金额和单位的配置项, 如100元 */
  wording?: string;
  extInfo?: IExtInfo
}

@FeedsProtect.protect
export default class RedPack extends Component<Props> {
  visible = true;
  hasStrictExposed = false; // 是否严口径上报过
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'RedPack');
  }

  UNSAFE_componentWillMount() {
    const { coverUrl = '' } = this.props.redPackInfo.opInfo as RedPackInfo;
    Image.prefetch(coverUrl);
    Image.prefetch(FeedsIcon.roundCloseIcon);
  }

  componentWillUnmount() {
    this.clearExposeTimer();
  }

  public render() {
    countReRender(this, 'RedPack');

    const { visible = false, onClose } = this.props;
    const { coverUrl = '' } = this.props.redPackInfo.opInfo as RedPackInfo;
    if (!coverUrl) return null;
    return (
      <Modal
        animationType="fade"
        onRequestClose={onClose}
        supportedOrientations={['portrait']}
        transparent
        visible={visible}
        onAttachedToWindow={this.onAttachedToWindow}
      >
        <View style={[styles.container]}>
          { this.renderContainer() }
          <View style={{ marginTop: 32 }} onClick={this.onClickClose}>
            <Image
              style={{
                width: 40,
                height: 40,
              }}
              source={{ uri: FeedsIcon.roundCloseIcon }}
              noPicMode={{ enable: false }}
              reportData={{ sourceFrom: 'RedPack' }}
            />
          </View>
        </View>
      </Modal>
    );
  }

  /** 渲染红包中的价格部分，如果下发的字段中存在wording，使用wording中的文案；否则使用price字段，展示【xxx元】 */
  private renderWording = (isMultiBookUI: boolean) => {
    const { wording = '', price } = this.props.redPackInfo.opInfo as RedPackInfo;
    if (!wording && !price) {
      return null;
    }
    if (wording) {
      return (
        <View style={styles.wordView}>
          <Text style={styles.wordValue} numberOfLines={1}>{wording}</Text>
        </View>
      );
    }
    return price ? (
      <View style={styles.priceView}>
        <Text style={isMultiBookUI ? styles.priceValueMulti : styles.priceValue} numberOfLines={1}>{price}</Text>

        <View style={styles.priceTipsView}>
          <View style={ styles.priceTipsBg}>
            <Text style={styles.priceTips}>最高</Text>
          </View>
          <Text style={ isMultiBookUI ? styles.priceUnitMulti : styles.priceUnit}>元</Text>
        </View>
      </View>
    ) : null;
  };

  private RenderMultiBook = () => {
    const { extInfo } = this.props.redPackInfo.opInfo as RedPackInfo;


    return <View style={styles.multiBooksView} >
      <View style={styles.multiBookWrapper} onClick={ () => this.openRedPackByBook(extInfo?.toUrlBook1)}>
        <Image
          style={ styles.multiBookCover}
          source={{ uri: extInfo?.coverUrlBook1 }}
          noPicMode={{ enable: false }}
          reportData={{ sourceFrom: 'RedPack' }}
        />
        <Text style={styles.multiBookTitle}>{ extInfo?.nameBook1}</Text>
        <Text style={styles.multiBookAuthor}>{ extInfo?.authorBook1}</Text>
      </View>
      <View style={ styles.multiBookWrapper} onClick={ () => this.openRedPackByBook(extInfo?.toUrlBook2)}>
        <Image
          style={ styles.multiBookCover}
          source={{ uri: extInfo?.coverUrlBook2 }}
          noPicMode={{ enable: false }}
          reportData={{ sourceFrom: 'RedPack' }}
        />
        <Text style={styles.multiBookTitle}>{ extInfo?.nameBook2}</Text>
        <Text style={styles.multiBookAuthor}>{ extInfo?.authorBook2}</Text>
      </View>
      <View style={ styles.multiBookWrapper} onClick={ () => this.openRedPackByBook(extInfo?.toUrlBook3)}>
        <Image
          style={ styles.multiBookCover}
          source={{ uri: extInfo?.coverUrlBook3 }}
          noPicMode={{ enable: false }}
          reportData={{ sourceFrom: 'RedPack' }}
        />
        <Text style={styles.multiBookTitle}>{ extInfo?.nameBook3}</Text>
        <Text style={styles.multiBookAuthor}>{ extInfo?.authorBook3}</Text>
      </View>
    </View>
    ;
  };

  /** 渲染红包主体 */
  private renderContainer = () => {
    const {
      title = '',
      subTitle = '',
      coverUrl = '',
      wording = '',
      extInfo,
    } = this.props.redPackInfo.opInfo as RedPackInfo;

    const isMultiBookUI = extInfo?.redPackType === RedpackEnum.MultiBook;

    const wordStyle = isMultiBookUI ? styles.wordTxtSubMulti : styles.wordTxtSub;
    const subTitleStyle = isMultiBookUI ? styles.txtSubMulti : styles.txtSub;
    return (
      <View
        style={isMultiBookUI ? styles.redPackContainerMulti : styles.redPackContainer}
        onClick={!isMultiBookUI ? this.openRedPack : undefined}
      >
        <Image
          style={isMultiBookUI ? styles.bgMulti : styles.bg}
          source={{ uri: coverUrl }}
          noPicMode={{ enable: false }}
          reportData={{ sourceFrom: 'RedPack' }}
          resizeMode='contain'
        />
        <View style={isMultiBookUI ? styles.txtBlockMulti : styles.txtBlock}>
          {title ? <Text style={isMultiBookUI ? styles.textMainMulti : styles.txtMain}>{title}</Text> : null}

          {this.renderWording(isMultiBookUI)}
          {subTitle ? <Text style={wording ? wordStyle : subTitleStyle}>{subTitle}</Text> : null}
          {isMultiBookUI ? this.RenderMultiBook() : null}
        </View>
      </View>
    );
  };

  /** 清除定时器 */
  private clearExposeTimer = () => {
    if (exposeTimer) {
      clearTimeout(exposeTimer);
    }
  };

  /** 上报到 UG 后台 */
  private reportUG = async (url: string): Promise<void> => {
    try {
      const { guid, qua2, qua } = await getDeviceVisitor().isReady();
      fetch(url, {
        headers: {
          'q-guid': guid,
          'q-ua': qua2 || qua,
        },
      });
    } catch (err) {
      logError(err, `${TAG}.reportUG`);
    }
  };

  /**
   * @desc 多本书的点击跳转事件
   *
   */
  private openRedPackByBook = (openUrl) => {
    this.suppReportExpose();

    if (!openUrl) return;

    FeedsUtils.doLoadUrl(openUrl, '22', false);

    const { itemBean = {} } = this.props.redPackInfo;

    const { udsEventInfo = {} } = itemBean;
    // 点击上报到灯塔
    reportUDS(BusiKey.CLICK__RED_PACK, { itemBean }, { ...udsEventInfo, ext_data1: encodeURIComponent(openUrl) });
  };

  /** 点击红包跳转 */
  private openRedPack = () => {
    this.suppReportExpose();

    const { onClose } = this.props;
    const { itemBean = {} } = this.props.redPackInfo;
    const { udsEventInfo = {}, clickUrl } = itemBean;

    // 上报到 UG 后台
    clickUrl && this.reportUG(clickUrl);

    const { toUrl = '' } = this.props.redPackInfo.opInfo as RedPackInfo;
    FeedsUtils.doLoadUrl(toUrl, '22', false);
    onClose?.();
    // 点击上报到灯塔
    reportUDS(BusiKey.CLICK__RED_PACK, { itemBean }, { ...udsEventInfo });
  };

  /**
   * 上屏事件
   * 1. 宽口径wide_expose事件曝光到uds
   * 2. 严口径1s之后曝光事件上报到uds和venus
   */
  private onAttachedToWindow = () => {
    this.hasStrictExposed = false;

    const { itemBean = {} } = this.props.redPackInfo;
    const { udsEventInfo = {}, showUrl } = itemBean;

    // 上报到 UG 后台
    showUrl && this.reportUG(showUrl);

    // 宽口径曝光上报到灯塔
    reportUDS(BusiKey.WIDE_EXPOSE__CARD, { itemBean }, { ...udsEventInfo });

    // 严口径上报
    this.reportStrictExpose(true);

    // 写入缓存已经曝光过，之后不再曝光
    getFSPopPresenter().updateCachedExposedTime(OpInfoType.NEWUSER_RED_PACK);
  };

  /** 严口径曝光上报 */
  private strictExpose = () => {
    const { itemBean = {} } = this.props.redPackInfo;
    const { udsEventInfo = {} } = itemBean;

    // 严口径上报到灯塔
    reportUDS(BusiKey.EXPOSE__RED_PACK, { itemBean }, { ...udsEventInfo });
    this.hasStrictExposed = true;
  };

  /**
   * 严口径曝光上报
   * @param {boolean} isDelay 是否需要延迟1s上报
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

  /** 点击补报曝光 */
  private suppReportExpose = () => {
    if (!this.hasStrictExposed) {
      this.reportStrictExpose(false);
    }
  };

  /** 点击关闭红包 */
  private onClickClose = () => {
    // 补报曝光
    this.suppReportExpose();

    const { onClose } = this.props;
    const { itemBean = {} } = this.props.redPackInfo;
    const { udsEventInfo = {} } = itemBean || {};
    onClose?.();
    reportUDS(BusiKey.CLICK__RED_PACK_CLOSE, { itemBean }, { ...udsEventInfo });
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColors: ['rgba(0,0,0,0.4)'],
  },
  redPackContainer: {
    width: 267 * pr,
    height: 360 * pr,
    alignItems: 'center',
  },
  redPackContainerMulti: {
    width: 260 * pr,
    height: 360 * pr,
    alignItems: 'center',
  },
  bg: {
    width: 267 * pr,
    flex: 1,
  },
  bgMulti: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 260 * pr,
    height: 360 * pr,
  },
  txtBlock: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 146,
    marginTop: 26 * pr,
  },
  txtBlockMulti: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 216,
    marginTop: 36,
  },
  txtMain: {
    fontSize: FeedsUIStyle.T3,
    colors: ['#FFE4C7'],
    marginBottom: 4,
  },
  textMainMulti: {
    fontSize: FeedsUIStyle.T3,
    colors: ['#E33D02'],
    marginBottom: 4,
  },
  txtSub: {
    fontSize: FeedsUIStyle.T2,
    colors: ['#FFE4C7'],
    marginBottom: 10,
  },
  txtSubMulti: {
    fontSize: FeedsUIStyle.T2,
    colors: ['#E33D02'],
    marginBottom: 10,
  },
  wordTxtSub: {
    fontSize: FeedsUIStyle.T3,
    colors: ['#FFE4C7'],
    marginBottom: 9,
  },
  wordTxtSubMulti: {
    fontSize: FeedsUIStyle.T3,
    colors: ['#E33D02'],
    marginBottom: 9,
  },
  priceView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  wordView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceValue: {
    fontSize: 50,
    colors: ['#FFE4C7'],
  },
  priceValueMulti: {
    fontSize: 50,
    colors: ['#E33D02'],
  },
  wordValue: {
    fontSize: 24,
    colors: ['#FFE4C7'],
  },
  priceUnit: {
    fontSize: FeedsUIStyle.T2,
    colors: ['#FFE4C7'],
    bottom: 10,
  },
  priceUnitMulti: {
    fontSize: FeedsUIStyle.T2,
    colors: ['#E33D02'],
    bottom: 10,
  },
  priceTipsView: {
  },
  priceTipsBg: {
    backgroundColors: ['#FFDB9E'],
    borderRadius: 3,
    bottom: 15,
    padding: 1,
  },
  priceTips: {
    fontSize: FeedsUIStyle.T0,
    colors: ['#E33D02'],
    textAlign: 'center',
  },
  multiBooksView: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  multiBookWrapper: {
    paddingHorizontal: 6 * pr,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiBookCover: {
    width: 68 * pr,
    height: 90 * pr,
  },
  multiBookTitle: {
    marginTop: 6,
    width: 60 * pr,
    fontSize: FeedsUIStyle.T0,
    lineHeight: 13 * pr,
    height: 26 * pr,
    colors: ['#333333'],
    textAlign: 'center',
  },
  multiBookAuthor: {
    marginTop: 3,
    width: 60 * pr,
    textAlign: 'center',
    fontSize: FeedsUIStyle.SMALL_1,
    colors: ['#A6A6A6'],
  },
});
