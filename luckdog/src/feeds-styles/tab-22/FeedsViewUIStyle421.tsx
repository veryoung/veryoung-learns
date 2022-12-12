/**
 * @Author: veryoungwan
 * 热门分类
 */

import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import { vectorToArray } from './components/utils';
import { Title } from './components';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { Tags } from './components/Tags';
import { CLICK_STEP, CommonCardStyle } from '../../framework/FeedsConst';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { isTopTab, throttle } from '@/luckbox';
import { scale } from '../../components/animationStyle';
import FeedsUtils from '../../framework/FeedsUtils';
import { CommonProps } from '../../entity';

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle421 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 421;
  }

  public scaleAnim = scale(200, 1.015); // 点击动画效果
  public traceid = '';
  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle421');

  public componentDidMount() {
    this.scaleAnim.onHippyAnimationEnd(() => {
      // 执行跳转
      this.clickBlankJumpMore();
    });
  }

  public UNSAFE_componentWillMount() {
    const reportInfo = FeedsUtils.getSafeProps(this.props, 'itemBean.report_info', []);
    reportInfo?.forEach(([key, value]) => {
      if (key === 'sTraceId') {
        this.traceid = value;
        return;
      }
    });
  }

  public componentWillUnmount() {
    this.scaleAnim?.destory();
  }

  /**
   * 处理跳转动画结束后加载去往更多页面
   * 跳转地址不为空
   * 支持跳转
   */
  public clickBlankJumpMore = () => {
    const { vTextLink = {} } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const { sUrl = '' } = vectorToArray(vTextLink)[0] || {};
    if (sUrl !== '') {
      this.loadUrl(sUrl);
    }
  };

  /**
   * title点击的响应
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onClickTitle = throttle(() => {
    const { clickBlankJump = false } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (clickBlankJump) {
      reportUDS(BusiKey.CLICK__BLANK_TO_MORE, this.props, { traceid: this.traceid });
      this.scaleAnim.start();
    }
  }, CLICK_STEP);

  public doBeaconByClick = (moreData) => {
    reportUDS(BusiKey.CLICK__CARD, this.props, moreData);
  };

  public doBeaconByClickAll = () => {
    reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, this.props);
  };

  public doBeaconBySlide = (moreData = {}) => {
    reportUDS(BusiKey.SLIDE__CARD, this.props, moreData);
  };

  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle421');
    const { itemBean = {}, index } = this.props;
    const { globalConf } = this.props;
    const { title = '', parsedObject = {} } = itemBean;
    const tags = JSON.parse(JSON.stringify(vectorToArray(parsedObject.vDetailData))) || [];
    const titleRight = vectorToArray(parsedObject.vTextLink)[0] || [];

    return (
      <View
        style={[{
          ...!isTopTab() && CommonCardStyle,
        }, {
          transform: [{ scale: this.scaleAnim }],
        }]}
        onLayout={this.onLayout}
      >
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        <View
          collapsable={false}
          onClick={this.onClickTitle}
        >
          <Title
            title={title}
            onLayout={this.onTitleLayout}
            parent={this}
            right={titleRight}
            doBeaconByClick={this.doBeaconByClickAll}
          />
        </View>
        <Tags
          parent={this}
          tags={tags}
          cardIndex={index}
          itemBean={itemBean}
          line={2}
          doBeaconByClick={this.doBeaconByClick}
          doBeaconBySlide={this.doBeaconBySlide}
        />
      </View>
    );
  }
}
