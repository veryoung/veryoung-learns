/**
 * @Author: liquid
 * @Date:   2017-06-15T21:36:18+08:00
 * @Last modified by:   liquid
 * @Last modified time: 2017-06-20T19:52:31+08:00
 * 顶tab猜你喜欢
 */

import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import { FeedsTheme, vectorToArray } from './components/utils';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import { Title, Book4 } from './components';
import FeedsProtect from '../../mixins/FeedsProtect';
import { BeaconReportProps, reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { CommonProps } from '../../entity';

interface Props extends BeaconReportProps, CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle8 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 8;
  }

  public state = {
    iposition: 0,
  };

  /**
   * 切换猜你想看 换一换
   */
  public switchNovel(books) {
    let { iposition } = this.state;
    const pageIdx = (books.length / 4) - 1;
    iposition = iposition === pageIdx ? 1 : iposition += 1;
    this.setState({
      iposition,
    });
    const booksId = books
      .slice(iposition * 4, (iposition + 1) * 4)
      .map(book => book.sBookId || '')
      .join(',');
    if (booksId !== '') this.changeReport(booksId);
    reportUDS(BusiKey.CLICK__CARD_CHANGE, this.props, { bigdata_contentid: '' });
  }

  public changeReport(booksId) {
    const { itemBean } = this.props;
    itemBean?.report_info?.forEach((info) => {
      if (info[0] === 'sContentId') {
        // eslint-disable-next-line no-param-reassign
        info[1] = booksId;
      }
    });
  }

  public doBeaconByClick = (data) => {
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, data);
  };

  public onLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  public render() {
    const { itemBean, index } = this.props;
    const { iposition } = this.state;
    const { parsedObject = {}, title } = itemBean || {};
    const { bSlidable = false, bChangable = false } = parsedObject || {};
    const books = vectorToArray(parsedObject.vDetailData);
    if (books.length === 0) return null;

    const titleRight = vectorToArray(parsedObject.vTextLink)[0];
    const backgroundColors = FeedsTheme.SkinColor.D5;
    const { globalConf } = this.props;

    const moreTextStyle = {};
    const titleStyle = {};

    return (
      <View style={{ backgroundColors }}>
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean?.bottomLineStyle} />
        <Title
          title={title}
          right={titleRight}
          onLayout={this.onLayout}
          switchNovel={this.switchNovel.bind(this, books)}
          changeable={bChangable}
          parent={this}
          moreTextStyle={moreTextStyle}
          titleStyle={titleStyle}
          showDot={
            books.slice(0, 4).every(o => !o.sUpdatedNumber || o.sUpdatedNumber === '0')
            && books.slice(4).some(o => o.sUpdatedNumber && o.sUpdatedNumber !== '0')
          }
        />
        <Book4
          books={books}
          cardIndex={index}
          parent={this}
          itemBean={itemBean}
          iposition={iposition}
          slideEnable={bSlidable}
          changeable={bChangable}
          doBeaconByClick={this.doBeaconByClick}
          numberOfLines={2}
        />
      </View>
    );
  }
}
