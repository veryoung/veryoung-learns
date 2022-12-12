/**
 * 新样式排行榜卡片
 */
import React, { ReactElement } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from '@tencent/hippy-react-qb';
import { ConstantUtils, FeedsIcon, FeedsTheme, FormatUtils, vectorToArray } from './components/utils';
import FeedsUtils from '../../framework/FeedsUtils';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CommonCardStyle, FeedsUIStyle, SmallBookCoverLeftTagStyle } from '../../framework/FeedsConst';
import { reportUDS, strictExposeReporter, BusiKey, addKeylink, KeylinkCmd } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { throttle, getDeviceVisitor } from '@/luckbox';
import { BookCoverRadiusStyle, LeftTag } from '../../types/card';
import { BookCover } from '../../components/book-font-cover';
import { RankTabList, RankTabType } from './components/rank-tab-list';
import { TitleRight } from './components/title-right';

const TAG = 'ui-style-439';

type TextLink = {
  sText: string;
  sUrl: string;
};

type RankBook = {
  sBookId: string;
  sBookTips: string;
  sHot: string;
  sPicUrl: string;
  sTitle: string;
  sUrl: string;
  stTag: LeftTag;
};

type RankItem = {
  sGroupId: string;
  sGroupName: string;
  sGroupURL: string;
  sTraceID: string;
  vRankData: {
    value: RankBook[];
  };
};

type RankCardProps = {
  index: number;
  globalConf: Record<string, any>;
  itemBean: {
    parsedObject: {
      iRowNum: number;
      vDetailData: {
        value: RankItem[];
      };
      vTextLink: {
        value: TextLink[];
      };
    };
    item_id?: string;
    report_info: string[][];
    ui_style: number;
    bottomLineStyle: number;
  };
};

const DEFAULT_ROWS = 2; // 默认每列展示行数
const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
// 根据屏幕宽度适配字体宽度,以适应大屏幕
const DYNAMIC_WIDTH = SCREEN_WIDTH > 375 ? 172 : 152;
const SCROLL_CONTENT_TEXT_WIDTH = FormatUtils.formatDesignLength(DYNAMIC_WIDTH, 750, 2);

// 书籍封面尺寸
const BOOK_COVER_WIDTH = FormatUtils.formatDesignLength(96, 750, 2);
const BOOK_COVER_HEIGHT = FormatUtils.formatDesignLength(128, 750, 2);

const HEAD_THREE = [0, 1, 2];
const TO_MORE_TIPS = '更多小说'.split('');

@FeedsProtect.protect
export default class FeedsViewUIStyle439 extends FeedsViewItem<RankCardProps> {
  public static getRowType() {
    return 439;
  }
  public state = {
    position: 0,
  };
  public shouldComponentUpdate = shouldComponentUpdate(this, 'UIStyle439');

  private rankScrollView: any;

  private originTraceId = '';
  private traceId = ''; // traceid，不同的排行榜需要修改成不同的traceid
  private jumpUrl = '';

  /** 触发精准曝光检查 */
  private onScroll = throttle((e) => {
    strictExposeReporter.updateViewportLeft(this.props.index, e.contentOffset.x);
  }, 500);

  public UNSAFE_componentWillReceiveProps(nextProps: RankCardProps): void {
    // 更新 traceid
    this.updateNewTraceId(this.state.position, nextProps);
    // 打印关键数据日志
    this.logDataInfo(nextProps);
  }

  public render(): ReactElement | null {
    countReRender(this, 'UIStyle439');
    const { itemBean, globalConf = {} } = this.props;
    const { iRowNum, vDetailData = {}, vTextLink = {} } = FeedsUtils.getSafeProps(
      this.props,
      'itemBean.parsedObject',
      {},
    );

    // 过滤名称为空的榜单，一般都是因为推荐数据失败导致
    const data = vectorToArray(vDetailData)?.filter(({ sGroupName }) => !!sGroupName);
    if (!data?.length) return null;

    const titleRight = vectorToArray(vTextLink)[0] || {};
    titleRight.sUrl = this.getTitleUrl(data, titleRight.sUrl);

    return (
      <View style={[{ ...CommonCardStyle }]}>
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        <View>
          <View style={styles.titleWrap} onLayout={this.onRankTitleLayout}>
            <RankTabList
              tabType={RankTabType.SMALL}
              tabList={data}
              initSelectedIndex={this.state.position}
              onTabClick={index => this.chooseRank(index)}
            />
            <TitleRight text={titleRight.sText} onClick={strictExposeReporter.triggerExpoCheck(this.clickTitleRight)} />
          </View>
          {this.renderRank(data, iRowNum)}
        </View>
      </View>
    );
  }

  /**
   * 打印关键数据日志（接入层数据可视化后可以去除）
   * @param {*} nextProps
   */
  private logDataInfo = (nextProps: RankCardProps): void => {
    const parsedObject = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const nextParsedObject = FeedsUtils.getSafeProps(nextProps, 'itemBean.parsedObject', {});
    if (parsedObject !== nextParsedObject) {
      const { iRowNum, vDetailData = {}, vTextLink = {} } = nextParsedObject;
      const data = vectorToArray(vDetailData);
      const titleRight = vectorToArray(vTextLink)[0] || {};
      titleRight.sUrl = this.getTitleUrl(data, titleRight.sUrl);
      addKeylink(
        [
          `length: ${data.length}`,
          `iRowNum: ${iRowNum}`,
          data
            .map(item => `${item.sGroupName} length: ${FeedsUtils.getSafeProps(item, 'vRankData.value', []).length}`)
            .join('|'),
          `moreUrl: ${titleRight.sUrl}`,
        ].join(', '),
        `${TAG}.logDataInfo`,
      );

      // 榜单数量小于 3 属于非正常情况
      data.length < 3 && addKeylink('rank-size-notmatch', KeylinkCmd.PR_ERROR_SUM);
    }
  };

  /** 点击单本书上报 */
  private doBeaconByClick = (moredata = {}): void => {
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, moredata);
  };

  /** 点击某本书 */
  private clickBookItem = (book: RankBook, start: number): void => {
    const { sBookId } = book || {};
    this.doBeaconByClick({
      book_id: sBookId,
      bigdata_contentid: '',
      ext_data1: `${start}`,
    });
    this.loadUrl(book.sUrl);
  };

  /** 动态获取标题栏跳转url */
  private getTitleUrl = (tabs: RankItem[], url: string): string => {
    const { position } = this.state;
    this.jumpUrl = tabs[position]?.sGroupURL || url;
    return this.jumpUrl;
  };

  /** 点击全部榜单 */
  private clickTitleRight = (): void => {
    reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, this.props, {
      // 点击「查看全部」按钮需要使用原始的 traceid
      traceid: this.originTraceId,
    });
    this.jumpToRankPage();
  };

  /** 获取书籍人气信息 */
  private getRankHot = (hot: string, tips: string, position = 0): string => {
    if (tips !== '') return tips;
    // 人气单位处理
    let shownHot = Number(hot) < 10000 ? `${hot}人气` : `${(Math.ceil(Number(hot) / 1000) / 10).toFixed(1)}万人气`;
    // 飙升榜体现一下上升
    if (position === 1) shownHot = `上升${shownHot}`;
    return shownHot;
  };

  /** 根据生成对应的书籍内容 */
  private getRankItem = (book: RankBook, start: number, position: number, rowNum: number): ReactElement => {
    const { itemBean } = this.props || {};
    const { sHot = '0', sPicUrl, sBookTips = '', sBookId, stTag } = book || {};
    const leftTag = FeedsUtils.getLeftTagStyle(stTag, SmallBookCoverLeftTagStyle);
    const hot = this.getRankHot(sHot, sBookTips, position);

    return (
      <View
        key={`${book.sBookId}-${start}`}
        style={styles.rankItem}
        onLayout={event => this.onBookItemLayout({
          event,
          tabIndex: position,
          bookIndex: start,
          bookId: book.sBookId,
          rowNum,
        })
        }
        onClick={strictExposeReporter.triggerExpoCheck(() => this.clickBookItem(book, start))}
      >
        <BookCover
          height={BOOK_COVER_HEIGHT}
          width={BOOK_COVER_WIDTH}
          url={sPicUrl}
          bookID={sBookId}
          radius={BookCoverRadiusStyle.SMALL}
          sourceFrom={itemBean?.item_id}
          leftTag={leftTag}
        />
        <View>
          <View style={styles.rankContentTitle}>
            <Text style={[
              styles.rankContentNum,
              HEAD_THREE.includes(start) ? styles.orderHeadThree : null,
              start + 1 >= 10 ? { fontSize: FeedsUIStyle.T1 } : null, // 兼容部分华为手机文字折行问题
            ]}>
              {start + 1}
            </Text>
            <Text style={styles.rankContentText} numberOfLines={2}>
              {book.sTitle}
            </Text>
          </View>
          <View>
            <Text style={styles.rankHotText} numberOfLines={1}>
              {hot}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /** 渲染ScrollView右侧的更多小说 */
  private renderToMoreTips = (): ReactElement => (
    <View style={styles.toMore}>
      <Image
        source={{ uri: FeedsIcon.novel_card_arrow }}
        style={[styles.arrow, { transform: [{ rotate: '180deg' }] }]}
        noPicMode={{ enable: false }}
      />
      <View style={styles.toMoreTips}>
        {TO_MORE_TIPS.map(i => (
          <Text key={i} style={styles.toMoreText}>
            {i}
          </Text>
        ))}
      </View>
    </View>
  );

  /** 生成榜单容器 */
  private renderRank = (data: RankItem[], rowNumber = DEFAULT_ROWS): ReactElement | null => {
    const { index } = this.props || {};

    const { position } = this.state;
    const items = data[position] ? vectorToArray(data[position].vRankData) : [];
    if (items.length === 0) {
      addKeylink(`empty-rank-${position}`, KeylinkCmd.PR_ERROR_SUM);
      return null;
    }

    strictExposeReporter.updateBookIds(
      index,
      position,
      items.map(book => book.sBookId),
    );

    const rankView: ReactElement[] = items
      .reduce((acc: ReactElement[], book: RankBook, index: number) => {
        const column = Math.floor(index / rowNumber);
        const el = this.getRankItem(book, index, position, rowNumber);
        if (!acc[column]) return [...acc, [el]];
        const last = acc.pop() as any;
        return [...acc, [...last, el]];
      }, [])
      .map((column: ReactElement[], columnIndex: number): ReactElement => (
        <View style={styles.scrollColumnWrap} key={`${columnIndex}`}>
          {column}
        </View>
      ));

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        sendMomentumEvents
        ref={(ref) => {
          this.rankScrollView = ref;
        }}
        onScroll={this.onScroll}
        onMomentumScrollEnd={this.onMomentumScrollEnd}
        onScrollEndDrag={this.onScrollEndDrag}
        scrollEventThrottle={10}
        style={styles.rankWarp}
      >
        {rankView}
        {this.renderToMoreTips()}
      </ScrollView>
    );
  };

  /** 跳转榜单二级页 */
  private jumpToRankPage = (): void => {
    this.jumpUrl && this.loadUrl?.(this.jumpUrl);
  };

  /** 拉到右边界跳转到二级页 */
  private onScrollEndDrag = (e: Record<string, any>): void => {
    const {
      contentOffset: { x: contentOffsetX },
      contentSize: { width: contentWidth },
      layoutMeasurement: { width: layoutWidth },
    } = e;

    // 是否触及右边界
    const isReachRightEdge = contentOffsetX + layoutWidth >= contentWidth;
    if (!isReachRightEdge) return;

    this.jumpToRankPage();
  };

  /** 选中一个榜单 */
  private chooseRank = (position: number): void => {
    if (position !== this.state.position) {
      // 设置新的traceid
      this.updateNewTraceId(position);
      this.setState({ position }, this.handleAfterTabChange);
    }
    // 点击tab上报
    reportUDS(BusiKey.CLICK__CARD_TAB, this.props, {
      traceid: this.traceId,
    });
  };

  /** 处理tab改变后的操作 */
  private handleAfterTabChange = (): void => {
    this.rankScrollView?.scrollTo({ x: 0, y: 0, animated: true });
  };

  /** 获取新的traceid，有多个榜单，根据位置修改traceid的第5位，表示不同的榜单，策略需要和后台保持一致 */
  private updateNewTraceId = (position: number, props?: RankCardProps): void => {
    const { itemBean } = props || this.props;
    const { report_info: reportInfo = [], parsedObject } = itemBean;
    const { vDetailData = {} } = parsedObject || {};
    const data = vectorToArray(vDetailData);
    itemBean.report_info = reportInfo.map((item) => {
      const [key, value] = item || [];
      if (key === 'sTraceId') {
        // 记住原始的 traceid
        if (!this.originTraceId) this.originTraceId = value;
        this.traceId = data[position]?.sTraceID;
        return [key, this.traceId];
      }
      return item;
    });
  };

  /** 卡片滑动的上报 */
  private onMomentumScrollEnd = (): void => {
    reportUDS(BusiKey.SLIDE__CARD, this.props, {
      bigdata_contentid: '',
      traceid: this.traceId,
    });
  };

  /** 榜单有 2 层标题，用第二层标题进行计算 */
  private onRankTitleLayout = (event: Record<string, any>): void => {
    const { y, height } = event.layout;
    strictExposeReporter.updateTitleHeight(this.props.index, y + height);
  };

  /**
   * 精准曝光 item 信息收集
   * @param {Object} event layout 事件对象
   * @param {Number} tabIndex tab 索引
   * @param {Number} bookIndex 书籍索引
   * @param {String} bookId 书籍 id
   * @param {Number} rowNum 行数
   */
  private onBookItemLayout = ({ event, tabIndex, bookIndex, bookId, rowNum }): void => {
    // 左右滑动模式下，item 的 x = 左侧的所有 margin + 左侧所有列宽之和
    const leftCount = Math.floor(bookIndex / rowNum);
    const leftMargin = leftCount * styles.scrollColumnWrap.marginRight;
    const leftWidth = leftCount * event.layout.width;
    const x = event.layout.x + leftMargin + leftWidth;
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      tabIndex,
      bookIndex,
      bookId,
      rect: {
        ...event.layout,
        x,
        y: event.layout.y,
      },
      supportHorizontalScroll: true,
    });
  };
}

const styles = StyleSheet.create({
  rankWarp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: FeedsUIStyle.T3,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankItem: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
  scrollColumnWrap: {
    flexDirection: 'column',
    marginRight: 12,
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
    fontFamily: FeedsUtils.isAndroid() ? 'DINNextLTPro-Medium' : 'DIN Next LT Pro',
    fontWeight: 'bold',
  },
  rankContentText: {
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N1,
    marginBottom: 4,
    lineHeight: 20,
    width: SCROLL_CONTENT_TEXT_WIDTH,
  },
  rankHotText: {
    marginLeft: 20,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_4,
    width: SCROLL_CONTENT_TEXT_WIDTH,
  },
  orderHeadThree: {
    colors: FeedsTheme.SkinColor.N3,
  },
  titleWrap: {
    padding: FeedsUIStyle.T3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toMore: {
    flexDirection: 'row',
    alignItems: 'center',
    /** 兼容安卓样式右侧塌陷 */
    marginRight: getDeviceVisitor().isAdr() ? 16 : 0,
    paddingRight: 16,
    paddingBottom: 16,
  },
  toMoreTips: {
    justifyContent: 'center',
  },
  toMoreText: {
    colors: FeedsTheme.SkinColor.N1_4,
    fontSize: FeedsUIStyle.T1,
    height: 14,
  },
  arrow: {
    height: 9,
    width: 5,
    marginRight: 6,
    tintColors: FeedsTheme.SkinColor.RANK_MORE_ARROW,
  },
});
