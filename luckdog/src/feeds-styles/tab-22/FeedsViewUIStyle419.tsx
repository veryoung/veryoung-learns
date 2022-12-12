// 热门影视原著
/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  View,
} from '@tencent/hippy-react-qb';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsViewItem from '../FeedsViewItem';
import FeedsSpliter from '../../components/FeedsSpliter';
import { Title } from './components';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { BigBanner } from './components/Bigbanner';
import { CommonCardStyle } from '../../framework/FeedsConst';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { isTopTab } from '@/luckbox';
import { CommonProps } from '../../entity';

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle419 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 419;
  }

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle419');
  }

  public doBeaconByClick = (data = {}) => {
    reportUDS(BusiKey.CLICK__CARD, this.props, data);
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

  public render() {
    countReRender(this, 'FeedsViewUIStyle419');
    const { itemBean = {}, globalConf, index } = this.props;
    const { title = '热门影视原著', parsedObject = {} } = itemBean;
    const { vDetailData = {}, vTextLink = {} } = parsedObject;
    const books = vDetailData.value || [];
    const titleRight = vTextLink.value[0] || { sText: '查看更多', sUrl: 'https://novel.html5.qq.com/qbread/cardview?sceneid=FeedsTab_NovelFeedsQB_FeedsHotVideoQB&strageid=103513_100000_100000&traceid=0828004&ch=001995&category=0' };
    return (
      <View
        style={{
          ...!isTopTab() && CommonCardStyle,
        }}
      >
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        <View>
          <Title
            title={title}
            right={titleRight}
            onLayout={this.onTitleLayout}
            parent={this}
            doBeaconByClick={this.doBeaconByClickAll}
          />
          <BigBanner
            books={books}
            cardIndex={index}
            parent={this}
            itemBean={itemBean}
            doBeaconByClick={this.doBeaconByClick}
            doBeaconBySlide={this.doBeaconBySlide}
          />
        </View>
      </View>
    );
  }
}
