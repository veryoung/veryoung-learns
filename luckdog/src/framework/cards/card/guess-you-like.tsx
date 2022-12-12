import React from 'react';
import { QBToastModule, View } from '@tencent/hippy-react-qb';
import { CommonProps } from '../../../entity';
import { BeaconReportProps, reportUDS, BusiKey, strictExposeReporter, addKeylink, logError } from '@/luckdog';
import FeedsProtect from '../../../mixins/FeedsProtect';
import {
  FeedsTheme, FeedsTraversal, FeedsUIStyle, FeedsUtils, FormatUtils,
} from '../../../feeds-styles/tab-22/components/utils';
import { scale } from '../../../components/animationStyle';
import { CommonCardStyle, NOVEL_BUSINESS_ID, INFINITE_CARD_KEY, KNOWLEDGE_INFINITE_CARD_KEY } from '../../FeedsConst';
import { Title } from '../components/title';
import { NormalCard, RightBehavior } from '../../protocol/card';
import { countReRender, shouldComponentUpdate, isTopTab } from '@/luckbox';
import { PicText } from '../components/pic-text';
import FeedBack, { FeedsSourceType } from '../../../feeds-styles/tab-22/components/feedback';
import { emitter, events } from '../../../utils/emitter';
import { readSharedSettings, writeSharedSettings } from '../../../utils/shareSettings';
import FeedsViewUIStyle432 from '../../../feeds-styles/tab-22/ui-style-432';
import { activeEventObserver } from '../../../utils/NativeEventAdapter';
import { doSliceArray } from '@tencent/luckbox-base-array';
import { UIType } from '../../protocol';

interface Props extends BeaconReportProps, CommonProps {
  index: number;
  key: string;
  globalConf: any;
  totalLength: number;
  curTabId: number;
  data: NormalCard;
}
const ShowBooksLength = 3;
/** 负反馈内容 */
const FeedsBackMsg = '感谢反馈 我们将减少此类推荐';

/** 推荐插卡相关 */
const InsertRecomBookCardKey = 'InsertRecomBookCardKey';
const InsertCardTitleHeight = 52;
/** 各tab的无限流卡片可能有多个401卡片，控制单tab多个401只展示一个中插卡 */
const canShowInsertCardTabMap: Record<string, boolean> = {};

interface State {
  /** 换一换数据所在的索引 */
  position: number;//
  /** 书籍内容 */
  books: any[];
  /** 负反馈弹窗是否可见 */
  feedBackVisible: boolean;
  /** 负反馈关联的书籍id */
  feedBackBookId: string;
  /** 负反馈成功后需要隐藏的书籍 */
  shouldHideBooks: string[];
  /** 能否显示中插卡 */
  canShowInsertCard: boolean;
}

/** 猜你喜欢推荐卡 */
@FeedsProtect.protect
export class GuessYouLike extends React.Component<Props> {
  public static getRowType() {
    return UIType.GUESS_YOU_LIKE;
  }
  /** 点击动画效果 */
  public scaleAnim = scale(200, 1.015);
  /** 当前页面状态 */
  public state: State = {
    position: 0,
    books: [],
    feedBackVisible: false,
    feedBackBookId: '',
    shouldHideBooks: [],
    canShowInsertCard: false,
  };
  /** 算法id */
  public traceid = '';
  private isLoadingInsertData = false; // 是否在拉取中插卡数据
  private insertRelatedBookId = ''; // 中插卡关联的bookid
  private insertCardRenderData: any = null; // 中插卡的渲染数据

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'GuessYouLike');

    activeEventObserver.addEventObserver(() => {
      // 返回出中插卡推书卡片
      this.renderInsertBookCard();
    });
  }

  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.updateShownBooks(nextProps);
  }

  public componentDidMount() {
    this.updateShownBooks(this.props);
    emitter.on(events.REFRESH_COMPLETE, this.doDataRefresh);
  }

  /**
   * 更新展示的的书籍
   * @param props props
   */
  public updateShownBooks = (props) => {
    const layoutList = FeedsUtils.getSafeProps(props, 'data.layoutList', []);
    const books = layoutList[0]?.dataList || [];
    this.setState({
      books,
    });
  };

  public componentWillUnmount() {
    emitter.off(events.REFRESH_COMPLETE, this.doDataRefresh);
  }

  /** Tab数据刷新（下拉刷新、底部icon点击、顶部当前tab点击触发的刷新） */
  public doDataRefresh = (refreshTabId) => {
    const { curTabId = 0 } = this.props;
    if (refreshTabId === curTabId) {
      // 重置中插卡状态
      this.isLoadingInsertData = false;
      this.insertRelatedBookId = '';
      this.insertCardRenderData = null;
      canShowInsertCardTabMap[curTabId] = false;
      this.setState({ canShowInsertCard: false });
    }
  };

  /** 计算布局 */
  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /**
   * 切换猜你想看 换一换
   */
  public switchNovel = () => {
    let { position } = this.state;
    const { books } = this.state;
    // 书籍按照每页个数拆分后的最大索引
    const pageIdx = Math.floor(books.length / ShowBooksLength) - 1;
    position = position === pageIdx ? 0 : position + 1;
    this.setState({
      position,
    });

    this.reportUDS(BusiKey.CLICK__CARD_CHANGE);
  };

  /**
   * 点击卡片内容上报
   */
  public doBeaconByClick = (moreData) => {
    const { canShowInsertCard } = this.state;
    const { curTabId = 0 } = this.props;
    const { book_id: bookId = '' } = moreData || {};
    if (!canShowInsertCardTabMap[curTabId] && !canShowInsertCard && !this.isLoadingInsertData) {
      this.insertRelatedBookId = bookId;
      // 点击跳出时拉取，这本书关联的中插推书卡片数据
      this.handleInsertRecomBook();
    }
    this.reportUDS(BusiKey.CLICK__CARD_BOOK, moreData);
  };

  /** 点击设置阅读喜好 */
  public clickSettings = () => {
    this.reportUDS(BusiKey.CLICK__INFINITE_CARD_INTEREST);
  };

  /** 计算布局 */
  public onBookItemLayout = (event, bookIndex, bookInfo) => {
    const {
      resourceId: bookId,
      cardRelatedBookId = '', // 无限流中标识中插卡片本身
      fromInsertCard = false, // 来自中插卡的书籍
    } = bookInfo || {};
    if (cardRelatedBookId) {
      // 中插卡本身非书籍维度，不上报曝光
      return;
    }
    const rect = { ...event.layout };
    const cardIndex = this.props.index;
    const { books = [], position: tabIndex, canShowInsertCard } = this.state;

    // 处理无限流卡中有中插卡情况下，精准曝光上报相关信息
    let realBookIndex = bookIndex;
    let extInfo = {};
    if (canShowInsertCard && this.insertCardRenderData) { // 有中插卡数据表示显示无限流中插卡片
      const relatedBookIdx = books.findIndex(book => book.resourceId === this.insertRelatedBookId);
      if (fromInsertCard) {
        extInfo = {
          fromInsertCard: true,
          reportInfo: this.insertCardRenderData.cardData?.reportInfo || {},
          relatedBookId: this.insertRelatedBookId,
        };
        // 中插卡中的书籍的索引加到原无限流卡片顺序的最后
        realBookIndex = bookIndex + books.length;
        // 中插卡中的书籍的y值需要追加baseY（baseY = 卡片的y值 + 卡片标题的高度）
        const { y = 0, height = 0 } = strictExposeReporter.getExpoItemRect(
          cardIndex,
          tabIndex,
          relatedBookIdx,
          this.insertRelatedBookId,
        ) || {};
        rect.y += (y + height) + InsertCardTitleHeight;
      } else {
        // 排除中插卡对无限流普通书籍的index+1的影响
        realBookIndex = relatedBookIdx >= bookIndex ? bookIndex : (bookIndex - 1);
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

  /**
   * 需要展示的数据
   * @param {所有书籍内容} books
   * @param {是否无限流} isUnlimited
   * @param {是否支持本地换一换} changeable
   */
  public getShowBooks = (books, changeable) => {
    const { position, canShowInsertCard } = this.state;
    let shownBooks: any[] = [];
    if (changeable) {
      // 如果是每日推荐卡片（支持换一换），则每屏显示3本书
      shownBooks = doSliceArray(books, position * ShowBooksLength, (position + 1) * ShowBooksLength);
    } else if (canShowInsertCard && this.insertCardRenderData) {
      // 如果有中插书籍卡片，则将中插卡数据插入数组
      const insertRelatedBookIdx = books.findIndex(book => (
        book.resourceId === this.insertCardRenderData?.cardRelatedBookId
      ));
      shownBooks = insertRelatedBookIdx > -1 ? [
        ...books.slice(0, insertRelatedBookIdx + 1),
        this.insertCardRenderData, // 中间插入推书卡片
        ...books.slice(insertRelatedBookIdx + 1),
      ] : books;
    } else {
      // 否则每屏显示所有返回的书籍
      shownBooks = books;
    }
    return shownBooks;
  };


  public render() {
    countReRender(this, 'GuessYouLike');
    const { data, index: cardIndex, globalConf } = this.props;
    const { title, layoutList, hiddenHead, cardKey, jumpLink, behavior } = data;
    const { position, feedBackVisible, books } = this.state;
    if (!layoutList) return null;
    // 是否是无限流卡
    const isInfinite = [INFINITE_CARD_KEY, KNOWLEDGE_INFINITE_CARD_KEY].includes(cardKey);
    const isFirstInfinite = isInfinite && !hiddenHead;
    // 判断是否能够换一换(需要非无限流卡片且本地或者远程换一换)
    const canChange = !isInfinite
      && (behavior === RightBehavior.REFRESH_LOCAL || behavior === RightBehavior.REFRESH_SERVER);
    const isFeedsList = isFirstInfinite || hiddenHead;
    // 非无限流的卡片-每日推荐，如果数据为空则不展示（无限加载流卡片首次数据为空，也要展示标题）
    if (books?.length === 0 && !isFeedsList) return null;
    // 无限流卡片外层容器的样式
    const feedsWrapperStyle = isFirstInfinite ? styles.lastCardStyle : styles.unlimited;
    const bookIds = books?.map(item => item.resourceId);
    strictExposeReporter.updateBookIds(cardIndex, position, bookIds);
    // 表示显示的书籍，如果存在换一换，则每屏显示3本书，否则每屏显示所有返回的书籍
    const shownBooks = this.getShowBooks(books, canChange);
    // 是否支持负反馈
    const isNeedFeedBack = isInfinite && !isTopTab();
    return (
      <View
        collapsable={false}
        style={[
          isFeedsList ? feedsWrapperStyle : CommonCardStyle,
          { transform: [{ scale: isFeedsList ? 1 : this.scaleAnim }] },
        ]}
      >
        {
          hiddenHead ? null : (
            <View collapsable={false}>
              <Title
                title={title}
                onLayout={this.onTitleLayout}
                switchNovel={() => this.switchNovel()}
                parent={this}
                right={jumpLink}
                doBeaconByClick={this.clickSettings}
              />
            </View>
          )
        }
        <View style={globalConf.style} collapsable={false}>
          {
            this.renderContent(shownBooks, isNeedFeedBack, hiddenHead)
          }
        </View>
        {
          isNeedFeedBack ? <FeedBack
            visible={feedBackVisible}
            onClose={this.closeFeedsBack}
            itemClick={this.feedBackClick}
          /> : null
        }
      </View>
    );
  }

  /**
   * 渲染中心内容卡
   * @param shownBooks 书籍内容
   * @param isNeedFeedBack 是否需要负反馈
   * @param hiddenHead 是否隐藏头部
   */
  private renderContent = (shownBooks, isNeedFeedBack, hiddenHead) => {
    const { curTabId, globalConf, data } = this.props;
    const { canShowInsertCard, shouldHideBooks } = this.state;
    return shownBooks.map((book, index) => {
      if (!book || shouldHideBooks.includes(book.resourceId)) return null;
      // 是否出中插推书卡片
      const showInsertCard = canShowInsertCard && (book as any).cardRelatedBookId === this.insertRelatedBookId;
      return (
        <View
          key={`${index}`}
          onLayout={event => this.onBookItemLayout(event, index, book)}
        >
          {
            showInsertCard
              ? <FeedsViewUIStyle432
                {...book}
                curTabId={curTabId}
                onBookItemLayout={this.onBookItemLayout}
              /> : <PicText
                bookInfo={book}
                cardKey={data.cardKey}
                hasButton={isNeedFeedBack}
                parents={this}
                globalConf={globalConf}
                bookIndex={index}
                selectTabID={curTabId}
                doBeaconByClick={this.doBeaconByClick}
                isUnlimited={hiddenHead}
                onFeedBack={() => this.showFeedsBack(book)}
              />
          }
        </View>
      );
    });
  };

  /** 触发中插卡渲染 */
  private renderInsertBookCard = async () => {
    try {
      const { curTabId = 0 } = this.props;
      if (!this.insertCardRenderData || this.state.canShowInsertCard || canShowInsertCardTabMap[curTabId]) return;

      canShowInsertCardTabMap[curTabId] = true;
      this.setState({
        canShowInsertCard: true,
      });

      // 更新频控
      const { date = '', time = 0 } = await readSharedSettings(InsertRecomBookCardKey) || {};
      const curDate = FormatUtils.formatDate(Date.now(), true);
      writeSharedSettings(InsertRecomBookCardKey, {
        date: curDate,
        time: date && date !== curDate ? 1 : time + 1,
      });
    } catch (err) {
      logError(err, 'GuessYouLike.renderInsertBookCard');
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
      const { globalConf, curTabId } = this.props || {};
      const result = await FeedsTraversal.traversal(curTabId, NOVEL_BUSINESS_ID, {
        func: 'LocalRefresh',
        needCardWithSize: [{
          cardName: 'TabRecommCardInInfinity',
          itemSize: 0,
          itemId: this.insertRelatedBookId,
        }],
      }, globalConf);
      const { success, content, code } = result || {};
      if (!success) {
        this.isLoadingInsertData = false;
        logError(`LocalRefresh.TabRecommCardInInfinity, code=${code}, tabid=${curTabId}`, 'GuessYouLike.handleInsertRecomBook');
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
        logError(`sStyleJson is empty, sStyleJson=${sStyleJson}`, 'GuessYouLike.handleInsertRecomBook');
        return;
      }
      const cardData = JSON.parse(JSON.parse(sStyleJson).sData) || {};
      insertCardRenderData.cardData = cardData;
      delete insertCardRenderData.sStyleJson;
      insertCardRenderData.cardRelatedBookId = this.insertRelatedBookId; // 无限流卡书籍列表中，中插卡才有cardRelatedBookId这个字段!
      insertCardRenderData.resourceId = `InsetRecomCard_${this.insertRelatedBookId}`; // 特殊标识这个卡的bookId

      // 给中插卡的书籍添加索引字段
      const bookList = this.getBooksFromInSertCardData(insertCardRenderData);
      bookList.forEach((bookItem, idx) => {
        // eslint-disable-next-line no-param-reassign
        bookItem.bookIndex = idx;
      });
      this.insertCardRenderData = insertCardRenderData;
      this.isLoadingInsertData = false;
    } catch (err) {
      logError(err, 'GuessYouLike.handleInsertRecomBook');
      this.isLoadingInsertData = false;
    }
  };

  /** 无限流卡片中，是否能中插推书卡片 */
  private canInsertBook = async (): Promise<boolean> => {
    try {
      if (isTopTab()) return false;
      if (this.state.canShowInsertCard) return false;
      if (this.isLoadingInsertData || !this.insertRelatedBookId) return false;
      const { data } = this.props;
      const { cardKey, hiddenHead } = data;
      // 是否是无限流卡
      const isFirstInfinite = [INFINITE_CARD_KEY, KNOWLEDGE_INFINITE_CARD_KEY].includes(cardKey);
      const isFeedsList = isFirstInfinite || hiddenHead;
      if (!isFeedsList) return false;

      // 频控: 一天只出三次（所有tab无限流卡片公用一天三次）
      const { date = '', time = 0 } = await readSharedSettings(InsertRecomBookCardKey) || {};
      if (date === FormatUtils.formatDate(Date.now(), true) && time >= 3) return false;

      return true;
    } catch (err) {
      logError(err, 'GuessYouLike.canInsertBook');
      return false;
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

  /** 打开负反馈框 */
  private showFeedsBack = (book) => {
    const { resourceId } = book;
    const { curTabId } = this.props || {};
    if (!resourceId) return;
    this.reportUDS(BusiKey.CLICK__FEEDBACK_BTN, {
      ext_data1: curTabId,
      ext_data2: resourceId,
    });
    this.setState({
      feedBackVisible: true,
      feedBackBookId: resourceId,
    }, () => {
      this.reportUDS(BusiKey.EXPOSE__FEEDBACK_BG, {
        ext_data1: curTabId,
        ext_data2: resourceId,
      });
    });
  };

  /** 负反馈点击 */
  private feedBackClick = async (type) => {
    const { globalConf, curTabId } = this.props || {};
    const { feedBackBookId } = this.state;
    this.reportUDS(BusiKey.CLICK__FEEDBACK_ITEM, {
      ext_data1: curTabId, // tabid
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
        const res = await FeedsTraversal.traversal(curTabId, NOVEL_BUSINESS_ID, rpcRequest, globalConf, {});
        const { success = false, code = 0 } = res;
        if (success) {
          QBToastModule.show(FeedsBackMsg, '', 2500);
          const { shouldHideBooks } = this.state;
          shouldHideBooks.push(feedBackBookId);
          this.setState({
            shouldHideBooks,
          });
        } else {
          addKeylink(`feedsBackError, code=${code}, bookid=${feedBackBookId}, tabid=${curTabId}`, 'GuessYouLike.feedBackClick');
        }
      } catch (e) {
        logError(`feedsBackError, err=${e},bookid=${feedBackBookId}, tabid=${curTabId}`, 'GuessYouLike.feedBackClick');
      }
    }
    this.setState({
      feedBackVisible: false,
      feedBackBookId: '',
    });
  };

  /** 关闭负反馈点击狂 */
  private closeFeedsBack = () => {
    this.setState({
      feedBackVisible: false,
    });
  };

  private reportUDS = (eventKey: BusiKey, moreData = {}) => {
    const { reportInfo, uiType } = this.props.data || {};
    reportUDS(eventKey, {}, { ...reportInfo, bigdata_contentid: '', ui_type: uiType, ...moreData });
  };
}

const styles = {
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    marginHorizontal: 12,
    marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
  },
};


