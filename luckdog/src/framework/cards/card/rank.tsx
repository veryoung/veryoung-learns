import React from 'react';
import {
  View,
  PixelRatio,
  Text,
  ScrollView,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { CommonProps } from '../../../entity';
import { BeaconReportProps, reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { Link, RankCard } from '../../protocol/card';
import { CommonCardStyle, FeedsUIStyle, SmallBookCoverLeftTagStyle } from '../../FeedsConst';
import { scale } from '../../../components/animationStyle';
import { throttle } from '@/luckbox';
import { FeedsTheme } from '../../../feeds-styles/tab-22/components/utils';
import { Title } from '../components/title';
import { activeEventObserver } from '../../../utils/NativeEventAdapter';
import { BaseBook } from '../../protocol/entity/books';
import FeedsUtils from '../../FeedsUtils';
import { BookCoverRadiusStyle } from '../../../types/card';
import { BookCover } from '../../../components/book-font-cover';
import { UIType } from '../../protocol';
interface Props extends BeaconReportProps, CommonProps {
  index: number;
  key: string;
  globalConf: any;
  totalLength: number;
  curTabId: number;
  data: RankCard;
}

const isAndroid = FeedsUtils.isAndroid();
const { width } = FeedsUtils.getScreen();
const pr = PixelRatio.get();
// 根据分辨率确定不滑动情况下字体宽度,以适应小屏幕
const prWidth = pr <= 2 ? 155 : 172;
const IMAGE_WIDTH = width * (96 / 750);
const IMAGE_HEIGHT = IMAGE_WIDTH * (128 / 96);
const CONTENT_TEXT_WIDTH = width * (prWidth / 750);
const SCROLL_CONTENT_TEXT_WIDTH = width * (236 / 750);
const DEFAULT_COLUMN_NUMBER = 2; // 默认列数
const DEFAULT_COLUMN_ROWS_NUMBER = 4; // 默认每列展示行数

interface State {
  /** 排行榜所在位置 */
  position: number;
}

/** 排行榜卡 */
@FeedsProtect.protect
export class Rank extends React.Component<Props> {
  public static getRowType() {
    return UIType.RANK;
  }
  /** 点击动画效果 */
  public scaleAnim = scale(200, 1.015);
  /** 原始渠道号 */
  public originTraceId = '';
  /** 当前页面是否可见 */
  public isFromActive = false;
  /** 组件所在状态 */
  public state: State = {
    position: 0,
  };
  /** 滑动组件实例 */
  public RankScrollView: any;

  public constructor(props) {
    super(props);
    // 注册终端事件
    activeEventObserver.addEventObserver(() => {
      // 触发页面显示状态
      this.isFromActive = true;
    });
  }

  /** 点击查看所有榜单上报 */
  public doBeaconByClickAll = () => {
    this.reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, { traceid: this.originTraceId });
  };

  /** 榜单有 2 层标题，用第二层标题进行计算 */
  public onRankTitleLayout = (event) => {
    const { y, height } = event.layout;
    strictExposeReporter.updateTitleHeight(this.props.index, y + height);
  };


  /**
   * 选中排行的一个榜单
   * @param {*} position 榜单所在位置
   * @param {*} isUserClick 是否是用户点击行为
   */
  public chooseRank = (position, isUserClick = false) => {
    if (position !== this.state.position) {
      // 设置新的traceid
      this.updateNewTraceId(position);
      this.setState(
        {
          position,
        },
        () => {
          this.handleAfterTabChange();
        },
      );
    }
    if (isUserClick) {
      // 添加点击title上报
      this.reportUDS(BusiKey.CLICK__CARD_TAB, { traceid: this.originTraceId });
    }
  };

  public UNSAFE_componentWillReceiveProps(nextProps) {
    // 更新 traceid
    this.updateNewTraceId(this.state.position, nextProps.data);
  }

  /** 处理tab改变后的操作 */
  public handleAfterTabChange = () => {
    const { data } = this.props;
    const { slidable } = data;
    // 刷新的时候需要放置回原来位置
    if (slidable) {
      this.RankScrollView?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  /** 获得不同榜单内书籍的所有bookid，用于上报 */
  public getBookIdContents = (position, data) => {
    const items = data.rankList[position] || [];
    const bookIds: string[] = [];
    if (items.length > 0) {
      items.forEach((book) => {
        const { sBookId = '' } = book || {};
        if (sBookId !== '') bookIds.push(sBookId);
      });
    }
    return bookIds.join(',');
  };

  /** 触发精准曝光检查 */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onScroll = throttle((e) => {
    strictExposeReporter.updateViewportLeft(this.props.index, e.contentOffset.x);
  }, 500);

  /** 渲染榜单标题 */
  public renderRankTitle = (rank) => {
    const { position } = this.state;
    if (!rank) return null;
    const view: any[] = [];
    for (let i = 0; i < rank.length; i++) {
      const rankItem = rank[i];
      const { groupName, groupId } = rankItem;
      view.push(<View
        key={`${groupId}_${groupName}_${i}`}
        style={[
          styles.titleItem,
          i === 0 || i === rank.length - 1
            ? {
              borderTopLeftRadius: i === 0 ? 18 : 0,
              borderBottomLeftRadius: i === 0 ? 18 : 0,
              borderTopRightRadius: i !== 0 ? 18 : 0,
              borderBottomRightRadius: i !== 0 ? 18 : 0,
              marginLeft: i === 0 ? 0 : 1,
              marginRight: i !== 0 ? 0 : 1,
            }
            : null,
          position === i
            ? {
              backgroundColors: FeedsTheme.SkinColor.N2,
            }
            : null,
        ]}
        onClick={() => this.chooseRank(i, true)}
      >
        <Text
          style={[
            styles.titleText,
            position === i
              ? {
                opacity: 1,
              }
              : null,
          ]}
        >
          {groupName}
        </Text>
      </View>);
    }
    return view;
  };

  /** 获取新的traceid，有多个榜单，根据位置修改traceid的第5位，表示不同的榜单，策略需要和后台保持一致 */
  public updateNewTraceId = (position, data?: RankCard) => {
    const { reportInfo, rankList } = data || this.props.data;
    if (!reportInfo) return;
    if (!this.originTraceId) this.originTraceId = reportInfo.traceid;
    reportInfo.traceid = rankList?.[position]?.traceid || reportInfo.traceid;
  };

  /**
   * 生成榜单容器
   * @param {array} data 榜单数据集
   * @param {boolean} slidable 是否可滑动
   */
  public renderRank = (data: RankCard, slidable = false) => {
    const { index } = this.props || {};
    const { rankList } = data;
    if (!rankList) return null;
    const rankView: any[] = [];
    const { position } = this.state;
    const rankItem = rankList[position];
    const { rowNum, bookList, groupId } = rankItem;
    // 能滑动的条件：后台下发字段slidable为true，且数据条数大于8
    const canSlide = slidable && bookList.length > DEFAULT_COLUMN_NUMBER * DEFAULT_COLUMN_ROWS_NUMBER;
    // 实际每列展示的行数（能滑动才取后台数据，不能滑动则展示4行）
    const rowNumber = canSlide ? rowNum : DEFAULT_COLUMN_ROWS_NUMBER;
    strictExposeReporter.updateBookIds(
      index,
      position,
      bookList.map(book => book.resourceId),
    );
    // 算出需要展示的列数，不允许滑动的情况下只有两列
    const columnNum = canSlide ? Math.ceil(bookList.length / rowNumber) : DEFAULT_COLUMN_NUMBER;
    let start = 0;
    for (let columnIndex = 0; columnIndex < columnNum; columnIndex++) {
      const columnItems: any[] = [];
      for (let index = 0; index < rowNum; index++) {
        // 如果不可滑动展示两排，如果可滑动，展示所有
        const isShow = canSlide ? start < bookList.length : start < bookList.length && start < rowNum * 2;
        if (!isShow) break; // 判断是否越界
        const book = bookList[start];
        columnItems.push(this.getRankItem(book, start, position, canSlide, rowNum));
        start += 1;
      }
      rankView.push(<View
        style={canSlide ? styles.scrollColumnWrap : styles.rankColumnWrap}
        key={`${groupId}_${columnIndex}`}
      >
        {columnItems}
      </View>);
    }
    return canSlide ? (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        sendMomentumEvents
        ref={(ref) => {
          this.RankScrollView = ref;
        }}
        onScroll={this.onScroll}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        scrollEventThrottle={10}
        style={[styles.rankWarp, styles.scrollViewWrap]}
      >
        {rankView}
      </ScrollView>
    ) : (
      <View style={styles.rankWarp}>{rankView}</View>
    );
  };

  /** 根据生成对应的书籍内容 */
  public getRankItem = (book: BaseBook, start, position, slidable, rowNum) => {
    const { tag, hot = 0, resourceName = '', resourceId = '', picUrl = '' } = book || {};
    let leftTag;
    if (tag) {
      leftTag = FeedsUtils.getBookTagStyle(tag, SmallBookCoverLeftTagStyle);
    }
    const textStyle: any[] = [styles.rankContentText];
    slidable ? textStyle.push(styles.scrollRankContentText) : textStyle.push(styles.noScrollRankContentText);
    return (
      <View
        key={`${start}-${resourceId}`}
        style={styles.rankItem}
        onLayout={event => this.onBookItemLayout({
          event,
          tabIndex: position,
          bookIndex: start,
          bookId: resourceId,
          slidable,
          rowNum,
        })
        }
        onClick={() => this.clickBookItem(book)}
      >
        <BookCover
          height={IMAGE_HEIGHT}
          width={IMAGE_WIDTH}
          url={picUrl}
          bookID={resourceId}
          radius={BookCoverRadiusStyle.SMALL}
          sourceFrom={resourceId}
          leftTag={leftTag}
        />
        <View>
          <View style={styles.rankContentTitle}>
            <Text
              style={[
                styles.rankContentNum,
                [0, 1, 2].includes(start)
                  ? {
                    colors: FeedsTheme.SkinColor.N3,
                  }
                  : null,
              ]}
            >
              {start + 1}
            </Text>
            <Text style={textStyle} numberOfLines={2}>
              {resourceName}
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.rankHotText,
                {
                  width: slidable ? SCROLL_CONTENT_TEXT_WIDTH : CONTENT_TEXT_WIDTH,
                },
              ]}
              numberOfLines={1}
            >
              {hot}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /** 点击某本书 */
  public clickBookItem = (book: BaseBook) => {
    const { resourceId, jumpUrl } = book || {};
    this.reportUDS(BusiKey.CLICK__CARD_BOOK, { book_id: resourceId });
    FeedsUtils.doLoadUrl(jumpUrl, `${this.props.curTabId}`);
  };

  /** 点击单本书上报 */
  public reportUDS = (eventKey: BusiKey, moreData = {}) => {
    const { reportInfo, uiType } = this.props.data || {};
    reportUDS(eventKey, {}, { ...reportInfo, bigdata_contentid: '', ui_type: uiType, ...moreData });
  };

  /**
   * 精准曝光 item 信息收集
   * @param {Object} event layout 事件对象
   * @param {Number} tabIndex tab 索引
   * @param {Number} bookIndex 书籍索引
   * @param {String} bookId 书籍 id
   * @param {Boolean} slidable 是否可以左右滑动
   * @param {Number} rowNum 行数
   */
  public onBookItemLayout = ({ event, tabIndex, bookIndex, bookId, slidable, rowNum }) => {
    // 左右滑动模式下，item 的 x = 左侧的所有 margin + 左侧所有列宽之和
    const leftCount = Math.floor(bookIndex / rowNum);
    const leftMargin = leftCount * styles.scrollColumnWrap.marginRight;
    const leftWidth = leftCount * event.layout.width;
    const x = event.layout.x + leftMargin + leftWidth;
    // 非左右滑动模式下，item 的 y = 上面的所有 item 高度之和
    const topCount = Math.floor(bookIndex / DEFAULT_COLUMN_NUMBER);
    const topHeight = topCount * event.layout.height;
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      tabIndex,
      bookIndex,
      bookId,
      rect: {
        ...event.layout,
        x: slidable ? x : event.layout.x,
        y: slidable ? event.layout.y : topHeight,
      },
      supportHorizontalScroll: slidable,
    });
  };

  /** 终端滑动停止时候触发事件 */
  public onMomentumScrollEnd = () => {
    this.reportUDS(BusiKey.SLIDE__CARD);
  };

  public render() {
    const { data } = this.props;
    const { position } = this.state;
    const { slidable, title, rankList } = data;
    const titleRight = rankList ? rankList[position].jumpLink : new Link();
    return (
      <View style={[{ ...CommonCardStyle }, { transform: [{ scale: this.scaleAnim }] }]}>
        <View
          style={{
            paddingHorizontal: slidable ? 0 : 4,
          }}
        >
          <View collapsable={false}>
            <Title
              title={title}
              parent={this}
              doBeaconByClick={this.doBeaconByClickAll}
              right={titleRight}
            />
          </View>
          <View style={styles.titleWarp} onLayout={this.onRankTitleLayout}>
            {this.renderRankTitle(rankList)}
          </View>
          {this.renderRank(data, slidable)}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  titleWarp: {
    flexDirection: 'row',
    marginHorizontal: FeedsUIStyle.T1,
    paddingBottom: 20,
  },
  titleItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColors: FeedsTheme.SkinColor.N8,
    height: 36,
    marginHorizontal: 1,
  },
  titleText: {
    fontSize: FeedsUIStyle.T1_5,
    colors: FeedsTheme.SkinColor.N1,
    opacity: 0.7,
  },
  rankWarp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: FeedsUIStyle.T1,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankItem: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  scrollViewWrap: {
    flexDirection: 'row',
  },
  rankColumnWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scrollColumnWrap: {
    flexDirection: 'column',
    marginRight: 24,
  },
  rankContentTitle: {
    flexDirection: 'row',
  },
  rankContentNum: {
    width: 16,
    marginHorizontal: 2,
    height: 20,
    lineHeight: 20,
    textAlign: 'center',
    colors: FeedsTheme.SkinColor.N7,
    fontSize: FeedsUIStyle.T2,
    fontFamily: 'DINNextLTPro-Medium',
    fontWeight: 'bold',
    ...(!isAndroid && {
      fontFamily: 'DIN Next LT Pro',
    }),
  },
  rankContentText: {
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N1,
    marginBottom: 4,
    lineHeight: 20,
  },
  noScrollRankContentText: {
    width: CONTENT_TEXT_WIDTH,
  },
  scrollRankContentText: {
    width: SCROLL_CONTENT_TEXT_WIDTH,
  },
  rankHotText: {
    marginLeft: 20,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_4,
  },
});


