import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import { CommonProps } from '../../../entity';
import { BeaconReportProps, reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { isTopTab } from '@/luckbox';
import { CommonCardStyle } from '../../FeedsConst';
import { scale } from '../../../components/animationStyle';
import { Title } from '../components/title';
import { Tags } from '../components/tag';
import { UIType, CategoryCard } from '../../protocol';
interface Props extends BeaconReportProps, CommonProps {
  index: number;
  key: string;
  globalConf: any;
  totalLength: number;
  curTabId: number;
  data: CategoryCard;
}

/** 分类标签卡 */
@FeedsProtect.protect
export class Category extends React.Component<Props> {
  public static getRowType() {
    return UIType.CATEGORY;
  }

  /** 点击动画效果 */
  public scaleAnim = scale(200, 1.015);

  /** 计算布局高度 */
  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  /** 计算布局 */
  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  public reportUDS = (eventKey: BusiKey, moreData = {}) => {
    const { reportInfo, uiType } = this.props.data;
    reportUDS(eventKey, {}, { ...reportInfo, bigdata_contentid: '', ui_type: uiType, ...moreData });
  };

  /** 上报查看更多 */
  public doBeaconByClickAll = () => {
    this.reportUDS(BusiKey.CLICK__CARD_VIEW_ALL);
  };

  /** 内容点击上报 */
  public doBeaconByClick = (moreData = {}) => {
    this.reportUDS(BusiKey.CLICK__CARD, moreData);
  };

  /** 内容滑动上报 */
  public doBeaconBySlide = (moreData = {}) => {
    this.reportUDS(BusiKey.SLIDE__CARD, moreData);
  };


  public render() {
    const { data, index } = this.props;
    const { title, classifyList, jumpLink } = data;
    if (!classifyList || classifyList.length === 0) return null;
    return (
      <View
        style={[{
          ...!isTopTab() && CommonCardStyle,
        }, {
          transform: [{ scale: this.scaleAnim }],
        }]}
        onLayout={this.onLayout}
      >
        <View collapsable={false} >
          <Title
            title={title}
            onLayout={this.onTitleLayout}
            parent={this}
            right={jumpLink}
            doBeaconByClick={this.doBeaconByClickAll}
          />
        </View>
        <Tags
          parent={this}
          tags={classifyList}
          cardIndex={index}
          line={2}
          doBeaconByClick={this.doBeaconByClick}
          doBeaconBySlide={this.doBeaconBySlide}
        />
      </View>
    );
  }
}

