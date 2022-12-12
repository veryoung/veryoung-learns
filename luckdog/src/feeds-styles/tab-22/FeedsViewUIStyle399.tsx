/**
 * @Author: veryoungwan
 * 推荐卡片
 */

import React from 'react';
import { View, Text, StyleSheet } from '@tencent/hippy-react-qb';
import { FeedsTheme, vectorToArray, getTitleRight } from './components/utils';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import { Title } from './components';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CommonCardStyle, FeedsUIStyle, FeedsLineHeight, CLICK_STEP, SmallBookCoverLeftTagStyle } from '../../framework/FeedsConst';
import { reportUDS, BeaconReportProps, strictExposeReporter, BusiKey } from '@/luckdog';
import FeedsUtils from '../../framework/FeedsUtils';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { scale } from '../../components/animationStyle';
import { CardLinkType } from '../../entity/card';
import { CommonProps } from '../../entity/common';
import { throttle } from '@/luckbox';
import { TabId } from '../../entity';
import { initReportInfo, getChangeReportInfo, switchNovelPrefetch } from '../../utils/preFetchCard';
import { BookCoverRadiusStyle } from '../../types/card';
import { BookCover } from '../../components/book-font-cover';


// 默认一屏展示的书籍数
const DEFAULT_PER_NUMBER = 8;

const { width } = FeedsUtils.getScreen();
const IMAGE_WIDTH = (width - (12 * 2) - (16 * 2) - (26 * 3)) / 4;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 81) / 60;

interface Props extends BeaconReportProps, CommonProps {
  index: number;
}

interface State {
  iposition: number;
  books: any[];
}

@FeedsProtect.protect
export default class FeedsViewUIStyle399 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 399;
  }

  public scaleAnim = scale(200, 1.015); // 点击动画效果
  public state: State;

  /**
   * title点击的响应
   */
  public onClickTitle = throttle(() => {
    const { clickBlankJump = false } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (clickBlankJump) {
      reportUDS(BusiKey.CLICK__BLANK_TO_MORE, this.props);
      this.scaleAnim.start();
    }
  }, CLICK_STEP);

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle399');
    this.state = {
      iposition: 0,
      books: [],
    };

    const { globalConf: { curTabId = TabId.BOTTOM_RECOMM2 } = {}, index = 0 } = props || {};

    // 局部刷新换一换替换上报参数
    strictExposeReporter.addReportDataHandler(curTabId, index, (moreData) => {
      const { linkType: refreshType } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
      const { iposition } = this.state;

      // 如果是局部刷新换一换，需要在上报之前获取到动态的report_info
      const reportInfo = refreshType === CardLinkType.CHANGE ? getChangeReportInfo(props, iposition) : {};

      return {
        ...moreData,
        ...reportInfo,
      };
    });
  }

  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.updateShownBooks(nextProps);

    // 上报查看更多
    const { linkType = 0 } = FeedsUtils.getSafeProps(nextProps, 'itemBean.parsedObject', {});
    if (linkType === CardLinkType.MORE) reportUDS(BusiKey.EXPOSE__TO_MORE, this.props);
  }

  public componentDidMount() {
    // 点击标题动画结束后执行的内容
    this.scaleAnim.onHippyAnimationEnd(() => {
      // 执行跳转
      this.clickBlankJumpMore();
    });

    this.updateShownBooks(this.props);
  }

  public componentWillUnmount() {
    this.scaleAnim?.destory();
  }

  /**
   * 更新展示的书籍
   * @param props props或nextProps
   */
  public updateShownBooks = (props) => {
    const { vRes = {} } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
    const books = vectorToArray(vRes);
    this.setState({
      books,
      iposition: 0,
    }, () => {
      const { linkType: refreshType } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
      // 如果是局部刷新换一换，需要动态设置report_info
      refreshType === CardLinkType.CHANGE && this.setReportInfo(props);
    });
  };

  /**
   * 设置上报参数
   * @param props 卡片的props或nextProps
   */
  public setReportInfo = (props) => {
    const { books } = this.state;
    const { iPerPageNum = DEFAULT_PER_NUMBER } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
    // 获得所有的缓存书籍的屏数
    const pageNum = books.length / iPerPageNum;

    initReportInfo(props, pageNum);
  };

  /**
   * 点击查看全部上报
   */
  public doBeaconByClickAll = () => {
    const { linkType = 0 } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (linkType === CardLinkType.MORE) {
      reportUDS(BusiKey.CLICK__TO_MORE, this.props);
      return;
    }
  };

  /**
   * 点击换一换上报
   * @param books 当前页的书籍
   * @param iposition 当前页的下标
   */
  public doBeaconBySwitch = () => {
    const { linkType: refreshType, refreshKey = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const isPreFetch = refreshType === CardLinkType.CHANGE && refreshKey !== '';

    // 点击上报
    reportUDS(BusiKey.CLICK__CARD_CHANGE, this.props, {
      bigdata_contentid: '',
      ext_data1: isPreFetch ? '1' : '0',
    });
  };

  /**
   * 处理跳转动画结束后加载去往更多页面
   * 跳转地址不为空
   * 支持跳转
   */
  public clickBlankJumpMore = () => {
    const { moreLink = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    moreLink && this.loadUrl(moreLink);
  };

  /**
   * 切换猜你想看 换一换
   */
  public switchNovel = () => {
    const { iPerPageNum: num = DEFAULT_PER_NUMBER,
      refreshKey = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    let { iposition, books } = this.state;
    const pageIndex = Math.floor(books.length / num) - 1;

    iposition = iposition >= pageIndex ? 0 : iposition += 1;

    switchNovelPrefetch(this.props, iposition, pageIndex, num, (res) => {
      const preFetchBooks = FeedsUtils.getSafeProps(res[refreshKey] || {}, 'parsedObject.vRes', []);
      books = [...books, ...preFetchBooks];
      this.setState({
        books,
      });
    });

    this.setState({
      iposition,
    });

    this.doBeaconBySwitch();
  };

  /**
   * 点击书籍
   * @param {*} book 书籍
   * @param {*} index 书籍下标
   */
  public handleClick = (book) => {
    const { sRefer = '', sResourceId = '' } = book || {};
    sRefer && this.loadUrl(sRefer);

    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, { book_id: sResourceId });
  };

  public onBookItemLayout = (event, tabIndex, bookIndex, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      tabIndex,
      bookIndex,
      bookId,
      rect: event.layout,
    });
  };

  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  public renderBooks = (books, change, num) => {
    const view: any[] = [];
    const { itemBean, index } = this.props || {};
    let data;
    const { iposition } = this.state;
    if (change) {
      // TODO: 为什么要序列化
      data = JSON.parse(JSON.stringify(books));
      data = data.slice(iposition * num, (iposition + 1) * num);
    } else {
      data = books;
    }

    strictExposeReporter.updateBookIds(index, iposition, data.map(book => book.sResourceId));
    for (let i = 0; i < data.length; i++) {
      const book = data[i];
      const { sScore = 0, sResourceId = '', sResourceName, sPicUrl, stStatus } = book;
      const leftTag = FeedsUtils.getLeftTagStyle(stStatus, SmallBookCoverLeftTagStyle);
      view.push(<View
        style={styles.item}
        key={sResourceId}
        onLayout={event => this.onBookItemLayout(event, iposition, i, sResourceId)}
        onClick={strictExposeReporter.triggerExpoCheck(() => this.handleClick(book))}
      >
        <View>
          <BookCover
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            url={sPicUrl}
            bookID={sResourceId}
            radius={BookCoverRadiusStyle.SMALL}
            sourceFrom={itemBean?.item_id}
            leftTag={leftTag}
          />
          <Text style={styles.bookName} numberOfLines={2}>
            {sResourceName}
          </Text>
        </View>
        {
          sScore ? <View style={styles.textScoreBlock}>
            <Text style={styles.textScore}>{sScore}分</Text>
          </View> : null
        }
      </View>);
    }

    return view;
  };

  public render(): any {
    countReRender(this, 'FeedsViewUIStyle399');
    const { itemBean, globalConf = {} } = this.props;
    const { parsedObject = {}, title } = itemBean || {};
    const { iPerPageNum = DEFAULT_PER_NUMBER, bIsNeedChange = false, linkType = 0 } = parsedObject;
    const { books = [] } = this.state;
    if (books.length === 0) return null;

    const titleRight = getTitleRight(this.props);
    return (
      <View style={[{ ...CommonCardStyle }, { transform: [{ scale: this.scaleAnim }] }]}>
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean?.bottomLineStyle} />
        <View
          collapsable={false}
          onClick={this.onClickTitle}
        >
          <Title
            title={title}
            onLayout={this.onTitleLayout}
            switchNovel={this.switchNovel}
            changeable={bIsNeedChange || linkType !== CardLinkType.MORE} // loadmore的时候不能展示换一换
            parent={this}
            right={titleRight}
            showDot={
              books.slice(0, 4).every(o => !o.sUpdatedNumber || o.sUpdatedNumber === '0')
              && books.slice(4).some(o => o.sUpdatedNumber && o.sUpdatedNumber !== '0')
            }
            doBeaconByClick={this.doBeaconByClickAll}
          />
        </View>
        <View style={styles.wrap}>
          {
            this.renderBooks(books, bIsNeedChange, iPerPageNum)
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 3,
    paddingRight: 3,
  },
  item: {
    marginLeft: 13,
    marginRight: 13,
    width: IMAGE_WIDTH,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  picText: {
    justifyContent: 'flex-start',
  },
  textScoreBlock: {
    flexDirection: 'row',
  },
  textScore: {
    fontFamily: 'PingFangSC-Semibold',
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N3,
    fontWeight: 'bold',
    lineHeight: FeedsLineHeight.T1,
  },
  bookName: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
    marginBottom: 2,
    marginTop: 4,
  },
});
