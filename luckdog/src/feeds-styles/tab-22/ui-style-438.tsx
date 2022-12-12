import React from 'react';
import { View, ScrollView, Text, StyleSheet } from '@tencent/hippy-react-qb';

import { Title } from './components';
import FeedsLoading from './components/FeedsLoading';
import { BookCover } from '../../components/book-font-cover';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CommonCardStyle, NOVEL_BUSINESS_ID, SmallBookCoverLeftTagStyle } from '../../framework/FeedsConst';
import FeedsTheme from '../../framework/FeedsTheme';
import FeedsUtils from '../../framework/FeedsUtils';
import FeedsIcon from '../../framework/FeedsIcon';
import { BusiKey, reportUDS, logError, strictExposeReporter } from '@/luckdog';
import { emitter, events } from '../../utils/emitter';
import FeedsTraversal from '../../communication/FeedsTraversal';
import { safeJsonParse } from '../common/utils';
import { BookCoverRadiusStyle } from '../../types/card';
import { throttle, showToast } from '@/luckbox';
import { FeedsViewUIStyle438Props } from './__tests__/mocks/ui-style-438';

/** 展示4本书，适配的书籍高宽 */
const { width } = FeedsUtils.getScreen();
const ImageWidth = (width - (12 * 2) - (16 * 2) - (26 * 3)) / 4;
const ImageHeight = (ImageWidth * 81) / 60;
const BooksWrapperHeight = 16 + 24 + 2 + 6 + 32 + 16 + ImageHeight;
const LoadingPaddingTop = 16 + 20 + 16 + 24;

const TAG = 'ui-style-438';

/** 分类导航高度 */
const NavHeight = 24;


/** 新协议结构类型 */
type UICard438Type = typeof FeedsViewUIStyle438Props;
type ContentBookDataList = typeof FeedsViewUIStyle438Props.dataList;
type Classify = typeof FeedsViewUIStyle438Props.classifyList[0];
type ContentBook = typeof FeedsViewUIStyle438Props.dataList[0];

interface CompProps {
  /** 第几刷数据 */
  index: number;
  /** 当前tabid */
  selectTabID: number;
  /** 卡片后台数据 */
  itemBean: {
    parsedObject?: {
      sData: UICard438Type; // 新协议结构
    }
  };
  globalConf: any;
}

interface CompState {
  /** 当前分类导航索引 */
  activeNavIndex: number;
  /** 书籍列表 */
  dataList: ContentBookDataList;
  /** 是否展示加载loading */
  showLoading: boolean;
}

/**
 * 新分类导航卡片（带推荐书籍）
 * 设计稿: https://codesign.woa.com/s/na4Jd0NeeK9AMkb
 */
@FeedsProtect.protect
export default class FeedsViewUIStyle438 extends React.Component<CompProps, CompState> {
  private navScrollView: any = null;
  private bookScrollView: any = null;
  /** tags缓存的推书书籍 */
  private dataListTagMap: Record<string, ContentBookDataList> = {};

  public constructor(props: CompProps) {
    super(props);
    const { classifyList = [], dataList = [] } = props.itemBean.parsedObject?.sData || {};
    this.state = {
      activeNavIndex: 0,
      dataList,
      showLoading: false,
    };
    this.dataListTagMap[classifyList[0]?.id] = dataList;
  }

  public componentDidMount() {
    emitter.on(events.REFRESH_COMPLETE, this.onTabRefresh);
  }

  public componentWillUnmount() {
    emitter.off(events.REFRESH_COMPLETE, this.onTabRefresh);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: CompProps) {
    // 刷新有卡片数据更新才更新渲染，切tab，active等操作不做渲染
    const { dataList = [], classifyList = [] } = this.props.itemBean.parsedObject?.sData || {};
    const {
      dataList: nextDataList = [], classifyList: nextClassifyList = [],
    } = nextProps.itemBean.parsedObject?.sData || {};
    const classifyIds = classifyList.map(item => item?.id).join(',');
    const nextClassifyIds = nextClassifyList.map(item => item?.id).join(',');
    const dataIds = dataList.map(item => item?.resourceId).join(',');
    const nextDataIds = nextDataList.map(item => item?.resourceId).join(',');
    if (classifyIds !== nextClassifyIds || dataIds !== nextDataIds) {
      this.setState({
        activeNavIndex: 0,
        dataList: nextDataList,
        showLoading: false,
      });
      this.dataListTagMap = {
        [classifyList[0]?.id]: nextDataList,
      };
    }
  }

  public render() {
    const { dataList, showLoading } = this.state;
    const { index: cardIndex, itemBean } = this.props;
    const { title = '', classifyList = [], jumpLink = {} } = itemBean.parsedObject?.sData || {};
    strictExposeReporter.updateBookIds(cardIndex, 0, dataList.map(book => book.resourceId));

    return <View style={CommonCardStyle}>
      <Title
        title={title}
        onLayout={this.onTitleLayout}
        parent={this}
        right={FeedsUtils.convertTitleRight(jumpLink)}
        rightClick={this.clickTitleRight}
      />
      <ScrollView
        ref={(ref) => {
          this.navScrollView = ref;
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={10}
        contentContainerStyle={styles.navWrapper}
      >
        {classifyList.map((item, index) => this.renderNavView(item, index))}
      </ScrollView>
      <ScrollView
        ref={(ref) => {
          this.bookScrollView = ref;
        }}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={10}
        contentContainerStyle={styles.bookWrapper}
        onScroll={throttle(this.onBookScroll, 500, 500)}
      >
        {dataList.map((book, index) => this.renderBook(book, index))}
      </ScrollView>
      {
        showLoading
          ? <View style={styles.feedsLoading}><FeedsLoading imgUri={FeedsIcon.BookLoading} /></View>
          : null
      }
    </View>;
  }

  /** 刷新当前tab */
  private onTabRefresh = () => {
    this.navScrollView?.scrollTo({ x: 0, y: 0, animated: true });
    this.bookScrollView?.scrollTo({ x: 0, y: 0, animated: true });
  };

  /** 更新卡片非推书内容区域高度 */
  private onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height + NavHeight);
  };

  /** title右上角点击 */
  private clickTitleRight = () => {
    const { selectTabID, itemBean } = this.props;
    const { jumpLink, reportInfo } = itemBean.parsedObject?.sData || {};
    reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, {}, reportInfo);

    if (!jumpLink?.linkUrl) return;
    FeedsUtils.doLoadUrl(jumpLink.linkUrl, `${selectTabID}`);
  };

  /** 渲染单个导航 */
  private renderNavView = (item: Classify, index) => {
    const { id, name } = item;
    const isActive = index === this.state.activeNavIndex;

    return <View
      key={`${name}_${index}`}
      style={[
        styles.navView,
        isActive ? styles.activeNav : styles.normalNav,
        { marginLeft: index === 0 ? 0 : 8 },
      ]}
      onClick={() => this.clickClassify(id, index)}>
      <Text style={[
        styles.navName,
        isActive ? styles.activeNavName : styles.normalNavName,
      ]}>{name}</Text>
    </View>;
  };

  /** 切换tag，实现局部刷书籍 */
  private clickClassify = async (classifyId: string, index: number) => {
    const { activeNavIndex } = this.state;
    const { itemBean } = this.props;
    try {
      if (activeNavIndex === index) return; // 当前tab点击无效
      const { reportInfo } = itemBean.parsedObject?.sData || {};
      // 点击上报
      reportUDS(BusiKey.CLICK__CARD_TAB, {}, {
        ...reportInfo,
        ext_data1: `${index}`,
      });

      if (!classifyId) {
        showToast('对应分类ID为空');
        return;
      }

      this.setState({ activeNavIndex: index, showLoading: true });
      let targetDataList: ContentBookDataList = [];
      // 本地缓存有数据，则取本地缓存数据替换，否则拉取数据更新本地缓存
      const dataListFromMap = this.dataListTagMap[classifyId] || [];
      if (dataListFromMap.length) {
        targetDataList = dataListFromMap;
      } else {
        targetDataList = await this.getClassifyBooks(classifyId);
        this.dataListTagMap[classifyId] = targetDataList;
      }
      if (!targetDataList.length) {
        showToast('分类推书数据异常');
        this.setState({ activeNavIndex, showLoading: false });
        return;
      }

      // 更新数据
      this.setState({
        dataList: targetDataList,
        showLoading: false,
      }, () => {
        this.bookScrollView?.scrollTo({ x: 0, y: 0, animated: true });
      });
    } catch (err) {
      logError(err, `${TAG}.clickClassify`);
      this.setState({ activeNavIndex, showLoading: false });
    }
  };

  /** 渲染单本书 */
  private renderBook = (book: ContentBook, index: number) => {
    const { resourceId, resourceName, picUrl, score, tags, jumpUrl } = book || {};
    const leftTag = FeedsUtils.getLeftTagStyle(tags, SmallBookCoverLeftTagStyle);
    return <View
      key={`${resourceId}_${index}`}
      style={[
        styles.bookItem,
        { marginLeft: index === 0 ? 0 : 26 },
      ]}
      onLayout={event => this.onBookLayout(event, index, resourceId)}
      onClick={strictExposeReporter.triggerExpoCheck(() => this.clickBook(jumpUrl, resourceId, index))}
    >
      <View style={styles.bookTop}>
        <BookCover
          height={ImageHeight}
          width={ImageWidth}
          url={picUrl}
          bookID={resourceId}
          radius={BookCoverRadiusStyle.SMALL}
          leftTag={leftTag}
        />
        <Text style={styles.bookName} numberOfLines={2}>{resourceName}</Text>
      </View>
      {score ? <Text style={styles.bookScore}>{score}分</Text> : null}
    </View>;
  };

  /** 滑动时更新卡片x坐标 */
  private onBookScroll = (event) => {
    strictExposeReporter.updateViewportLeft(this.props.index, event.contentOffset.x);
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

  /** 点击书籍卡片跳转 */
  private clickBook = (jumpUrl: string, resourceId: string, index: number) => {
    const { selectTabID, itemBean } = this.props;
    const { reportInfo } = itemBean.parsedObject?.sData || {};
    reportUDS(BusiKey.CLICK__CARD_BOOK, {}, {
      ...reportInfo,
      bigdata_contentid: '',
      book_id: resourceId,
      ext_data1: `${index}`,
    }); // 点击上报

    if (!jumpUrl) return;
    FeedsUtils.doLoadUrl(jumpUrl, `${selectTabID}`);
  };

  /** 获取tag相关推荐书籍 */
  private getClassifyBooks = async (classifyId: string): Promise<ContentBookDataList> => {
    try {
      const { selectTabID, globalConf } = this.props;
      const result = await FeedsTraversal.traversal(selectTabID, NOVEL_BUSINESS_ID, {
        func: 'LocalRefresh',
        needCardWithSize: [{
          cardName: 'TabRecommCardNewNavigationWithBook',
          itemSize: 0,
          itemId: classifyId,
        }],
      }, globalConf);
      const { success, content, code } = result || {};
      if (!success) {
        logError(`LocalRefresh.TabRecommCardNewNavigationWithBook, code=${code}, tabid=${selectTabID}`, `${TAG}.getClassifyBooks`);
        return [];
      }

      // 如果长度为空，则表示没有命中实验
      const vItemListData = content?.vItemListData || [];
      if (vItemListData.length === 0) {
        return [];
      }

      // 解析响应体中的sStyleJson.sData字符串转成json对象
      const { sStyleJson } = vItemListData[0] || {};
      if (!sStyleJson) {
        logError(`sStyleJson is empty, sStyleJson=${sStyleJson}`, `${TAG}.getClassifyBooks`);
        return [];
      }

      const { dataList = [] } = safeJsonParse(safeJsonParse<any>(sStyleJson).sData) as UICard438Type;
      return dataList;
    } catch (err) {
      logError(err, `${TAG}.getClassifyBooks`);
      return [];
    }
  };
}

const styles = StyleSheet.create({
  navWrapper: {
    paddingHorizontal: 16,
  },
  navView: {
    height: 25,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeNav: {
    backgroundColors: FeedsTheme.SkinColor.B10,
  },
  normalNav: {
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColors: FeedsTheme.SkinColor.N1_6,
  },
  navName: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeNavName: {
    colors: FeedsTheme.SkinColor.A1,
  },
  normalNavName: {
    colors: FeedsTheme.SkinColor.A6,
  },
  feedsLoading: {
    flex: 1,
    height: BooksWrapperHeight,
    backgroundColors: FeedsTheme.SkinColor.D5_2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: LoadingPaddingTop,
    borderRadius: 12,
  },
  bookWrapper: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  bookItem: {
    width: ImageWidth,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  bookTop: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  bookName: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
    marginTop: 6,
  },
  bookScore: {
    colors: FeedsTheme.SkinColor.N3,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});
