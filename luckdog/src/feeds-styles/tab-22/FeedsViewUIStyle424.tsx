/**
 * @Author: veryoungwan
 * 多排行榜卡片
 */
import React from 'react';
import { View, Text, ScrollView, PixelRatio, StyleSheet } from '@tencent/hippy-react-qb';
import { FeedsTheme, vectorToArray } from './components/utils';
import FeedsUtils from '../../framework/FeedsUtils';
import { Title } from './components';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsViewItem from '../FeedsViewItem';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CLICK_STEP, CommonCardStyle, FeedsUIStyle, SmallBookCoverLeftTagStyle } from '../../framework/FeedsConst';
import { reportUDS, strictExposeReporter, BusiKey, addKeylink, KeylinkCmd } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { scale } from '../../components/animationStyle';
import { throttle } from '@/luckbox';
import { CommonProps } from '../../entity';
import { activeEventObserver } from '../../utils/NativeEventAdapter';
import { BookCoverRadiusStyle } from '../../types/card';
import { BookCover } from '../../components/book-font-cover';

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
  titleClicked: {
    backgroundColors: FeedsTheme.SkinColor.N2,
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

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle424 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 424;
  }
  public RankScrollView: any;

  public state = {
    position: 0,
  };
  public scaleAnim = scale(200, 1.015); // 点击动画效果
  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle424');
  public firstRender = true; // 是否首次渲染
  public lifecycleListener; // 监听终端的生命周期；
  public originTraceId = '';
  public isFromActive = false;
  public traceId = ''; // traceid，不同的排行榜需要修改成不同的traceid
  public features = {} as any; // 新增上报扩展字段集

  public constructor(props) {
    super(props);
    // 注册终端事件
    activeEventObserver.addEventObserver(() => {
      // 触发页面显示状态
      this.isFromActive = true;
    });
  }

  public componentDidMount() {
    this.scaleAnim.onHippyAnimationEnd(() => {
      // 执行跳转
      this.clickBlankJumpMore();
    });
  }

  public UNSAFE_componentWillMount() {
    this.chooseRank(0);
    this.setFeatureConfig();
  }

  public componentWillUnmount() {
    this.scaleAnim?.destory();
  }

  /**
   * 处理跳转动画结束后加载去往更多页面
   * 跳转地址不为空
   * 支持跳转
   */
  public clickBlankJumpMore = () => {
    const { vTextLink = {} } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const { sUrl = '' } = vectorToArray(vTextLink)[0] || {};
    if (sUrl !== '') {
      this.loadUrl(sUrl);
    }
  };

  /**
   * title点击的响应
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onClickTitle = throttle(() => {
    const { clickBlankJump = false } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (clickBlankJump) {
      reportUDS(BusiKey.CLICK__BLANK_TO_MORE, this.props, { traceid: this.traceId });
      this.scaleAnim.start();
    }
  }, CLICK_STEP);

  /**
   * 设置上报的特征参数
   * ext_data2 是否可滑动
   * ext_data3 几列
   * ext_data4 是否支持刷新切换
   */
  public setFeatureConfig = () => {
    const { bSlidable = false, bRefresh = false, iRowNum = 4 } = FeedsUtils.getSafeProps(
      this.props,
      'itemBean.parsedObject',
      {},
    );
    this.features.ext_data2 = bSlidable ? 1 : 0;
    this.features.ext_data3 = iRowNum;
    this.features.ext_data4 = bRefresh ? 1 : 0;
  };

  public UNSAFE_componentWillReceiveProps(nextProps) {
    // 更新 traceid
    this.updateNewTraceId(this.state.position, nextProps);
    // 刷新的结束后切换tab
    this.setTabAfterRefresh(nextProps);
    this.firstRender = false;
    // 打印关键数据日志
    this.logDataInfo(nextProps);
  }

  /**
   * 打印关键数据日志（接入层数据可视化后可以去除）
   * @param {*} nextProps
   */
  public logDataInfo = (nextProps) => {
    const parsedObject = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const nextParsedObject = FeedsUtils.getSafeProps(nextProps, 'itemBean.parsedObject', {});
    if (parsedObject !== nextParsedObject) {
      const { bSlidable = false, iRowNum, vDetailData = {}, vTextLink = {} } = nextParsedObject;
      const data = vectorToArray(vDetailData);
      const titleRight = vectorToArray(vTextLink)[0] || {};
      titleRight.sUrl = this.getTitleUrl(data, titleRight.sUrl);
      addKeylink(
        [
          `length: ${data.length}`,
          `bSlidable: ${bSlidable}`,
          `iRowNum: ${iRowNum}`,
          data
            .map(item => `${item.sGroupName} length: ${FeedsUtils.getSafeProps(item, 'vRankData.value', []).length}`)
            .join('|'),
          `moreUrl: ${titleRight.sUrl}`,
        ].join(', '),
        'FeedsViewUIStyle424.logDataInfo',
      );

      // 榜单数量小于 3 属于非正常情况
      data.length < 3 && addKeylink('rank-size-notmatch', KeylinkCmd.PR_ERROR_SUM);
    }
  };

  /**
   * 刷新之后自动更新选中的tab
   * 自动更新tab条件
   * 1. 后台下发字段支持在刷新后更新tab
   * 2. 有多个tab
   * 3. 非首次渲染
   * */
  public setTabAfterRefresh = (props) => {
    // 如果是active造成的页面响应 不能更换position
    if (this.isFromActive) {
      this.isFromActive = false;
      return;
    }
    if (props && !this.firstRender) {
      const { bRefresh = false, vDetailData = {} } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
      const rankList = vDetailData.value || [];
      if (bRefresh && rankList.length > 0) {
        const { position } = this.state;
        let newPosition = position + 1;
        if (newPosition > rankList.length - 1) newPosition = 0;
        this.setState(
          {
            position: newPosition,
          },
          () => {
            this.handleAfterTabChange();
            this.updateNewTraceId(newPosition);
          },
        );
      }
    }
  };

  /** 点击单本书上报 */
  public doBeaconByClick = (moredata = {}) => {
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, moredata);
  };

  /** 点击查看所有榜单上报 */
  public doBeaconByClickAll = () => {
    reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, this.props, {
      // 点击「查看全部」按钮需要使用原始的 traceid
      traceid: this.originTraceId,
      ...this.features,
    });
  };

  /** 点击某本书 */
  public clickBookItem = (book) => {
    const { sBookId } = book || {};
    this.doBeaconByClick?.({
      book_id: sBookId,
      ...this.features,
    });
    this.loadUrl(book.sUrl);
  };

  /**
   * 根据榜单位置取后台数据支持透传
   * @param {array} tabs 榜单集数据
   * @param {string} url 默认下发的跳转链接作为打底
   */
  public getTitleUrl = (tabs, url) => {
    const { position } = this.state;
    return tabs[position]?.sGroupURL || url;
  };

  /**
   * 获取书籍人气信息
   * @param {number} hot 书籍人气值
   * @param {string} tips 书籍人气内容
   * @param {number} position 当前榜单所在位置
   */
  public getRankHot = (hot, tips, position = 0) => {
    if (tips !== '') return tips;
    // 人气单位处理
    let shownHot = hot < 10000 ? `${hot}人气` : `${(Math.ceil(hot / 1000) / 10).toFixed(1)}万人气`;
    // 飙升榜体现一下上升
    if (position === 1) shownHot = `上升${shownHot}`;
    return shownHot;
  };

  /** 根据生成对应的书籍内容 */
  public getRankItem = (book, start, position, slidable, rowNum) => {
    const { itemBean = {} } = this.props || {};
    const { sHot = 0,  sPicUrl, sBookTips = '', sBookId, stTag } = book || {};
    const leftTag = FeedsUtils.getLeftTagStyle(stTag, SmallBookCoverLeftTagStyle);
    const hot = this.getRankHot(sHot, sBookTips, position);
    const textStyle: any[] = [styles.rankContentText];
    slidable ? textStyle.push(styles.scrollRankContentText) : textStyle.push(styles.noScrollRankContentText);
    return (
      <View
        key={`${book.sBookId}-${start}`}
        style={styles.rankItem}
        onLayout={event => this.onBookItemLayout({
          event,
          tabIndex: position,
          bookIndex: start,
          bookId: book.sBookId,
          slidable,
          rowNum,
        })
        }
        onClick={strictExposeReporter.triggerExpoCheck(() => this.clickBookItem(book))}
      >
        <BookCover
          height={IMAGE_HEIGHT}
          width ={IMAGE_WIDTH}
          url={sPicUrl}
          bookID={sBookId}
          radius={BookCoverRadiusStyle.SMALL}
          sourceFrom={itemBean?.item_id}
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
              {book.sTitle}
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

  /**
   * 生成榜单容器
   * @param {array} data 榜单数据集
   * @param {boolean} slidable 是否可滑动
   * @param {number} rowNumber 后台下发每列展示的行数，默认4行
   */
  public renderRank = (data, slidable, rowNumber = DEFAULT_COLUMN_ROWS_NUMBER) => {
    const { index } = this.props || {};

    const rankView: any[] = [];
    const { position } = this.state;
    const items = data[position] ? vectorToArray(data[position].vRankData) : [];
    if (items.length === 0) {
      addKeylink(`empty-rank-${position}`, KeylinkCmd.PR_ERROR_SUM);
      return null;
    }

    // 能滑动的条件：后台下发字段slidable为true，且数据条数大于8
    const canSlide = slidable && items.length > DEFAULT_COLUMN_NUMBER * DEFAULT_COLUMN_ROWS_NUMBER;
    // 实际每列展示的行数（能滑动才取后台数据，不能滑动则展示4行）
    const rowNum = canSlide ? rowNumber : DEFAULT_COLUMN_ROWS_NUMBER;
    strictExposeReporter.updateBookIds(
      index,
      position,
      items.map(book => book.sBookId),
    );
    // 算出需要展示的列数，不允许滑动的情况下只有两列
    const columnNum = canSlide ? Math.ceil(items.length / rowNumber) : DEFAULT_COLUMN_NUMBER;
    let start = 0;
    for (let columnIndex = 0; columnIndex < columnNum; columnIndex++) {
      const columnItems: any[] = [];
      for (let index = 0; index < rowNum; index++) {
        // 如果不可滑动展示两排，如果可滑动，展示所有
        const isShow = canSlide ? start < items.length : start < items.length && start < rowNum * 2;
        if (!isShow) break; // 判断是否越界
        const book = items[start];
        columnItems.push(this.getRankItem(book, start, position, canSlide, rowNum));
        start += 1;
      }
      rankView.push(<View
        style={canSlide ? styles.scrollColumnWrap : styles.rankColumnWrap}
        key={`${columnIndex}`}
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

      // 再次进行曝光上报
      this.doBeaconByExpose(position);
    }
    if (isUserClick) {
      // 添加点击title上报
      reportUDS(BusiKey.CLICK__CARD_TAB, this.props, {
        // 点击「查看全部」按钮需要使用原始的 traceid
        traceid: this.traceId,
        ext_data1: 1,
        ...this.features,
      });
    }
  };

  /** 渲染榜单标题 */
  public renderRankTitle = (data) => {
    const { position } = this.state;
    const view: any[] = [];
    for (let i = 0; i < data.length; i++) {
      view.push(<View
        key={`${data[i].sGroupId}_${data[i].sGroupName}_${i}`}
        style={[
          styles.titleItem,
          i === 0 || i === data.length - 1
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
          {data[i].sGroupName}
        </Text>
      </View>);
    }
    return view;
  };

  // 获得不同榜单内书籍的所有bookid，用于上报
  public getBookIdContents = (position, data) => {
    const items = vectorToArray(data[position].vRankData) || [];
    const bookIds: string[] = [];

    if (items.length > 0) {
      items.forEach((book) => {
        const { sBookId = '' } = book || {};
        if (sBookId !== '') bookIds.push(sBookId);
      });
    }

    return bookIds.join(',');
  };

  // 曝光事件，重新赋值 bigdata_contentid 和 traceid
  // 不同的榜单使用不同的traceid，bigdata_contentid中为本榜单内的bookid
  public doBeaconByExpose = (position) => {
    const { itemBean = {}, index: cardIndex } = this.props;
    const { parsedObject = {} } = itemBean;
    const detailData = parsedObject ? parsedObject.vDetailData : {};
    const data = vectorToArray(detailData) || [];

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const bigdata_contentid = this.getBookIdContents(position, data);
    // 上报曝光事件
    reportUDS(BusiKey.EXPOSE__CARD, this.props, {
      bigdata_contentid,
      traceid: this.traceId,
      ext_data1: cardIndex + 1, // 卡片位置
      ...this.features,
    });
  };

  /** 处理tab改变后的操作 */
  public handleAfterTabChange = () => {
    const { bSlidable = false } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    // 刷新的时候需要放置回原来位置
    if (bSlidable) {
      this.RankScrollView?.scrollTo({ x: 0, y: 0, animated: true });
    }
  };

  /** 获取新的traceid，有多个榜单，根据位置修改traceid的第5位，表示不同的榜单，策略需要和后台保持一致 */
  public updateNewTraceId = (position, props?: any) => {
    const { itemBean = {} } = props || this.props;
    const { report_info: reportInfo = [],  parsedObject = {} } = itemBean;
    const { vDetailData = {} } = parsedObject;
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

  /** 终端滑动停止时候触发事件 */
  public onMomentumScrollEnd = () => {
    this.doBeaconBySlide();
  };

  /** 卡片滑动的上报 */
  public doBeaconBySlide = () => {
    reportUDS(BusiKey.SLIDE__CARD, this.props, {
      bigdata_contentid: '',
      traceid: this.traceId,
      ...this.features,
    });
  };

  /** 榜单有 2 层标题，用第二层标题进行计算 */
  public onRankTitleLayout = (event) => {
    const { y, height } = event.layout;
    strictExposeReporter.updateTitleHeight(this.props.index, y + height);
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

  /** 触发精准曝光检查 */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onScroll = throttle((e) => {
    strictExposeReporter.updateViewportLeft(this.props.index, e.contentOffset.x);
  }, 500);

  public render() {
    countReRender(this, 'FeedsViewUIStyle424');
    const { itemBean = {}, globalConf = {} } = this.props;
    const { title = '' } = itemBean;
    const { bSlidable = false, iRowNum, vDetailData = {}, vTextLink = {} } = FeedsUtils.getSafeProps(
      this.props,
      'itemBean.parsedObject',
      {},
    );
    const data = vectorToArray(vDetailData)?.filter(({ sGroupName }) => !!sGroupName);
    if (!data?.length) return null;
    const titleRight = vectorToArray(vTextLink)[0] || {};
    titleRight.sUrl = this.getTitleUrl(data, titleRight.sUrl);
    return (
      <View style={[{ ...CommonCardStyle }, { transform: [{ scale: this.scaleAnim }] }]}>
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        <View
          style={{
            paddingHorizontal: bSlidable ? 0 : 4,
          }}
        >
          <View collapsable={false} onClick={this.onClickTitle}>
            <Title title={title} parent={this} right={titleRight} doBeaconByClick={this.doBeaconByClickAll} />
          </View>
          <View style={styles.titleWarp} onLayout={this.onRankTitleLayout}>
            {this.renderRankTitle(data)}
          </View>
          {this.renderRank(data, bSlidable, iRowNum)}
        </View>
      </View>
    );
  }
}
