import React, { Component } from 'react';
import { View, Image, StyleSheet, Modal } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender, OpHalfPopWebViewData, getSearchParams } from '@/luckbox';
import { ConstantUtils } from '../../feeds-styles/common/utils';
import { FeedsTheme } from '../../feeds-styles/tab-22/components/utils';
import { isIOS } from '../../framework/utils/device';
import { reportUDS, BusiKey } from '@/luckdog';
import { STRICT_EXPOSE_DELAY } from '../../framework/FeedsConst';
import WebView from '../../feeds-styles/common/WebView';
import FeedsIcon from '../../framework/FeedsIcon';
import { FSOpContentItem } from '@/presenters';
import { emitter, events } from '../../utils/emitter';

/** 半浮层弹窗props类型 */
interface OpHalfWebViewProps {
  globalConf: any;
  halfInfo?: FSOpContentItem;
  visible: boolean;
  onClose?: () => void;
  /** 刷新当前tab */
  reloadCurrentTab?: () => void;
  isTransparent: boolean;
}

/** 模块关键字 */
const OP_HALF_WEB_PAGE = 'OpHalfWebView';
/** 半屏浮层距离顶部高度 */
const marginTopHeight = 168;
/** 半屏宽度 */
const webPageWidth = ConstantUtils.getScreenWidth();
/** 半屏打开的高度 */
const webPageHeight = ConstantUtils.getScreenHeight();
/** 严口径上报定时器 */
let exposeTimer: NodeJS.Timeout;

/**
 * 半浮层弹窗（为了支持H5落地页直接在频道消费）
 * 设计稿：https://codesign.woa.com/s/3JG2mj7dbn9VKdM/1DWk9JWxxy0GnMm
 * qb://tab/feedschannel?component=FeedsNovelPage&module=novelsingletab&tabId=112&currentId=181&ch=006353&float_page_url=https%3A%2F%2Fbookshelf.html5.qq.com%2Fqbread%2Fintro%3Fbookid%3D1135752210%26ch%3D
 * qb://tab/feedschannel?component=FeedsNovelPage&module=novelsingletab&tabId=112&currentId=181&ch=006353&float_page_url=https%3A%2F%2Fupage.html5.qq.com%2Fpage%2F260315%3Fch%3D
 */
@FeedsProtect.protect
export default class OpHalfWebView extends Component<OpHalfWebViewProps> {
  private isShowed = false; // 是否展示了弹窗（针对iOS有效）
  private hasStrictExposed = false; // 是否严口径上报过

  public constructor(props: OpHalfWebViewProps) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, OP_HALF_WEB_PAGE);
  }

  public componentDidMount() {
    emitter.on(events.HALF_WEBVIEW_RESET_STATUS, this.resetShowState);
  }

  public componentDidUpdate() {
    // iOS端跳转出频道后，Modal的 onRequestClose 没有执行，导致返回后又展示了弹窗，故做该逻辑只展示一次弹窗（熄屏后弹窗会消失，产品能接受）
    if (isIOS && this.props.visible) {
      this.isShowed = true;
    }
  }

  public componentWillUnmount() {
    exposeTimer && clearTimeout(exposeTimer);
    emitter.off(events.HALF_WEBVIEW_RESET_STATUS, this.resetShowState);
  }

  /**
   * 直接用地址进入重置状态，解决多次用地址进入iOS因为isShowed为false不展示弹窗
   */
  public resetShowState = () => this.isShowed = false;

  /** webview触发关闭 */
  public onPageClosed = () => {
    const { onClose } = this.props;
    onClose?.();
  };

  /** 刷新当前tab */
  public reloadCurrentTab =() => {
    const { reloadCurrentTab } = this.props;
    reloadCurrentTab?.();
  };

  /** 生成带有参数的pageUrl */
  public genFinalWebUrl = (flagPageUrl) => {
    const urlParams = getSearchParams() as any;
    const { QbNewAndAliveReportTraceId = '' } = urlParams;
    const url = QbNewAndAliveReportTraceId ? `${flagPageUrl}${flagPageUrl.includes('?') ? '&' : '?'}QbNewAndAliveReportTraceId=${QbNewAndAliveReportTraceId}` : flagPageUrl;
    return url;
  };


  /** 渲染透明浮层 */
  public renderTransparentModal = () => {
    const { halfInfo, visible, onClose } = this.props;
    const { floatPageUrl } = halfInfo?.opInfo as OpHalfPopWebViewData || {};
    const urlParams = getSearchParams() as any;
    const { QbNewAndAliveReportTraceId = '' } = urlParams;
    return (
      <Modal
        animationType="fade"
        onRequestClose={() => onClose?.()}
        supportedOrientations={['portrait']}
        transparent
        visible={visible && !this.isShowed}
        onClick={this.onClickClose}
        onAttachedToWindow={this.onAttachedToWindow}
      >
        <View style={[styles.trans_container]}>
          <WebView
            key={`feeds_webView_transparent_${OP_HALF_WEB_PAGE}`}
            width={webPageWidth}
            height={webPageHeight}
            url={`${floatPageUrl}&traceid=${QbNewAndAliveReportTraceId}`}
            isTransparent={true}
            onPageClosed={this.onPageClosed}
            reloadCurrentTab={this.reloadCurrentTab}
          />
        </View>
      </Modal>
    );
  };

  /** 渲染半屏浮层 */
  public renderHalfModal = () => {
    const { halfInfo, visible, onClose } = this.props;
    const { floatPageUrl, showHomeEntry } = halfInfo?.opInfo as OpHalfPopWebViewData || {};
    return (
      <Modal
        animationType="fade"
        onRequestClose={() => onClose?.()}
        supportedOrientations={['portrait']}
        transparent
        visible={visible && !this.isShowed}
      >
        <View style={styles.mask} onClick={this.onClickClose} />
        <View style={[styles.container]}>
          <View style={styles.top} onAttachedToWindow={this.onAttachedToWindow}>
            <Image
              style={styles.downArrow}
              source={FeedsIcon.downArrow}
              noPicMode={{ enable: false }}
              reportData={{ sourceFrom: OP_HALF_WEB_PAGE }}
              onClick={this.onClickClose}
            />
          </View>
          {
            showHomeEntry ? <Image
              style={styles.homeEntry}
              source={FeedsIcon.homeEntry}
              noPicMode={{ enable: false }}
              reportData={{ sourceFrom: OP_HALF_WEB_PAGE }}
              onClick={this.onClickClose}
            /> : null
          }
          <WebView
            key={`feeds_webView_${OP_HALF_WEB_PAGE}`}
            width={webPageWidth}
            height={webPageHeight - marginTopHeight}
            url={floatPageUrl}
          />
        </View>
      </Modal>
    );
  };

  public render() {
    countReRender(this, OP_HALF_WEB_PAGE);
    const { isTransparent } = this.props;
    return (
      isTransparent ? this.renderTransparentModal() : this.renderHalfModal()
    );
  }

  /** 点击按钮根据按钮类型执行对应操作 */
  private onClickClose = () => {
    const { onClose, halfInfo: { itemBean = {}, opInfo } = {} } = this.props;
    const { floatPageUrl = '' } = opInfo as OpHalfPopWebViewData || {};
    if (!this.hasStrictExposed) {
      this.reportStrictExpose(false);
    }
    onClose?.();

    // 点击上报到灯塔
    reportUDS(BusiKey.CLICK__HALF_SCREEN_WEBVIEW_CLOSE, { itemBean } as any, {
      book_id: '',
      bigdata_contentid: '',
      ext_data1: this.genFinalWebUrl(floatPageUrl),
    });
  };

  /** 上屏事件，进行曝光上报 */
  private onAttachedToWindow = () => {
    this.hasStrictExposed = false;
    const { halfInfo: { itemBean = {} } = {} } = this.props;

    // 宽口径曝光上报到灯塔
    reportUDS(BusiKey.WIDE_EXPOSE__CARD, { itemBean } as any);
    // 严口径上报
    this.reportStrictExpose(true);
  };

  /**
   * 严口径上报曝光
   * @param isDelay 是否需要延迟1s上报
   */
  private reportStrictExpose = (isDelay = true) => {
    exposeTimer && clearTimeout(exposeTimer);
    if (isDelay) {
      exposeTimer = setTimeout(() => {
        this.strictExpose();
      }, STRICT_EXPOSE_DELAY);
    } else {
      this.strictExpose();
    }
  };

  /** 严口径曝光上报 */
  private strictExpose = () => {
    const { halfInfo: { itemBean = {}, opInfo } = {} } = this.props;
    const { floatPageUrl = '' } = opInfo as OpHalfPopWebViewData || {};

    // 严口径曝光上报到灯塔
    reportUDS(BusiKey.EXPOSE__HALF_SCREEN_WEBVIEW, { itemBean } as any, {
      book_id: '',
      ext_data1: this.genFinalWebUrl(floatPageUrl),
    });
    this.hasStrictExposed = true;
  };
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColors: ['rgba(0,0,0,0.4)'],
  },
  container: {
    position: 'absolute',
    bottom: 0,
    width: webPageWidth,
    flexDirection: 'column',
  },
  trans_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: webPageWidth,
    flexDirection: 'column',
  },
  top: {
    height: 35,
    backgroundColors: FeedsTheme.SkinColor.D7,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downArrow: {
    width: 18,
    height: 7.5,
  },
  homeEntry: {
    position: 'absolute',
    zIndex: 2,
    bottom: 14,
    right: 28,
    width: 60,
    height: 60,
    opacity: 0.6,
  },
});
