/**
 * @Author: veryoungwan
 * 排行榜外露卡片
 */

import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import { vectorToArray } from './components/utils';
import { Title } from './components';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import Rank from './components/Rank';
import { CommonCardStyle } from '../../framework/FeedsConst';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { isTopTab } from '@/luckbox';
import { CommonProps } from '../../entity';

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle420 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 420;
  }
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle420');
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
    countReRender(this, 'FeedsViewUIStyle420');
    const { itemBean = {}, index } = this.props;
    const { globalConf } = this.props;
    const { title = '', parsedObject = {} } = itemBean;
    const books = vectorToArray(parsedObject.vDetailData) || [];
    const titleRight = vectorToArray(parsedObject.vTextLink)[0] || [];

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
            parent={this}
            onLayout={this.onTitleLayout}
            right={titleRight}
            doBeaconByClick={this.doBeaconByClickAll}
          />
          <Rank
            parent={this}
            books={books}
            cardIndex={index}
            itemBean={itemBean}
            doBeaconByClick={this.doBeaconByClick}
            doBeaconBySlide={this.doBeaconBySlide}
          />
        </View>
      </View>
    );
  }
}
