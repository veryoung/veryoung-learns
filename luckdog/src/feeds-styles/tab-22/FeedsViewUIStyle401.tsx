/* eslint-disable no-restricted-syntax */
/**
 * @Author: liquid
 * @Date:   2017-06-15T21:36:18+08:00
 * @Last modified by:   liquid
 * @Last modified time: 2017-06-20T19:52:31+08:00
 * 猜你喜欢
 */

import React from 'react';
import { View, StyleSheet, QBToastModule } from '@tencent/hippy-react-qb';
import { doSliceArray } from '@tencent/luckbox-base-array';
import { shouldComponentUpdate, countReRender, emptyFn } from '@tencent/luckbox-react-optimize';

import { FeedsTheme, FeedsTraversal, getTitleRight, vectorToArray, FormatUtils } from './components/utils';
import FeedsViewItem from '../FeedsViewItem';
import { Title, PicText } from './components';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CardRadius, CLICK_STEP, CommonCardStyle, FeedsUIStyle, NOVEL_BUSINESS_ID } from '../../framework/FeedsConst';
import { reportUDS, strictExposeReporter, BusiKey, addKeylink, logError } from '@/luckdog';
import { CardLinkType } from '../../entity/card';
import { scale } from '../../components/animationStyle';
import FeedsUtils from '../../framework/FeedsUtils';
import { getChangeReportInfo, initReportInfo, switchNovelPrefetch } from '../../utils/preFetchCard';
import { throttle, isTopTab } from '@/luckbox';
import { TabId, CommonProps } from '../../entity';
import { activeEventObserver } from '../../utils/NativeEventAdapter';
import { DebugInfo } from './components/DebugInfo';
import FeedBack, { FeedsSourceType } from './components/feedback';
import FeedsViewUIStyle432 from './ui-style-432';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { emitter, events } from '../../utils/emitter';

const TAG = 'FeedsViewUIStyle401';

interface Props extends CommonProps {
  index: number;
}

interface State {
  /** 换一换数据所在的索引 */
  iposition: number;
  /** 书籍内容 */
  books: any[];
  /** 负反馈弹窗是否可见 */
  isFeedBackVisible: boolean;
  /** 负反馈关联的书籍id */
  feedBackBookId: string;
  /** 负反馈成功后需要隐藏的书籍 */
  shouldHideBooks: string[];
  /** 能否显示中插卡 */
  canShowInsertCard: boolean;
}

const INFINITE_CARD = '0977000';
const SHOW_BOOKS_LENGTH = 3;
const FeedsBackMsg = '感谢反馈 我们将减少此类推荐';
const InsertRecomBookCardKey = 'InsertRecomBookCardKey';
const InsertCardTitleHeight = 52;
/** 各tab的无限流卡片可能有多个401卡片，控制单tab多个401只展示一个中插卡 */
const canShowInsertCardTabMap: Record<string, boolean> = {};

@FeedsProtect.protect
export default class FeedsViewUIStyle401 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 401;
  }
  public state: State = {
    iposition: 0, // 换一换数据所在的索引
    books: [] as any[],
    isFeedBackVisible: false,
    feedBackBookId: '',
    shouldHideBooks: [],
    canShowInsertCard: false,
  };
  private traceid = '';
  private isFromActive = false; // 是否是页面响应状态
  private scaleAnim = scale(200, 1.015); // 点击动画效果
  private isLoadingInsertData = false; // 是否在拉取中插卡数据
  private insertRelatedBookId = ''; // 中插卡关联的bookid
  private insertCardRenderData: any = null; // 中插卡的渲染数据
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle401');
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
    activeEventObserver.addEventObserver(() => {
      // 触发页面显示状态
      this.isFromActive = true;
      // 返回出中插卡推书卡片
      this.renderInsertBookCard();
    });
  }

  public componentDidMount() {
    this.updateShownBooks(this.props);
    this.scaleAnim.onHippyAnimationEnd(() => {
      // 执行跳转
      this.clickBlankJumpMore();
    });
    emitter.on(events.REFRESH_COMPLETE, this.doDataRefresh);
  }

  public componentWillUnmount() {
    this.scaleAnim?.destory();
    emitter.off(events.REFRESH_COMPLETE, this.doDataRefresh);
  }

  /** Tab数据刷新（下拉刷新、底部icon点击、顶部当前tab点击触发的刷新） */
  public doDataRefresh = (refreshTabId) => {
    const { selectTabID = 0 } = this.props;

    if (refreshTabId === selectTabID) {
      // 重置中插卡状态
      this.isLoadingInsertData = false;
      this.insertRelatedBookId = '';
      this.insertCardRenderData = null;
      canShowInsertCardTabMap[selectTabID] = false;
      this.setState({ canShowInsertCard: false });
    }
  };

  /**
   * 更新展示的的书籍
   * @param props props
   */
  public updateShownBooks = (props) => {
    const { vDetailData = {} } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
    const books = vectorToArray(vDetailData);
    this.setState(
      {
        books,
      },
      () => {
        const { linkType: refreshType } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
        // 如果是局部刷新换一换，需要动态设置report_info
        refreshType === CardLinkType.CHANGE && this.setReportInfo(props);
      },
    );
  };

  // 设置首屏上报信息
  public setReportInfo = (props) => {
    const { books } = this.state;
    initReportInfo(props, books.length / SHOW_BOOKS_LENGTH);
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

  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.setTabAfterRefresh(nextProps);
    const { linkType = 0, style, bIsFirstInfinite } = FeedsUtils.getSafeProps(nextProps, 'itemBean.parsedObject', {});
    addKeylink(`tag style: ${style}, bIsFirstInfinite: ${bIsFirstInfinite}, title: ${nextProps?.itemBean?.title}`, TAG);
    if (linkType === CardLinkType.MORE) reportUDS(BusiKey.EXPOSE__TO_MORE, this.props);
  }

  public UNSAFE_componentWillMount() {
    const { itemBean = {} } = this.props;
    const { report_info: reportInfo = [] } = itemBean || {};
    reportInfo?.forEach(([key, value]) => {
      if (key === 'sTraceId') {
        this.traceid = value;
        return;
      }
    });
  }

  /** 刷新时候重置位置 */
  public setTabAfterRefresh = (nextProps) => {
    // 如果是active造成的页面响应,不用重置
    if (this.isFromActive) {
      this.isFromActive = false;
      return;
    }
    this.updateShownBooks(nextProps);
    this.setState({
      iposition: 0,
    });
  };

  /**
   * 切换猜你想看 换一换
   */
  public switchNovel = (refreshKey = '') => {
    let { iposition, books } = this.state;
    // 书籍按照每页个数拆分后的最大索引
    const pageIdx = Math.floor(books.length / SHOW_BOOKS_LENGTH) - 1;
    iposition = iposition === pageIdx ? 0 : iposition + 1;

    switchNovelPrefetch(this.props, iposition, pageIdx, SHOW_BOOKS_LENGTH, (res) => {
      const preFetchBooks = FeedsUtils.getSafeProps(res[refreshKey] || {}, 'parsedObject.vDetailData', []);
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

  public changeReport = (booksId) => {
    const { itemBean = {} } = this.props;
    itemBean.report_info?.forEach((info) => {
      if (info[0] === 'sContentId') {
        // eslint-disable-next-line no-param-reassign
        info[1] = booksId;
      }
    });
  };

  /**
   * 点击卡片内容上报
   */
  public doBeaconByClick = (moreData = {} as any) => {
    const { selectTabID = 0 } = this.props;
    const { canShowInsertCard } = this.state;
    const { book_id: bookId = '' } = moreData;
    if (!canShowInsertCardTabMap[selectTabID] && !canShowInsertCard && !this.isLoadingInsertData) {
      this.insertRelatedBookId = bookId;
      // 点击跳出时拉取，这本书关联的中插推书卡片数据
      this.handleInsertRecomBook();
    }
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, moreData);
  };

  /**
   * 点击查看全部上报
   */
  public doBeaconByClickAll = () => {
    const { linkType = 0 } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    // 如果是查看更多情况上报查看更多
    if (linkType === CardLinkType.MORE) {
      reportUDS(BusiKey.CLICK__TO_MORE, this.props, { traceid: this.traceid });
      return;
    }
    // 如果是无限流场景上报无限流
    if (this.traceid === INFINITE_CARD) {
      reportUDS(BusiKey.CLICK__INFINITE_CARD_INTEREST, this.props, { bigdata_contentid: '' });
    }
  };

  /**
   * 点击换一换上报
   * @param books 当前页的书籍
   * @param position 当前页的下标
   */
  public doBeaconBySwitch = () => {
    const { linkType: refreshType, refreshKey = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const isPreFetch = refreshType === CardLinkType.CHANGE && refreshKey !== '';

    reportUDS(BusiKey.CLICK__CARD_CHANGE, this.props, {
      bigdata_contentid: '',
      ext_data1: isPreFetch ? '1' : '0',
    });
  };

  /** 列表书籍卡片layout，中插卡片的书籍也走这里 */
  public onBookItemLayout = (event, bookIndex, bookInfo) => {
    const rect = { ...event.layout };
    const {
      sBookId: bookId,
      cardRelatedBookId = '', // 无限流中标识中插卡片本身
      fromInsertCard = false, // 来自中插卡的书籍
    } = bookInfo || {};
    const cardIndex = this.props.index;
    const { books = [], iposition: tabIndex, canShowInsertCard } = this.state;
    if (cardRelatedBookId) {
      // 中插卡本身非书籍维度，不上报曝光
      return;
    }

    // 处理无限流卡中有中插卡情况下，精准曝光上报相关信息
    let realBookIndex = bookIndex;
    let extInfo = {};
    if (canShowInsertCard && this.insertCardRenderData) {
      // 有中插卡数据表示显示无限流中插卡片
      const relatedBookIdx = books.findIndex(book => book.sBookId === this.insertRelatedBookId);
      if (fromInsertCard) {
        extInfo = {
          fromInsertCard: true,
          reportInfo: this.insertCardRenderData.cardData?.reportInfo || {},
          relatedBookId: this.insertRelatedBookId,
        };
        // 中插卡中的书籍的索引加到原无限流卡片顺序的最后
        realBookIndex = bookIndex + books.length;
        // 中插卡中的书籍的y值需要追加baseY（baseY = 卡片的y值 + 卡片标题的高度）
        const { y = 0, height = 0 } =
          strictExposeReporter.getExpoItemRect(cardIndex, tabIndex, relatedBookIdx, this.insertRelatedBookId) || {};
        rect.y += y + height + InsertCardTitleHeight;
      } else {
        // 排除中插卡对无限流普通书籍的index+1的影响
        realBookIndex = relatedBookIdx >= bookIndex ? bookIndex : bookIndex - 1;
      }
    }

    strictExposeReporter.addExpoItem({
      cardIndex,
      tabIndex,
      bookIndex: realBookIndex,
      bookId,
      rect,
      extInfo,
    });
  };

  /** 列表书籍卡片标题layout */
  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /**
   * 空白区域跳转到更多页面
   * 跳转地址不为空
   * 支持跳转
   */
  public clickBlankJumpMore = () => {
    const { moreLink = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (moreLink !== '') {
      this.loadUrl(moreLink);
    }
  };

  /**
   * 需要展示的数据
   * @param {所有书籍内容} books
   * @param {是否无限流} isUnlimited
   * @param {是否支持本地换一换} changeable
   */
  public getShowBooks = (books, changeable) => {
    const { iposition, canShowInsertCard } = this.state;
    const { linkType = 0 } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    let shownBooks: any[] = [];
    if (linkType === CardLinkType.MORE) {
      // 如果命中实验（linktype为1）换一换则固定展示三本书，右上角展示“查看更多”
      shownBooks = doSliceArray(books, 0, SHOW_BOOKS_LENGTH);
    } else if (changeable) {
      // 如果是每日推荐卡片（支持换一换），则每屏显示3本书
      shownBooks = doSliceArray(books, iposition * SHOW_BOOKS_LENGTH, (iposition + 1) * SHOW_BOOKS_LENGTH);
    } else if (canShowInsertCard && this.insertCardRenderData) {
      // 如果有中插书籍卡片，则将中插卡数据插入数组
      const insertRelatedBookIdx = books
        .findIndex(book => book.sBookId === this.insertCardRenderData?.cardRelatedBookId);
      shownBooks =
        insertRelatedBookIdx > -1
          ? [
            ...books.slice(0, insertRelatedBookIdx + 1),
            this.insertCardRenderData, // 中间插入推书卡片
            ...books.slice(insertRelatedBookIdx + 1),
          ]
          : books;
    } else {
      // 否则每屏显示所有返回的书籍
      shownBooks = books;
    }
    return shownBooks;
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle401');
    const { itemBean = {}, index: cardIndex, globalConf } = this.props;
    const { title } = itemBean || {};
    const {
      bIsFirstInfinite = false, // 是无限流第一刷
      bChangable = false,
      linkType = 0,
      refreshKey = '',
    } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const { iposition, books, isFeedBackVisible } = this.state;
    // 如果没有title，说明是无限加载卡片的非第一刷
    const isUnlimited = !title;
    // 是否是无限加载流卡片-猜你喜欢（bIsFirstInfinite为true，或者title为空表示无限流）
    const isFeedsList = bIsFirstInfinite || isUnlimited;
    // 非无限流的卡片-每日推荐，如果数据为空则不展示（无限加载流卡片首次数据为空，也要展示标题）
    if (books.length === 0 && !isFeedsList) return null;
    // bChangble 表示是否支持本地换一换， linkType为2表示命中局部刷新实验
    const canChange = bChangable || linkType === CardLinkType.CHANGE;
    // 无限流卡片重置换一换标识为false
    const changeable = isFeedsList ? false : canChange;
    // 无限流卡片外层容器的样式
    const feedsWrapperStyle = bIsFirstInfinite ? styles.lastCardStyle : styles.unlimited;

    // 表示显示的书籍，如果存在换一换，则每屏显示3本书，否则每屏显示所有返回的书籍
    const shownBooks = this.getShowBooks(books, changeable);
    strictExposeReporter.updateBookIds(cardIndex, iposition, this.getBookIds(shownBooks));
    const titleRight = getTitleRight(this.props);

    // 是否支持负反馈
    const isNeedFeedBack = isFeedsList && !isTopTab();

    return (
      <View
        collapsable={false}
        style={[
          isFeedsList ? feedsWrapperStyle : { ...CommonCardStyle, paddingBottom: 12 },
          { transform: [{ scale: isFeedsList ? 1 : this.scaleAnim }] },
        ]}
      >
        {isUnlimited ? null : (
          <View collapsable={false} onClick={isFeedsList ? emptyFn : this.onClickTitle}>
            <Title
              title={title}
              onLayout={this.onTitleLayout}
              right={titleRight}
              switchNovel={() => this.switchNovel(refreshKey)}
              changeable={changeable && linkType !== CardLinkType.MORE} // loadmore的时候不能展示换一换
              parent={this}
              showDot={
                books.slice(0, 4).every(o => !o.sUpdatedNumber || o.sUpdatedNumber === '0') &&
                books.slice(4).some(o => o.sUpdatedNumber && o.sUpdatedNumber !== '0')
              }
              doBeaconByClick={this.doBeaconByClickAll}
            />
          </View>
        )}
        <View collapsable={false} style={globalConf.style}>{this.renderShownBooks(shownBooks)}</View>
        {isNeedFeedBack ? (
          <FeedBack visible={isFeedBackVisible} onClose={this.closeFeedsBack} itemClick={this.feedBackClick} />
        ) : null}
      </View>
    );
  }

  private renderShownBooks = (shownBooks) => {
    const { itemBean, selectTabID, globalConf } = this.props;
    const {
      bIsFirstInfinite = false, // 是无限流第一刷,
      style: styleExperimentType = 0,
    } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const { shouldHideBooks, canShowInsertCard } = this.state;

    // 如果没有title，说明是无限加载卡片的非第一刷
    const isUnlimited = !itemBean?.title;

    // 是否是无限加载流卡片-猜你喜欢（bIsFirstInfinite为true，或者title为空表示无限流）
    const isFeedsList = bIsFirstInfinite || isUnlimited;

    // 是否支持负反馈
    const isNeedFeedBack = isFeedsList && !isTopTab();

    return shownBooks.map((book, index) => {
      if (!book || shouldHideBooks.includes(book.sBookId)) return null;
      const { sBookId, sState, sCategory3, sTitle, sPicUrl, sUrl, sScore, sBrief, sHot, sAuthor, sTag, stIcon } = book;
      const reasons = vectorToArray(book.vRecommendReasons);
      const vOpReasons = vectorToArray(book.vOpReasons);
      // 是否出中插推书卡片
      const showInsertCard = canShowInsertCard && book.cardRelatedBookId === this.insertRelatedBookId;
      return (
        <View key={`${book.sBookId}_${index}`} onLayout={event => this.onBookItemLayout(event, index, book)}>
          {showInsertCard ? (
            <FeedsViewUIStyle432 {...book} curTabId={selectTabID} onBookItemLayout={this.onBookItemLayout} />
          ) : (
            <View>
              <PicText
                title={sTitle}
                picUrl={sPicUrl}
                openUrl={sUrl}
                score={sScore}
                intro={sBrief}
                tag={sTag}
                hot={sHot}
                author={sAuthor}
                bookid={sBookId}
                type={sCategory3}
                recommendReasons={reasons}
                status={sState}
                hasButton={isNeedFeedBack}
                item_id={itemBean?.item_id}
                parents={this}
                globalConf={globalConf}
                bookIndex={index}
                leftTag={stIcon}
                selectTabID={selectTabID}
                doBeaconByClick={this.doBeaconByClick}
                isUnlimited={isUnlimited}
                onFeedBack={() => this.showFeedsBack(book)}
                styleExperimentType={styleExperimentType}
                vOpReasons={vOpReasons}
              />
              {book.sRecommendDebugInfo ? <DebugInfo info={book.sRecommendDebugInfo} style={styles.debugInfo} /> : null}
            </View>
          )}
        </View>
      );
    });
  };

  /** 获取书籍id，排除无限流中插卡本身，插入中插卡的书籍id */
  private getBookIds = (shownBooks): string[] => {
    const { canShowInsertCard } = this.state;

    // 排除无限流中插卡本身
    const bookIds = shownBooks.filter(bookItem => !bookItem.cardRelatedBookId).map(item => item.sBookId);
    if (!(canShowInsertCard && this.insertCardRenderData)) return bookIds;

    const insertBookList = this.getBooksFromInSertCardData(this.insertCardRenderData);
    const insertBookIds = insertBookList.map(book => book.resourceId);
    if (insertBookIds.length) {
      bookIds.splice(bookIds.length, 0, ...insertBookIds); // 插入中插卡里的书籍id
    }
    return bookIds;
  };

  /** 无限流卡片中，是否能中插推书卡片 */
  private canInsertBook = async (): Promise<boolean> => {
    try {
      if (isTopTab()) return false;
      if (this.state.canShowInsertCard) return false;
      if (this.isLoadingInsertData || !this.insertRelatedBookId) return false;

      const { title, parsedObject } = this.props.itemBean || {};
      const { bIsFirstInfinite = false } = parsedObject || {};
      // 非 无限加载流卡片-猜你喜欢（bIsFirstInfinite为true，或者title为空表示无限流），直接返回
      const isFeedsList = bIsFirstInfinite || !title;
      if (!isFeedsList) return false;

      // 频控: 一天只出三次（所有tab无限流卡片公用一天三次）
      const { date = '', time = 0 } = (await readSharedSettings(InsertRecomBookCardKey)) || {};
      if (date === FormatUtils.formatDate(Date.now(), true) && time >= 3) return false;

      return true;
    } catch (err) {
      logError(err, 'FeedsViewUIStyle401.canInsertBook');
      return false;
    }
  };

  /**
   * 拉取无限流中插的推书卡片数据
   * @param bookId 中插卡关联的书id
   */
  private handleInsertRecomBook = async (): Promise<void> => {
    try {
      const canInsertBook = await this.canInsertBook();
      if (!canInsertBook) {
        return;
      }

      this.isLoadingInsertData = true;
      // 处理推书逻辑
      const { globalConf, selectTabID } = this.props || {};
      const result = await FeedsTraversal.traversal(
        selectTabID,
        NOVEL_BUSINESS_ID,
        {
          func: 'LocalRefresh',
          needCardWithSize: [
            {
              cardName: 'TabRecommCardInInfinity',
              itemSize: 0,
              itemId: this.insertRelatedBookId,
            },
          ],
        },
        globalConf,
      );
      const { success, content, code } = result || {};
      if (!success) {
        this.isLoadingInsertData = false;
        logError(
          `LocalRefresh.TabRecommCardInInfinity, code=${code}, tabid=${selectTabID}`,
          'FeedsViewUIStyle401.handleInsertRecomBook',
        );
        return;
      }

      // 如果长度为空，则表示没有命中实验
      const vItemListData = content?.vItemListData || [];
      if (vItemListData.length === 0) {
        this.isLoadingInsertData = false;
        return;
      }

      // 解析响应体重的sStyleJson.sData字符串转成json对象
      const insertCardRenderData = vItemListData[0] || {};
      const { sStyleJson } = insertCardRenderData;
      if (!sStyleJson) {
        this.isLoadingInsertData = false;
        logError(`sStyleJson is empty, sStyleJson=${sStyleJson}`, 'FeedsViewUIStyle401.handleInsertRecomBook');
        return;
      }
      const cardData = JSON.parse(JSON.parse(sStyleJson).sData) || {};
      insertCardRenderData.cardData = cardData;
      delete insertCardRenderData.sStyleJson;
      insertCardRenderData.cardRelatedBookId = this.insertRelatedBookId; // 无限流卡书籍列表中，中插卡才有cardRelatedBookId这个字段!
      insertCardRenderData.sBookId = `InsetRecomCard_${this.insertRelatedBookId}`; // 特殊标识这个卡的bookId

      // 给中插卡的书籍添加索引字段
      const bookList = this.getBooksFromInSertCardData(insertCardRenderData);
      bookList.forEach((bookItem, idx) => {
        // eslint-disable-next-line no-param-reassign
        bookItem.bookIndex = idx;
      });
      this.insertCardRenderData = insertCardRenderData;
      this.isLoadingInsertData = false;
    } catch (err) {
      logError(err, 'FeedsViewUIStyle401.handleInsertRecomBook');
      this.isLoadingInsertData = false;
    }
  };

  /** 触发中插卡渲染 */
  private renderInsertBookCard = async () => {
    try {
      const { selectTabID = 0 } = this.props;
      if (!this.insertCardRenderData || this.state.canShowInsertCard || canShowInsertCardTabMap[selectTabID]) return;

      canShowInsertCardTabMap[selectTabID] = true;
      this.setState({
        canShowInsertCard: true,
      });

      // 更新频控
      const { date = '', time = 0 } = (await readSharedSettings(InsertRecomBookCardKey)) || {};
      const curDate = FormatUtils.formatDate(Date.now(), true);
      writeSharedSettings(InsertRecomBookCardKey, {
        date: curDate,
        time: date && date !== curDate ? 1 : time + 1,
      });
    } catch (err) {
      logError(err, 'FeedsViewUIStyle401.renderInsertBookCard');
    }
  };

  /** 获取中插卡的书籍列表 */
  private getBooksFromInSertCardData = (insertCardData): any[] => {
    const { layoutList = [] } = insertCardData?.cardData || {};
    const bookList = layoutList.reduce((acc, layout) => {
      const { dataList = [] } = layout || {};
      return [...acc, ...dataList.filter(dateItem => !!dateItem.resourceId)];
    }, []);
    return bookList;
  };

  /** 负反馈点击 */
  private showFeedsBack = (book) => {
    const { sBookId } = book;
    const { selectTabID } = this.props || {};
    if (!sBookId) return;
    reportUDS(BusiKey.CLICK__FEEDBACK_BTN, this.props, {
      traceid: this.traceid,
      ext_data1: selectTabID, // tabid
      ext_data2: sBookId, // bookid
    });
    this.setState(
      {
        isFeedBackVisible: true,
        feedBackBookId: sBookId,
      },
      () => {
        reportUDS(BusiKey.EXPOSE__FEEDBACK_BG, this.props, {
          traceid: this.traceid,
          ext_data1: selectTabID, // tabid
          ext_data2: sBookId, // bookid
        });
      },
    );
  };

  /** 负反馈点击 */
  private feedBackClick = async (type) => {
    const { globalConf, selectTabID } = this.props || {};
    const { feedBackBookId } = this.state;
    reportUDS(BusiKey.CLICK__FEEDBACK_ITEM, this.props, {
      traceid: this.traceid,
      ext_data1: selectTabID, // tabid
      ext_data2: feedBackBookId, // bookid
      ext_data3: type, // 选项类型
    });
    if (feedBackBookId !== '') {
      const rpcRequest = {
        func: 'UserFeedBack',
        id: feedBackBookId,
        id_type: FeedsSourceType.BookFeedBack,
        reason: type,
      };
      try {
        const res = await FeedsTraversal.traversal(selectTabID, NOVEL_BUSINESS_ID, rpcRequest, globalConf, {});
        const { success = false, code = 0 } = res;
        if (success) {
          QBToastModule.show(FeedsBackMsg, '', 2500);
          const { shouldHideBooks } = this.state;
          shouldHideBooks.push(feedBackBookId);
          this.setState({
            shouldHideBooks,
          });
        } else {
          addKeylink(`feedsBackError, code=${code}, bookid=${feedBackBookId}, tabid=${selectTabID}`, 'feedBackClick');
        }
      } catch (e) {
        logError(`feedsBackError, err=${e},bookid=${feedBackBookId}, tabid=${selectTabID}`, 'feedBackClick');
      }
    }
    this.setState({
      isFeedBackVisible: false,
      feedBackBookId: '',
    });
  };

  private closeFeedsBack = () => {
    this.setState({
      isFeedBackVisible: false,
    });
  };
}

const styles = StyleSheet.create({
  unlimited: {
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    marginVertical: 0,
    marginHorizontal: 12,
  },
  unlimitedInside: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  lastCardStyle: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: CardRadius,
    borderTopRightRadius: CardRadius,
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    marginHorizontal: 12,
    marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
  },
  debugInfo: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 5,
    paddingBottom: 5,
    colors: FeedsTheme.SkinColor.N1_5,
    fontSize: FeedsUIStyle.T1,
  },
});
