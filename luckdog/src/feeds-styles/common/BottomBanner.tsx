// 底部banner运营位
import React from 'react';
import { View, StyleSheet, Image } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { PicTextBtn } from '../tab-22/components/PicTextBtn';
import { FeedsIcon, FeedsUtils } from '../tab-22/components/utils';
import { colorDict, fixedTabId, fixedTabChildId, operationType, STRICT_EXPOSE_DELAY } from '../../framework/FeedsConst';
import { getWidthHeight } from '../../framework/utils/device';
import { reportUDS, BusiKey, addKeylink, KeylinkCmd } from '@/luckdog';
import FeedsTheme from '../../framework/FeedsTheme';
import { TabId, CommonProps } from '../../entity';

const TAG = 'BottomBanner';

const windowWidth = getWidthHeight().width;
const bannerWidth = windowWidth - 24;
const picHeight = (bannerWidth * 160) / 702;

const isBannerBook = type => type === operationType.BTM_BANNER_BOOK || type === operationType.BTM_RECORD_BOOK;
const isBannerPic = type => type === operationType.BTM_BANNER_PIC;

let exposeTimer; // 严口径上报定时器

interface Props extends CommonProps {
  bannerInfo: any;
  onClose?: () => void;
}

@FeedsProtect.protect
export default class BottomBanner extends React.Component<Props> {
  public hasStrictExposed = false; // 是否严口径上报过

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'BottomBanner');
  }

  public componentWillUnmount() {
    this.clearExposureTimer();
  }

  public doBeaconEvent = (eventName, moreData = {}) => {
    if (!eventName) return;
    const { globalConf: { curTabId = TabId.BOTTOM_RECOMM2 } } = this.props;
    const type = this.getBannerType();
    const itemBean = this.getItemBeanInfo();

    reportUDS(eventName, {
      tabId: curTabId === fixedTabId ? fixedTabChildId : curTabId,
      itemBean,
    }, {
      ext_data1: type, // 悬浮栏的类型 type
      ...moreData,
    });
  };

  /** 严口径曝光上报 */
  public strictExpose = () => {
    const { resourceId = '' } = this.getContentInfo();

    this.doBeaconEvent(BusiKey.EXPOSE__BOTTOM_BANNER, { // 严口径上报到uds
      bigdata_contentid: resourceId,
    });
    this.hasStrictExposed = true;
  };

  /**
   * 严口径上报
   * @param {boolean} isDelay 是否延迟1s进行上报
   */
  public doReportStrictExposure = (isDelay = true) => {
    this.clearExposureTimer();
    if (isDelay) {
      exposeTimer = setTimeout(() => {
        this.strictExpose();
      }, STRICT_EXPOSE_DELAY);
    } else {
      this.strictExpose();
    }
  };

  /**
   * 上屏事件
   * 功能：1. 宽口径wide_expose事件上报到uds;
   *      2. 严口径1s之后曝光事件上报到uds和venus
   */
  public onAttachedToWindow = () => {
    this.hasStrictExposed = false;
    const { resourceId = '' } = this.getContentInfo();

    // 曝光上报
    if (resourceId) {
      // 宽口径曝光上报到灯塔
      this.doBeaconEvent(BusiKey.WIDE_EXPOSE__CARD, {
        bigdata_contentid: resourceId,
      });

      // 严口径上报
      this.doReportStrictExposure(true);
    }
  };

  /** 清除定时器 */
  public clearExposureTimer = () => {
    exposeTimer && clearTimeout(exposeTimer);
  };

  /**
   * 点击补报严口径曝光
   * 如果点击时已经严口径曝光过，则不进行曝光上报；如果未严口径曝光过，则立即进行严口径曝光上报，无需延迟1s
   */
  public suppReportExpose = () => {
    if (!this.hasStrictExposed) {
      this.doReportStrictExposure(false);
    }
  };

  /** 点击关闭按钮 */
  public onClickClose = () => {
    this.suppReportExpose();

    const { onClose } = this.props;

    onClose?.();

    // 上报点击关闭事件
    this.doBeaconEvent(BusiKey.CLICK__BOTTOM_BANNER_CLOSE);
  };

  public getCloseBlock = () => {
    const type = this.getBannerType();
    const closeBlockStyle = isBannerBook(type) ? styles.closeBlock : styles.picCloseBlock;

    return (
      <View style={closeBlockStyle} onClick={this.onClickClose}>
        <Image
          source={{ uri: FeedsIcon.closeBtnIcon }}
          noPicMode={{ enable: false }}
          style={styles.closeBlock}
        />
      </View>
    );
  };

  public onClick = () => {
    this.suppReportExpose();

    const { onClose } = this.props;
    const { jumpUrl = '', resourceId } = this.getContentInfo();
    if (!jumpUrl) return;

    const type = this.getBannerType();

    // 上报点击事件
    const isBook = isBannerBook(type);
    this.doBeaconEvent(BusiKey.CLICK__BOTTOM_BANNER, {
      book_id: isBook ? resourceId : '',
      bigdata_contentid: isBook ? '' : resourceId,
    });

    // // 点击消失
    onClose?.();

    // 点击跳转
    FeedsUtils.doLoadUrl(jumpUrl, `${TabId.BOTTOM_RECOMM1}`);
  };

  public renderBookBanner = () => {
    const { globalConf = {} } = this.props;

    // 1. 获取书籍信息 是否独家免费、最新章节、bookid、书籍名称、封面地址、跳转地址、真实ch
    const { isExclusive = false, lastReadSerialId = 0, resourceId, resourceName = '', picUrl = '', jumpUrl = '', tagName = '' } = this.getContentInfo();
    if (!resourceId || !resourceName) {
      addKeylink('bottombanner-invalid-bookinfo', KeylinkCmd.PR_ERROR_SUM);
      addKeylink(`书籍信息缺失:${JSON.stringify({ resourceId, resourceName })}`, TAG);
      return null;
    }

    // 2. 设置显示数据
    const tagText = isExclusive ? '独家' : '';
    let subReadTitle = '';

    if (lastReadSerialId === 0) {
      subReadTitle = '未读';
    } else if (!lastReadSerialId) {
      subReadTitle = '';
    } else {
      subReadTitle = `上次读到第${lastReadSerialId}章`;
    }
    // 3. 展示卡片
    return (
      <View
        style={styles.container}
        onAttachedToWindow={this.onAttachedToWindow}
      >
        <View style={styles.left}>
          <PicTextBtn
            picUrl={picUrl}
            picTag={tagText}
            tagColors={colorDict[4]}
            btnUrl={jumpUrl}
            text={resourceName}
            subText={subReadTitle}
            btnText={'继续阅读'}
            hasSplit={false}
            parents={this}
            globalConf={globalConf}
            sResourceId={resourceId}
            style={styles.innerwraper}
            textStyle={styles.colorWhite}
            subTextStyle={styles.colorGray}
            picStyle={styles.bookPic}
            onClick={this.onClick}
            tags={tagName}
            showNewTag={tagName !== ''}
          />
        </View>
        {
          this.getCloseBlock()
        }
      </View>
    );
  };

  public renderPicBanner = () => {
    const { item_id: itemId = '' } = this.getItemBeanInfo();
    const { picUrl = '', jumpUrl = '' } = this.getContentInfo();
    if (!picUrl || !jumpUrl) return null;
    Image.prefetch(picUrl);
    return (
      <View
        style={[styles.container, styles.picBannerContainer]} onClick={this.onClick}
        onAttachedToWindow={this.onAttachedToWindow}
      >
        <Image
          source={{ uri: picUrl }}
          noPicMode={{ enable: true }}
          style={styles.bannerPic}
          reportData={{ sourceFrom: itemId }}
        />
        {
          this.getCloseBlock()
        }
      </View>
    );
  };

  /** 获取需要展示的书籍/图片信息 */
  public getContentInfo = () => {
    const { bannerInfo: { opInfo = {} } } = this.props;
    const { data = {} } = opInfo;
    return data;
  };

  /** 获取悬浮栏信息 */
  public getItemBeanInfo = () => {
    const { bannerInfo = {} } = this.props;
    const { itemBean = {} } = bannerInfo;
    return itemBean;
  };

  /** 获取悬浮栏类型 */
  public getBannerType = () => {
    const { bannerInfo: { opInfo = {} } } = this.props;
    const { type = '' } = opInfo;
    return type;
  };

  public render() {
    countReRender(this, 'BottomBanner');

    // 1. 判断需要展示成什么形态
    const type = this.getBannerType();
    // 2. 根据类型展示不同内容
    if (isBannerBook(type)) {
      return this.renderBookBanner();
    }
    if (isBannerPic(type)) {
      return this.renderPicBanner();
    }

    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColors: FeedsTheme.SkinColor.BOTTOM_BANNER_BG_COLOR,
    borderRadius: 15,
    width: bannerWidth,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  left: {
    width: bannerWidth - 36,
  },
  innerwraper: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 4,
    marginRight: 0,
  },
  colorWhite: {
    colors: FeedsTheme.SkinColor.BOTTOM_BANNER_BOOK_NAME_COLOR,
  },
  colorGray: {
    colors: FeedsTheme.SkinColor.N10,
  },
  bookPic: {
    borderRadius: 6,
  },
  closeBlock: {
    width: 24,
    height: 24,
  },
  picBannerContainer: {
    height: picHeight,
  },
  bannerPic: {
    width: bannerWidth,
    height: picHeight,
    borderRadius: 8,
  },
  picCloseBlock: {
    position: 'absolute',
    top: 28,
    right: 8,
    width: 24,
    height: 24,
  },
});
