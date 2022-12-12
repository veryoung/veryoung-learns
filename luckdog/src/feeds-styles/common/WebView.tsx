import React from 'react';
import {
  QBListView,
  QBWebView,
  View,
} from '@tencent/hippy-react-qb';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { HippyApi, WebViewActionType } from '@tencent/luckbox-feeds-jsapi';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsUtils from '../../framework/FeedsUtils';
import { addKeylink, KeylinkCmd, logError } from '@/luckdog';
import FeedsEventHub from '../../framework/FeedsEventHub';
import { isIOS } from '../../framework/utils/device';
import { emitter, events } from '../../utils/emitter';

const TAG = 'WebView';

interface Props {
  /** webView加载地址 */
  url: string;
  /** webView宽度 */
  width: number;
  /** webView长度 */
  height: number;
  /** webView所属tabid */
  tabId?: number;
  /** webview是否透明 */
  isTransparent?: boolean;
  /** 关闭当前webview */
  onPageClosed?: () => void;
  /** 刷新当前tab */
  reloadCurrentTab?: () =>  void;
}

@FeedsProtect.protect
export default class WebView extends React.Component<Props> {
  private loadStartTime = Date.now();
  private api = new HippyApi();
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'WebView');
  }

  /** 接收h5响应信息 */
  public onMessage = (event) => {
    try {
      if (!event.loading && event.data) {
        const action = JSON.parse(event.data);
        const { type = '' } = action;
        switch (type) {
          case WebViewActionType.OPEN_URL:
            this.openWebView(action.info || {});
            break;
          case WebViewActionType.CLOSE_CURRENT_PAGE:
            this.closeCurrentPage();
            break;
          case WebViewActionType.RELOAD_HIPPY_VIEW:
            this.reloadCurrentTab(action.info || {});
            break;
          default:
            logError(`this action type not support,the type name is ${type}`, 'WebView.onMessage');
            break;
        }
      }
    } catch (error) {
      logError(error, 'WebView.onMessage');
    }
  };

  /** 刷新当前tab */
  public reloadCurrentTab = (info) => {
    const { reloadCurrentTab } = this.props;
    if (!reloadCurrentTab) {
      logError('reloadCurrentTab not register', 'WebView.reloadCurrentTab');
      return;
    }
    info.jumpUrl ? emitter.emit(events.DO_COLLECT_ANIMATION, [info]) : reloadCurrentTab();
  };

  /** 关闭当前页面 */
  public closeCurrentPage = () => {
    const { onPageClosed } = this.props;
    if (!onPageClosed) {
      logError('onPageClosed not register', 'WebView.closeCurrentPage');
      return;
    }
    onPageClosed();
  };

  /** 加载hippy地址 */
  public openWebView = (info) => {
    const { url } = info;
    url && FeedsUtils.doLoadUrl(url);
  };

  /** 触发页面刷新 */
  public startRefresh = () => {
    this.api.reload();
  };

  /** 处理页面生命周期 */
  public _onlifecycleChanged = (bundle) => {
    if (bundle) {
      switch (bundle.type) {
        case FeedsEventHub.lifecycle.active: {
          this.api.notifyActive();
          break;
        }
        case FeedsEventHub.lifecycle.deactive:
          this.api.notifyDeactive();
          break;
        default:
      }
    }
  };

  public onLoadingStart = (e) => {
    const { width, height, tabId } = this.props;
    addKeylink(
      `加载url:${e.url}, navigationType:${e.navigationType} width:${width}, height:${height}, tabId: ${tabId}`,
      TAG,
    );
    addKeylink(`${tabId}-webview-inittime=${Date.now() - this.loadStartTime}`, KeylinkCmd.PR_AVG);
    addKeylink(`${tabId}-webview-load`, KeylinkCmd.PR_INFO_SUM);
    this.loadStartTime = Date.now();
  };

  public onLoadingError = (e) => {
    addKeylink(`${this.props.tabId}-webview-loaderror`, KeylinkCmd.PR_ERROR_SUM);
    logError(e, TAG);
  };

  public onLoadingFinish = () => {
    addKeylink(`${this.props.tabId}-webview-loadtime=${Date.now() - this.loadStartTime}`, KeylinkCmd.PR_AVG);
  };

  public render() {
    countReRender(this, 'WebView');
    const { url, width, height, isTransparent = false } = this.props;
    const isTrans4IOS = isIOS && isTransparent;
    const styles = {
      width,
      height,
      ...isTrans4IOS ? { backgroundColor: 'transparent' } : null,
    };
    if (height <= 0) return <View/>;
    return (
      <>
        <QBWebView
          ref={w => this.api.registerWebView(w)}
          style={styles}
          setCanHorizontalScroll={this.canhorizontalscroll(url)}
          canGoBack
          automaticallyAdjustContentInsets
          allowsInlineMediaPlayback={canMediaPlayInWebview(url)}
          decelerationRate='normal'
          scalesPageToFit
          scrollEnabled
          javaScriptEnabled // 仅限Android平台。iOS平台JavaScript是默认开启的。
          domStorageEnabled // 适用于安卓
          onMessage={this.onMessage}
          source={{ uri: url }}
          webViewBackgroundColor={isTransparent ? '#00000000' : ''}
          onLoadingStart={this.onLoadingStart}
          onLoadingError={this.onLoadingError}
          onLoadingFinish={this.onLoadingFinish}
        />
        <QBListView renderRow={() => null} numberOfRows={0}/>
      </>
    );
  }

  private canhorizontalscroll = (url: string): boolean => {
    if (!url) return false;
    const queryObj = FeedsUtils.parseQueryString(url);

    return !!queryObj?.canhorizontalscroll;
  };
}

export const canMediaPlayInWebview = (url: string): boolean => {
  if (!url) return false;
  const { can_media_play: canMediaPlay } = FeedsUtils.parseQueryString(url);

  return canMediaPlay === '1';
};
