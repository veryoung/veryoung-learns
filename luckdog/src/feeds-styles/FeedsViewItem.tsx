/**
 * Created by piovachen on 2017/4/12.
 */
import React from 'react';
import {
  QBPackageModule,
} from '@tencent/hippy-react-qb';
import { callNativeWithPromise } from '@tencent/hippy-react';
import FeedsUtils from '../framework/FeedsUtils';
import { logError } from '@/luckdog';

if (!QBPackageModule.openUniversalLink) {
  // 兼容common包未打入的情况
  QBPackageModule.openUniversalLink = function (universalLink) {
    let finalPromise = {};
    if (typeof universalLink === 'string') {
      finalPromise = callNativeWithPromise('QBPackageModule', 'openUniversalLink', universalLink);
      return finalPromise;
    }
    return Promise.resolve(finalPromise);
  };
}

export interface FeedsViewItemProps {
  itemBean?: any;
  data?: any
}

export default class FeedsViewItem<P extends FeedsViewItemProps> extends React.Component<P> {
  public lastClickTs = 0;
  public constructor(props) {
    super(props);
    this.state = {
      clickedStateRefresh: false,
    };
  }

  /**
   * 上报点击url
   * @param itemBean
   */
  public reportClickUrl(itemBean) {
    if (itemBean.growExt?.clickUrl) {
      fetch(itemBean.growExt.clickUrl).catch(err => logError(err, 'FeedsViewItem.reportClickUrl'));
    }
  }

  public onClick(url) {
    try {
      const { itemBean } = this.props;
      itemBean?.isClicked && (itemBean.isClicked = true);
      this.setState({
        clickedStateRefresh: true,
      });
      const now = Date.now();
      if (now - this.lastClickTs > 800) {
        this.lastClickTs = now;
        this.reportClickUrl(itemBean);
        // 直达广告跳转处理
        this.loadUrl(url);
      }
    } catch (error) {
      logError(error, 'FeedsViewItem.onClick');
    }
  }

  // 文章打开或者图集打开方法，或者视频跳转小视频播放器打开方式
  public loadUrl(url) {
    const { itemBean, data } = this.props;
    if (itemBean || data) {
      const tabid = itemBean?.tab_id || data?.curTabId;
      const needDistort = itemBean?.need_distort && itemBean?.business === 6;
      FeedsUtils.doLoadUrl(url, tabid, needDistort, itemBean);
    }
  }
}
