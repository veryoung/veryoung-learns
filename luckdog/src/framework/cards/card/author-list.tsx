import React from 'react';
import { View, Image, Text, ScrollView, StyleSheet } from '@tencent/hippy-react-qb';

import { LayoutList } from '../components/layout-list';
import { AuthorListCard, CardLayout, ReportInfo } from '../../protocol/card';
import { strictExposeReporter, BusiKey, reportUDS, logError } from '@/luckdog';
import { FeedsIcon, FeedsTheme } from '../../../feeds-styles/tab-22/components/utils';
import FeedsUtils from '../../FeedsUtils';
import FeedsLoading from '../../../feeds-styles/tab-22/components/FeedsLoading';
import { emitter, events } from '../../../utils/emitter';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { Author, BaseBook } from '../../protocol/entity';
import { CardRadius, CommonCardStyle } from '../../FeedsConst';
import { showToast } from '@/luckbox';
import { requestTabListData } from '@/service';
import { RequestType } from '@/framework/protocol';

interface CompProps {
  index: number;
  globalConf: any;
  curTabId: number;
  data: AuthorListCard;
}

interface CompState {
  /** 当前作家索引 */
  activeAuthorIdx: number,
  /** 作家书籍列表 */
  bookLayoutList: CardLayout<BaseBook>[],
  /** 是否显示loading */
  showLoading: boolean;
  /** 是否展示作者banner图 */
  showBanner: boolean;
}

const TAG = 'AuthorList';

const { width: ScreenWidth } = FeedsUtils.getScreen();
/** 大书卡的高宽 */
const ImageWidth = (ScreenWidth - (12 * 2) - (16 * 2)) / 2;
const ImageHeight = ImageWidth * (208 / 155);
/** 小书卡的高宽 */
const SmallImageWidth = (ImageWidth - (8 * 2)) / 2;
const SmallImageHeight = (ImageHeight - 10) / 2;
/** 头部banner图的高宽 */
const BannerWidth = ScreenWidth - (12 * 2);
const BannerHeight = BannerWidth * (120 / 351);
/** item的行间距 */
const RowSpacing = 10;
/** item的列间距 */
const ColumnSpacing = 8;

const EmptyBook = 'https://novel.imqq.com/novel_icon/OfflineBookPage.png';

@FeedsProtect.protect
export class AuthorList extends React.Component<CompProps, CompState> {
  private authorScrollView: any = null;
  /** author缓存的书籍 */
  private layoutListAuthorMap: Record<string, CardLayout<BaseBook>[]> = {};
  /** author缓存的reportInfo */
  private reportInfoAuthorMap: Record<string, ReportInfo | undefined> = {};
  /** 是否正在预拉取下一批作家 */
  private isLoadingNextCard = false;

  public constructor(props: CompProps) {
    super(props);
    const { authors, layoutList, reportInfo } = props.data;
    this.state = {
      activeAuthorIdx: 0,
      bookLayoutList: layoutList,
      showLoading: false,
      showBanner: true,
    };
    this.layoutListAuthorMap[authors[0]?.authorId] = layoutList;
    this.reportInfoAuthorMap[authors[0]?.authorId] = reportInfo;
  }

  public componentDidMount() {
    const { curTabId, index } = this.props;
    // 预拉取下一刷作家
    this.loadingNextCardData();

    emitter.on(events.REFRESH_COMPLETE, this.onTabRefresh);

    // 局部刷新换一换替换上报参数
    strictExposeReporter.addReportDataHandler(curTabId, index, (moreData) => {
      const { authors } = this.props.data;
      const { authorId } = authors[this.state.activeAuthorIdx];
      return {
        ...this.reportInfoAuthorMap[authorId],
        ...moreData,
      };
    });
  }

  public componentWillUnmount() {
    emitter.off(events.REFRESH_COMPLETE, this.onTabRefresh);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: CompProps) {
    // 刷新有卡片数据更新才更新渲染，切tab，active等操作不做渲染
    const { authors = [], layoutList = [] } = this.props.data || {};
    const {
      authors: nextAuthors = [], layoutList: nextLayoutList = [], reportInfo: nextReportInfo,
    } = nextProps.data || {};
    const authorsIds = authors.map(item => item?.authorId).join(',');
    const nextAuthorsIds = nextAuthors.map(item => item?.authorId).join(',');
    const dataIds = layoutList.reduce((arr: BaseBook[], item) => [...arr, ...item.dataList], [])
      .map(item => item?.resourceId);
    const nextDataIds = nextLayoutList.reduce((arr: BaseBook[], item) => [...arr, ...item.dataList], [])
      .map(item => item?.resourceId);
    if (authorsIds !== nextAuthorsIds || dataIds !== nextDataIds) {
      this.setState({
        activeAuthorIdx: 0,
        bookLayoutList: nextLayoutList,
        showLoading: false,
        showBanner: true,
      });
      this.layoutListAuthorMap = { [nextAuthors[0]?.authorId]: nextLayoutList };
      this.reportInfoAuthorMap = { [nextAuthors[0]?.authorId]: nextReportInfo };
      this.loadingNextCardData(); // 预拉取下一刷作家
    }
  }

  public render() {
    const { index: cardIndex, data } = this.props;
    const { isRow, authors = [], bgColor } = data || {};
    const { bookLayoutList = [], activeAuthorIdx = 0, showLoading, showBanner } = this.state;
    const acitveAuthorImg = authors[activeAuthorIdx]?.picUrl;
    const cardBgColor = bgColor?.length ? bgColor : FeedsTheme.SkinColor.D5_2;
    const bookIds = bookLayoutList.reduce((arr: BaseBook[], item) => [...arr, ...item.dataList], [])
      .map(item => item?.resourceId);
    strictExposeReporter.updateBookIds(cardIndex, 0, bookIds);

    return <View style={[CommonCardStyle, { backgroundColors: cardBgColor }]}>
      <View style={styles.topBanner} onLayout={this.onHeaderLayout}>
        {
          showBanner ? <Image
            style={styles.authorBanner}
            source={{ uri: acitveAuthorImg }}
            onError={() => this.setState({ showBanner: false })}
          /> : <View style={styles.authorBanner} />
        }
        <ScrollView
          ref={ref => this.authorScrollView = ref}
          style={styles.authorScroller}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={10}
          contentContainerStyle={styles.authorWrapper}
        >
          {authors.map((author, index) => this.renderAuthor(author, index))}
        </ScrollView>
      </View>
      <View style={styles.bookWrapper}>
        {
          bookLayoutList.length ? <LayoutList
            isRow={isRow}
            layoutList={bookLayoutList}
            columnSpacing={ColumnSpacing}
            rowSpacing={RowSpacing}
            onItemRender={this.onBookRender}
            onItemLayout={this.onBookLayout}
          /> : (
            <View style={[styles.emptyView, { backgroundColors: cardBgColor }]}>
              <Image style={styles.emptyImg} source={{ uri: EmptyBook }} />
              <Text style={styles.emptyTxt} >作品已下架</Text>
            </View>
          )
        }
        {
          showLoading ? (
            <View style={[styles.loading, { backgroundColors: cardBgColor }]}>
              <FeedsLoading imgUri={FeedsIcon.BookLoading} colors={FeedsTheme.SkinColor.A8} />
            </View>
          ) : null
        }
      </View>
    </View>;
  }

  /** 刷新当前tab */
  private onTabRefresh = () => {
    this.authorScrollView?.scrollTo({ x: 0, y: 0, animated: true });
  };

  /** 更新头部布局信息 */
  private onHeaderLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /** 渲染单本书 */
  private renderAuthor = (author: Author, index: number) => {
    const { cardKey } = this.props.data;
    const { authorName, authorId } = author;
    const isActive = index === this.state.activeAuthorIdx;

    return <View
      key={`${cardKey}_${authorId}_${index}`}
      style={[
        styles.authorView,
        isActive ? styles.activeAuthor : styles.normalAuthor,
        { marginLeft: index === 0 ? 0 : 8 },
      ]}
      onClick={() => this.switchAuthor(authorId, index)}>
      <Text style={styles.authorName}>{authorName}</Text>
    </View>;
  };

  /** 切换作者 */
  private switchAuthor = async (authorId: string, index: number) => {
    const { activeAuthorIdx } = this.state;
    const { authors } = this.props.data;
    try {
      if (activeAuthorIdx === index) return;
      if (!authorId) {
        showToast('作者ID为空');
        return;
      }

      const { authorId: curAuthorId } = authors[activeAuthorIdx];
      reportUDS(BusiKey.CLICK__CARD_TAB, {}, {
        ...this.reportInfoAuthorMap[curAuthorId],
        ext_data1: `${index}`,
      });

      this.setState({ activeAuthorIdx: index, showLoading: true });
      let targetBookLayoutList: CardLayout<BaseBook>[] = [];
      // 本地缓存有数据，则取本地缓存数据替换，否则拉取数据更新本地缓存
      const layoutListFromMap = this.layoutListAuthorMap[authorId] || [];
      if (layoutListFromMap.length) {
        targetBookLayoutList = layoutListFromMap;
      } else {
        const { layoutList, reportInfo } = await this.getAuthorBooks(authorId);
        targetBookLayoutList = layoutList;
        this.layoutListAuthorMap[authorId] = layoutList;
        this.reportInfoAuthorMap[authorId] = reportInfo;
      }

      // 更新数据
      this.setState({
        bookLayoutList: targetBookLayoutList,
        showLoading: false,
        showBanner: true,
      });
    } catch (err) {
      logError(err, `${TAG}.switchAuthor`);
      this.setState({ activeAuthorIdx, showLoading: false });
    }
  };

  /** 拉取作者书籍 */
  private getAuthorBooks = async (authorId: string): Promise<{
    layoutList: CardLayout<BaseBook>[];
    reportInfo?: ReportInfo;
  }> => {
    try {
      const { curTabId, data } = this.props;
      const { code, success: isSuccess, data: rspData } = await requestTabListData({
        tabId: curTabId,
        requestType: RequestType.SPECIFIED_CARD,
        cardKey: [data.cardKey],
        itemIdMap: {
          [data.cardKey]: authorId,
        },
      });
      if (!(isSuccess && rspData.cards?.length)) {
        logError(`getAuthorBooks error, ${JSON.stringify({
          code,
          cardsLength: rspData.cards?.length,
          authorId,
        })}`, `${TAG}.getAuthorBooks`);
        return { layoutList: [] };
      }
      const cardData = rspData.cards[0] as AuthorListCard;
      return {
        layoutList: cardData.layoutList || [],
        reportInfo: cardData.reportInfo,
      };
    } catch (err) {
      logError(err, `${TAG}.getAuthorBooks`);
      return { layoutList: [] };
    }
  };


  /** 预拉取下一批作家数据，更新本地缓存 */
  private loadingNextCardData = async () => {
    try {
      if (this.isLoadingNextCard) return;

      const { index, curTabId, data } = this.props;
      this.isLoadingNextCard = true;
      const { code, success: isSuccess, data: rspData = {} } = await requestTabListData({
        tabId: curTabId,
        requestType: RequestType.SPECIFIED_CARD,
        cardKey: [data.cardKey],
      });
      if (isSuccess && rspData.cards?.length) {
        const nextCardData = rspData.cards[0] as AuthorListCard;
        // 更新本地缓存
        emitter.emit(events.UPDATE_PAGEVIEW_DATASOURCE, {
          tabId: curTabId,
          cardData: nextCardData,
          position: index,
        });
      } else {
        logError(`loadingNextCardData error, ${JSON.stringify({
          code,
          cardsLength: rspData.cards?.length,
        })}`, `${TAG}.loadingNextCardData`);
      }
      this.isLoadingNextCard = false;
    } catch (err) {
      logError(err, `${TAG}.loadingNextCardData`);
      this.isLoadingNextCard = false;
    }
  };

  /** 书籍卡片的layout，准备书籍的精准曝光 */
  private onBookRender = (isSmallItem: boolean, layoutIdx: number, itemIdx: number) => {
    const { bookLayoutList = [] } = this.state;
    const { dataList } = bookLayoutList[layoutIdx];
    const { resourceId, resourceName, picUrl = '', jumpUrl = '' } = dataList[itemIdx] || {};
    const width = isSmallItem ? SmallImageWidth : ImageWidth;
    const height = isSmallItem ? SmallImageHeight : ImageHeight;
    return (
      <View
        style={[styles.bookItem, { width, height }]}
        onClick={strictExposeReporter.triggerExpoCheck(() => this.clickBook(jumpUrl, resourceId, layoutIdx, itemIdx))}
      >
        <Image
          style={[styles.bookPic, { width, height }]}
          source={{ uri: picUrl }}
        />
        <View style={styles.bookNameWrapper}>
          <Image style={[styles.maskImg, { width }]} source={{ uri: FeedsIcon.shadowBg }} />
          <Text style={styles.bookName} numberOfLines={1}>{resourceName}</Text>
        </View>
      </View>
    );
  };

  /** 书籍卡片的layout，准备书籍的精准曝光 */
  private onBookLayout = (
    event: any,
    isSmallItem: boolean,
    layoutIdx: number,
    itemIdx: number,
  ) => {
    const { bookLayoutList = [] } = this.state;
    const { dataList } = bookLayoutList[layoutIdx];
    const { resourceId } = dataList[itemIdx] || {};

    const rect = isSmallItem ? {
      ...event.layout,
      y: itemIdx * (SmallImageHeight + RowSpacing),
    } : event.layout;
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex: this.getBookIndex(layoutIdx, itemIdx),
      bookId: resourceId,
      rect,
    });
  };

  /** 获取书籍的bookIndex */
  private getBookIndex = (layoutIdx: number, itemIdx: number) => {
    const { bookLayoutList = [] } = this.state;
    return bookLayoutList.slice(0, layoutIdx + 1)
      .reduce((acc, item, index) => {
        let dev = 0;
        if (index < layoutIdx) {
          dev += item.dataList.length;
        } else {
          dev += itemIdx;
        }
        return acc + dev;
      }, 0);
  };

  /** 书籍点击 */
  private clickBook = (jumpUrl: string, resourceId: string, layoutIdx: number, itemIdx: number) => {
    const { curTabId, data } = this.props;
    const { authorId } = data.authors[this.state.activeAuthorIdx] || {};
    reportUDS(BusiKey.CLICK__CARD_BOOK, {}, {
      ...this.reportInfoAuthorMap[authorId],
      bigdata_contentid: '',
      book_id: resourceId,
      ext_data1: `${this.getBookIndex(layoutIdx, itemIdx)}`,
    }); // 点击上报

    if (!jumpUrl) return;
    FeedsUtils.doLoadUrl(jumpUrl, `${curTabId}`);
  };
}

const styles = StyleSheet.create({
  topBanner: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: BannerWidth,
    height: BannerHeight,
  },
  authorBanner: {
    borderTopLeftRadius: CardRadius,
    borderTopRightRadius: CardRadius,
    width: BannerWidth,
    height: BannerHeight,
  },
  authorScroller: {
    position: 'absolute',
    bottom: 0,
  },
  authorWrapper: {
    paddingHorizontal: 16,
  },
  authorView: {
    height: 28,
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeAuthor: {
    backgroundColors: FeedsTheme.SkinColor.A8,
  },
  normalAuthor: {
    backgroundColors: FeedsTheme.SkinColor.D2_2,
  },
  authorName: {
    fontSize: 14,
    textAlign: 'center',
    colors: FeedsTheme.SkinColor.N1,
    height: 18,
    lineHeight: 18,
  },
  emptyView: {
    flex: 1,
    height: ImageHeight,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImg: {
    width: 120,
    height: 135,
    backgroundColor: 'transparent',
  },
  emptyTxt: {
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1_10,
    marginTop: 20,
  },
  loading: {
    flex: 1,
    height: ImageHeight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 3,
    bottom: 0,
    left: 0,
    right: 0,
  },
  bookWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  bookItem: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookPic: {
    borderRadius: 8,
  },
  bookNameWrapper: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  maskImg: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    height: 48,
  },
  bookName: {
    paddingHorizontal: 4,
    colors: FeedsTheme.SkinColor.A8,
    fontSize: 12,
    position: 'absolute',
    bottom: 6,
  },
});
