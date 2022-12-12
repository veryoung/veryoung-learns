/* eslint-disable no-unused-vars */
/**
 * Created by damonruan on 2017/5/4.
 */
import React from 'react';
import {
  Image,
  View,
  PCGStatModule,
  StyleSheet,
  // QBToastModule,
} from '@tencent/hippy-react-qb';
import { UIManagerModule } from '@tencent/hippy-react';
import { FeedsUIStyle } from '../../framework/FeedsConst';
import FeedsTheme from '../../framework/FeedsTheme';
import FeedsUtils from '../../framework/FeedsUtils';
import ErrorBoundary from '../../framework/ErrorBoundary';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsProtect from '../../mixins/FeedsProtect';
import { DEFAULT_FEEDS_STYLE } from '../../framework/FeedsDefaultStyle';
import { CommonProps } from '../../entity';

interface Props extends CommonProps {
  noPadding: boolean;
  parentProps: any;
  bgMode?: any;
  bgSizeRatio?: number;
  parentUrl?: string;
  bgUrl?: string;
  dataBundle?: any;
  innerId?: number;
  border?: any;
  containerStyle?: any;
  contentStyle?: any;
  bgModeBackgroundColors?: any;
  bgImageStyle?: any;
  noPressState?: any;

  onClick?: (...args) => void;
  onAttachedToWindow?: () => void;
  onDetachedFromWindow?: () => void;
}

@FeedsProtect.protect
export default class FeedsViewContainer extends React.Component<Props> {
  public static defaultProps = {};
  public staticStyle: { container: any; };
  public IMAGE_WIDTH: number;
  public IMAGE_HEIGHT!: number;
  public spliter: any;
  public state = {
    isClicked: false,
  };

  public constructor(props) {
    super(props);

    let itemPaddingStyle = {};

    const { noPadding } = this.props;
    if (noPadding) {
      itemPaddingStyle = {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
      };
    } else {
      itemPaddingStyle = {
        paddingTop: FeedsUIStyle.FEED_ITEM_PADDING_TOP_BOTTOM,
        paddingBottom: FeedsUIStyle.FEED_ITEM_PADDING_TOP_BOTTOM,
        paddingLeft: FeedsUIStyle.FEED_ITEM_PADDING_SIDE,
        paddingRight: FeedsUIStyle.FEED_ITEM_PADDING_SIDE,
      };
    }

    this.staticStyle = {
      container: itemPaddingStyle,
    };

    this.IMAGE_WIDTH = FeedsUtils.getScreenWidth();
    if (this.props.bgMode && typeof this.props.bgSizeRatio !== 'undefined') {
      this.IMAGE_HEIGHT = Math.floor(this.IMAGE_WIDTH * this.props.bgSizeRatio);
    }
  }

  public UNSAFE_componentWillReceiveProps(nextProps) {
    const itemBean = FeedsUtils.getSafeProps(this.props, 'parentProps.itemBean', {});
    const nextItemBean = FeedsUtils.getSafeProps(nextProps, 'parentProps.itemBean', {});
    if (
      (nextProps.bgMode
        && this.props.bgMode
        && typeof nextProps.bgSizeRatio !== 'undefined'
        && typeof this.props.bgSizeRatio !== 'undefined'
        && nextProps.bgSizeRatio !== this.props.bgSizeRatio)
      || itemBean.item_id !== nextItemBean.item_id
    ) {
      this.IMAGE_WIDTH = FeedsUtils.getScreenWidth();
      this.IMAGE_HEIGHT = Math.floor(this.IMAGE_WIDTH * nextProps.bgSizeRatio);
    }
  }

  public onAttached = () => {
    // 可见
    const { onAttachedToWindow } = this.props;
    if (onAttachedToWindow) {
      onAttachedToWindow();
    }
  };

  public onDetached = () => {
    // 不可见
    const { onDetachedFromWindow } = this.props;
    if (onDetachedFromWindow) {
      onDetachedFromWindow();
    }
  };

  public debugPageOpen = () => {
    const { parentProps } = this.props;
    const { itemBean } = parentProps;
    if (itemBean.debugInfo) {
      const info = encodeURIComponent(itemBean.debugInfo);
      const url = `http://res.imtt.qq.com/video_fun_opt/dist/index_dist-7df34a30c7.html#info=${info}`;
      const needDistort = itemBean.need_distort && itemBean.business === 6;
      FeedsUtils.doLoadUrl(url, itemBean.tab_id, needDistort);
    }
  };

  public loadUrl = ({ clickPos = 0 } = {}) => {
    const { parentProps } = this.props;
    // 可操作设置
    const setFeedsActiveInit = FeedsUtils.getSafeProps(
      parentProps,
      'parentModel.parentView.parent.setFeedsActiveInit',
    );
    if (setFeedsActiveInit) setFeedsActiveInit('itemClick');
    const globalConf = parentProps.globalConf || {};
    const itemBean = parentProps.itemBean || {};
    const url = this.props.parentUrl || itemBean.url;
    const { onClick } = this.props;

    if (onClick) {
      onClick(globalConf, url, this.props.dataBundle, this.props.innerId);
    }
    // 由于子view也处理了onClick事件，但没有挂eid，终端触发click事件时，大同SDK不会做上报，因此这里需要手动上报一下
    if (clickPos && PCGStatModule) {
      const nodeId = UIManagerModule.getNodeIdByRef(`dt_card_${itemBean.item_id}`);
      PCGStatModule.dtManualReport(PCGStatModule.dtReportEventName.CLICK, {}, nodeId);
    }
  };

  public render() {
    const { parentProps } = this.props;
    const { itemBean } = parentProps;

    const { border } = this.props;
    const globalConf = parentProps.globalConf || {};
    if (border === false) {
      this.spliter = null;
    } else {
      this.spliter = (
        <FeedsSpliter
          style={globalConf.style}
          lineStyle={itemBean.bottomLineStyle}
          title={itemBean.title}
          ui_style={itemBean.ui_style}
        />
      );
    }
    let containerStyle = this.props.containerStyle || {};
    const colors = {
      backgroundColors: this.state.isClicked
        ? FeedsTheme.SkinColor.PRESSED_BG
        : containerStyle.backgroundColors || FeedsTheme.SkinColor.NORMAL_BG,
    };
    const commonStyles = DEFAULT_FEEDS_STYLE.data['*'];
    if (this.props.bgMode) {
      containerStyle = {
        width: this.IMAGE_WIDTH,
        height: this.IMAGE_HEIGHT,
      };
      if (this.props.containerStyle) {
        Object.assign(containerStyle, this.props.containerStyle);
      }
      const contentStyle = {
        width: containerStyle.width,
        height: containerStyle.height,
      };
      if (this.props.contentStyle) {
        Object.assign(contentStyle, this.props.contentStyle);
      }
      if (commonStyles.bgModeBackgroundColors) {
        Object.assign(contentStyle, {
          backgroundColors: commonStyles.bgModeBackgroundColors,
        });
      }
      if (this.props.bgModeBackgroundColors) {
        Object.assign(contentStyle, {
          backgroundColors: this.props.bgModeBackgroundColors,
        });
      }
      if (itemBean.isFirstElement && containerStyle && containerStyle.paddingTop) {
        Object.assign(containerStyle, {
          paddingTop: commonStyles.containerTopPaddingTop,
        });
      }
      const { bgUrl, bgImageStyle } = this.props;
      return (
        <ErrorBoundary collapsable={false}>
          <View
            collapsable={false}
            onLayout={params => this.props.onLayout?.(params)}
            onAttachedToWindow={this.onAttached}
            onDetachedFromWindow={this.onDetached}
          >
            {this.spliter}
            <View
              style={containerStyle}
              collapsable={false}
              onClick={this.loadUrl}
              dt_eid="card"
              dt_params={`rowkey=${itemBean.item_id}`}
              ref={`dt_card_${itemBean.item_id}`}
            >
              {bgUrl && (
                <View style={[styles.imageStyle, bgImageStyle, {
                  width: containerStyle.width,
                  height: containerStyle.height,
                }]}>
                  <Image
                    style={{
                      width: containerStyle.width,
                      height: containerStyle.height,
                    }}
                    source={{ uri: bgUrl }}
                    reportData={{ sourceFrom: itemBean.item_id }}
                  />
                </View>
              )}
              <View style={contentStyle}>{this.props.children || null}</View>
            </View>
          </View>
        </ErrorBoundary>
      );
    }
    if (itemBean.isFirstElement && containerStyle && containerStyle.paddingTop) {
      Object.assign(containerStyle, {
        paddingTop: commonStyles.containerTopPaddingTop,
      });
    }

    const dtProps = {
      dt_eid: 'card',
      dt_elementBizModuleIdentifier: itemBean.item_id, // 处理大同cell复用
      dt_params: FeedsUtils.getDtParams({
        actionid: 'click_contentid',
        click_type: 'single',
        area: 'list', //  list 文章列表区
      }, itemBean),
      dt_report_policy: FeedsUtils.getDtPolicy(itemBean, true),
    };

    return (
      <ErrorBoundary collapsable={false}>
        <View
          collapsable={false}
          onLayout={params => this.props.onLayout?.(params)}
          onAttachedToWindow={this.onAttached}
          onDetachedFromWindow={this.onDetached}
        >
          {this.spliter}
          <View
            style={[this.staticStyle.container, containerStyle, colors]}
            onClick={this.loadUrl}
            ref={`dt_card_${itemBean.item_id}`}
            {...dtProps}
          >
            {this.props.children || null}
          </View>
        </View>
      </ErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  imageStyle: {
    zIndex: -1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
