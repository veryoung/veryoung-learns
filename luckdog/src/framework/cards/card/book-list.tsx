import React from 'react';
import { View, Text, ScrollView, StyleSheet } from '@tencent/hippy-react-qb';

import { Title } from '../components/title';
import { CommonCardStyle, SmallBookCoverLeftTagStyle } from '../../FeedsConst';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { BookListCard } from '../../protocol/card';
import { strictExposeReporter, logError, BusiKey, reportUDS } from '@/luckdog';
import { FeedsTheme } from '../../../feeds-styles/tab-22/components/utils';
import FeedsUtils from '../../FeedsUtils';
import { throttle, showToast } from '@/luckbox';
import { BaseBook } from '../../protocol/entity';
import { BookCover } from '../../../components/book-font-cover';
import { emitter, events } from '../../../utils/emitter';
import { requestTabListData } from '@/service';
import { RequestType } from '@/framework/protocol';

interface CompProps {
  index: number;
  curTabId: number;
  data: BookListCard;
}

interface CompState {
  /** 从props传入的卡片数据 */
  cardData: BookListCard,
}

const TAG = 'BookList';

/** 展示3本书再露出一点，适配的书籍高宽 */
const { width } = FeedsUtils.getScreen();
const ImageWidth = (width - (12 * 2) - (16 * 2) - (8 * 2)) / 3;
const ImageHeight = ImageWidth * (134 / 100);

/** 运营语高度 */
const DescHeight = 16 - 10;

@FeedsProtect.protect
export class BookList extends React.Component<CompProps, CompState> {
  private bookScrollView: any = null;
  /** 预拉取下一刷卡片的缓存数据 */
  private nextCardData: BookListCard | null = null;
  /** 是否正在预拉取下一批书单 */
  private isLoadingNextCard = false;

  public constructor(props: CompProps) {
    super(props);
    this.state = {
      cardData: props.data,
    };
  }

  public componentDidMount() {
    const { curTabId, index } = this.props;

    // 预拉取下一刷书单
    this.loadingNextCardData(true);

    emitter.on(events.REFRESH_COMPLETE, this.onTabRefresh);

    // 局部刷新换一换替换上报参数
    strictExposeReporter.addReportDataHandler(curTabId, index, moreData => ({
      ...this.state.cardData.reportInfo,
      ...moreData,
    }));
  }

  public componentWillUnmount() {
    emitter.off(events.REFRESH_COMPLETE, this.onTabRefresh);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: CompProps) {
    const { dataList = [] } = this.state.cardData || {};
    const { dataList: nextDataList = [] } = nextProps.data || {};
    const dataIds = dataList.map(item => item?.resourceId).join(',');
    const nextDataIds = nextDataList.map(item => item?.resourceId).join(',');
    if (dataIds !== nextDataIds) {
      this.setState({
        cardData: nextProps.data,
      }, () => {
        this.loadingNextCardData(true); // 预拉取下一刷书单
      });
    }
  }

  public render() {
    const { title, description, dataList } = this.state.cardData;
    strictExposeReporter.updateBookIds(this.props.index, 0, dataList.map(item => item?.resourceId));

    return <View style={CommonCardStyle}>
      <Title
        title={title}
        changeable={true}
        titleStyle={{ fontSize: 18, lineHeight: 24 }}
        onLayout={this.onTitleLayout}
        switchNovel={this.switchBookList}
      />
      <Text style={styles.description} numberOfLines={1}>{description}</Text>
      <ScrollView
        ref={ref => this.bookScrollView = ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={10}
        contentContainerStyle={styles.bookWrapper}
        onScroll={throttle(this.onBookScroll, 500, 500)}
      >
        {dataList.map((book, index) => this.renderBook(book, index))}
      </ScrollView>
    </View>;
  }

  /** 刷新当前tab */
  private onTabRefresh = () => {
    this.bookScrollView?.scrollTo({ x: 0, y: 0, animated: true });
  };

  /** 更新title布局信息 */
  private onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height + DescHeight);
  };

  /** 滑动时更新卡片x坐标 */
  private onBookScroll = (event) => {
    strictExposeReporter.updateViewportLeft(this.props.index, event.contentOffset.x);
  };

  /** 换书单 */
  private switchBookList = async () => {
    try {
      reportUDS(BusiKey.CLICK__CARD_CHANGE, {}, {
        ...this.state.cardData.reportInfo,
      });

      if (!this.nextCardData) {
        await this.loadingNextCardData(false);
      }

      if (this.nextCardData) {
        this.setState({
          cardData: this.nextCardData,
        }, () => {
          this.bookScrollView?.scrollTo({ x: 0, y: 0, animated: true });
          this.loadingNextCardData(true); // 预拉取下一刷书单
        });
      }
    } catch (err) {
      logError(err, `${TAG}.switchBookList`);
    }
  };

  /** 拉取书单数据 */
  private loadingNextCardData = async (isPreLoad = true) => {
    try {
      const { index, curTabId, data } = this.props;
      if (this.isLoadingNextCard) return;

      this.isLoadingNextCard = true;
      this.nextCardData = null;
      const { code, success: isSuccess, data: rspData = {} } = await requestTabListData({
        tabId: curTabId,
        requestType: RequestType.SPECIFIED_CARD,
        cardKey: [data.cardKey],
      });
      if (isSuccess && rspData.cards?.length) {
        this.nextCardData = rspData.cards[0] as BookListCard;
        // 更新本地缓存
        emitter.emit(events.UPDATE_PAGEVIEW_DATASOURCE, {
          tabId: curTabId,
          cardData: this.nextCardData,
          position: index,
        });
      } else {
        !isPreLoad && showToast('数据拉取失败');
        logError(`loadingNextCardData error, ${JSON.stringify({
          code,
          cardsLength: rspData.cards?.length,
          isPreLoad,
        })}`, `${TAG}.loadingNextCardData`);
      }
      this.isLoadingNextCard = false;
    } catch (err) {
      logError(err, `${TAG}.loadingNextCardData`);
      this.isLoadingNextCard = false;
    }
  };

  /** 渲染单本书 */
  private renderBook = (book: BaseBook, index: number) => {
    const { cardKey } = this.state.cardData;
    const { resourceId, resourceName, picUrl = '', author, tag, jumpUrl = '' } = book || {};
    const leftTag = tag ? FeedsUtils.getBookTagStyle(tag, SmallBookCoverLeftTagStyle) : undefined;
    return <View
      key={`${cardKey}_${resourceId}_${index}`}
      style={[
        styles.bookItem,
        { marginLeft: index === 0 ? 0 : 8, zIndex: 99 },
      ]}
      onLayout={event => this.onBookLayout(event, index, resourceId)}
      onClick={strictExposeReporter.triggerExpoCheck(() => this.clickBook(jumpUrl, resourceId, index))}
    >
      <BookCover
        height={ImageHeight}
        width={ImageWidth}
        url={picUrl}
        bookID={resourceId}
        radius={8}
        leftTag={leftTag}
      />
      <Text style={styles.bookName} numberOfLines={1}>{resourceName}</Text>
      <Text style={styles.author} numberOfLines={1}>{author}</Text>
    </View>;
  };

  /** 书籍卡片的layout，准备书籍的精准曝光 */
  private onBookLayout = (event, bookIndex: number, bookId: string) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      supportHorizontalScroll: true,
      rect: event.layout,
    });
  };

  /** 书籍点击 */
  private clickBook = (jumpUrl: string, resourceId: string, index: number) => {
    const { curTabId } = this.props;
    reportUDS(BusiKey.CLICK__CARD_BOOK, {}, {
      ...this.state.cardData.reportInfo,
      bigdata_contentid: '',
      book_id: resourceId,
      ext_data1: `${index}`,
    }); // 点击上报

    if (!jumpUrl) return;
    FeedsUtils.doLoadUrl(jumpUrl, `${curTabId}`);
  };
}

const styles = StyleSheet.create({
  description: {
    fontSize: 12,
    marginTop: -10,
    paddingHorizontal: 16,
    lineHeight: 16,
    colors: FeedsTheme.SkinColor.N1_4,
  },
  bookWrapper: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  bookItem: {
    width: ImageWidth,
    flexDirection: 'column',
  },
  bookName: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  author: {
    colors: FeedsTheme.SkinColor.N1_4,
    fontSize: 12,
  },
});
