/* eslint-disable no-param-reassign */
/**
 * 每日推荐 列+行式排列
 */
import React from 'react';
import { View, Text, Image, AnimationSet, StyleSheet } from '@tencent/hippy-react-qb';

import FeedsViewItem from '../FeedsViewItem';
import FeedsTheme from '../../framework/FeedsTheme';
import FeedsUtils from '../../framework/FeedsUtils';
import FeedsIcon from '../../framework/FeedsIcon';
import { FeedsLineHeight, FeedsUIStyle, CommonCardStyle, CLICK_STEP } from '../../framework/FeedsConst';
import { strictExposeReporter, reportUDS, BeaconReportProps, BusiKey } from '@/luckdog';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CardLinkType } from '../../entity/card';
import { vectorToArray, getTitleRight } from './components/utils';
import { Title, PicText } from './components';
import { ConstantUtils } from '../common/utils';
import { scale } from '../../components/animationStyle';
import { MTT, shouldComponentUpdate, countReRender, throttle } from '@/luckbox';
import { TabId, ItemBean } from '../../entity';
import { initReportInfo, getChangeReportInfo, switchNovelPrefetch } from '../../utils/preFetchCard';

/** 每日推荐卡片props类型 */
interface UI429Props extends BeaconReportProps {
  title?: string;
  index: number;
  itemBean: UI429ItemBean;
  globalConf: any;
  parent: any;
  cardIndex: number;
  selectTabID: number;
}

/** 每日推荐卡片itemBean类型 */
interface UI429ItemBean extends ItemBean {
  parsedObject: MTT.HomepageFeedsUI429;
  tab_id: string;
  item_id: string;
}

/** 每日推荐卡片state类型 */
interface UI429State {
  pageList: MTT.HomeFeedsPage429Item[];
  position: number;
}

/** 模块关键字 */
const CARD_TAG = 'FeedsViewUIStyle429';
/** 模块uiStyle */
const CARD_NUMBER = 429;
/** 屏幕宽度 */
const screenWidth = ConstantUtils.getScreenWidth();
/**
 * 书籍封面宽度
 * 背景：由于View嵌套会导致layout的时候高度计算不准确，影响精准曝光，这里采用flex布局自动换行的方式布局，
 *      宽度通过（屏幕宽度 - 所有间距）/ 一行卡片的数量 计算获得
*/
const IMAGE_WIDTH = (screenWidth - (12 * 2) - (16 * 2) - (26 * 3)) / 4;
/** 书籍封面高度 */
const IMAGE_HEIGHT = (IMAGE_WIDTH * 162) / 120;
/** 行式排列的书籍一行展示的个数 */
const ONE_ROW_NUM = 4;

@FeedsProtect.protect
export default class FeedsViewUIStyle429 extends FeedsViewItem<UI429Props> {
  public static getRowType() {
    return CARD_NUMBER;
  }

  public state!: UI429State;
  public loadUrl!: (sUrl: string) => void;
  public setState!: (arg: any, fn?: () => void) => void;
  public scaleAnim: AnimationSet = scale(200, 1.015); // 点击动画效果
  public shouldComponentUpdate = shouldComponentUpdate(this, CARD_TAG);
  public reportInfo: Record<string, any> = {};

  /**
   * title点击的响应
   * TODO: 多个卡片使用，进行抽象
   */
  public onClickTitle = throttle(() => {
    const { clickBlankJump = false } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});

    if (clickBlankJump) {
      reportUDS(BusiKey.CLICK__BLANK_TO_MORE, this.props);
      this.scaleAnim.start();
    }
  }, CLICK_STEP);

  public constructor(props: UI429Props) {
    super(props);
    this.state = {
      pageList: [],
      position: 0,
    };

    const { globalConf: { curTabId = TabId.BOTTOM_RECOMM2 } = {}, index = 0 } = props || {};

    // 局部刷新换一换替换上报参数
    strictExposeReporter.addReportDataHandler(curTabId, index, (moreData) => {
      const { linkType: refreshType } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
      const { position } = this.state;

      // 如果是局部刷新换一换，需要在上报之前获取到动态的report_info
      const reportInfo = refreshType === CardLinkType.CHANGE ? getChangeReportInfo(props, position) : {};

      return {
        ...moreData,
        ...reportInfo,
      };
    });
  }

  public componentDidMount() {
    // 点击标题动画结束后执行的内容
    this.scaleAnim.onHippyAnimationEnd(() => {
      // 执行跳转
      this.clickBlankJumpMore();
    });

    this.updateShownBooks(this.props);
  }

  public UNSAFE_componentWillReceiveProps(nextProps: UI429Props) {
    this.updateShownBooks(nextProps);

    // 上报查看更多
    const { linkType = 0 } = FeedsUtils.getSafeProps(nextProps, 'itemBean.parsedObject', {});
    if (linkType === CardLinkType.MORE) reportUDS(BusiKey.EXPOSE__TO_MORE, this.props);
  }

  public componentWillUnmount() {
    // 销毁点击标题动画
    this.scaleAnim?.destory();
  }

  /**
   * 设置上报参数
   * @param props 卡片的props或nextProps
   */
  public setReportInfo = (props: UI429Props) => {
    const { pageList } = this.state;
    initReportInfo(props, pageList.length);
  };

  /**
   * 更新展示的书籍
   * @param props props
   */
  public updateShownBooks = (props: UI429Props) => {
    const { vDetailData = {} } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
    const dataList = vectorToArray(vDetailData);
    dataList.forEach((item) => {
      item.vColumnRes = vectorToArray(item.vColumnRes);
      item.vRowRes = vectorToArray(item.vRowRes);
    });

    this.setState({
      pageList: dataList,
      position: 0,
    }, () => {
      const { linkType: refreshType } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
      // 如果是局部刷新换一换，需要动态设置report_info
      refreshType === CardLinkType.CHANGE && this.setReportInfo(props);
    });
  };

  /**
   * 处理跳转动画结束后加载去往更多页面
   * 跳转地址不为空
   * 支持跳转
   */
  public clickBlankJumpMore = () => {
    const { moreLink } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    moreLink && this.loadUrl(moreLink);
  };

  /**
   * 点击跳转
   * @param book 书籍信息
   * @param index index
   */
  public openFromUrl = (book: MTT.HomepageFeedsNovelDetailData) => {
    const { itemBean }: { itemBean?: UI429ItemBean } = this.props;
    const { sUrl = '', sBookId = '' } = book;
    if (sUrl) {
      FeedsUtils.doLoadUrl(sUrl, itemBean?.tab_id);
    }

    this.doBeaconByClick({ book_id: sBookId });
  };

  /**
   * 点击上报到灯塔
   */
  public doBeaconByClick = (moreData = {} as any) => {
    // 上报点击事件
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, { bigdata_contentid: '', ...moreData });
  };

  /**
   * 点击换一换上报
   * @param pageList 所有的分页书籍
   * @param position 当前页的下标
   */
  public doBeaconBySwitch = (pageList: MTT.HomeFeedsPage429Item[], position: number) => {
    const { linkType: refreshType, refreshKey = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const { vColumnRes: columnList = [], vRowRes: rowList = [] } = pageList[position] || {};
    const bookIds = columnList.map(book => book?.sBookId).concat(rowList.map(book => book?.sBookId));
    const isPreFetch = refreshType === CardLinkType.CHANGE && refreshKey !== '';

    // 点击上报
    reportUDS(BusiKey.CLICK__CARD_CHANGE, this.props, {
      bigdata_contentid: '',
      ext_data1: isPreFetch ? '1' : '0',
    });
    // 老灯塔曝光上报
    reportUDS(BusiKey.EXPOSE__CARD, this.props, { bigdata_contentid: bookIds.join(',') });
  };

  /**
   * 点击查看全部上报
   */
  public doBeaconByClickAll = () => {
    const { linkType = 0 } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (linkType === CardLinkType.MORE) {
      reportUDS(BusiKey.CLICK__TO_MORE, this.props, { bigdata_contentid: '' });
      return;
    }
  };

  /**
   * 精准曝光，计算元素距离顶部的距离
   * @param event 事件
   * @param index 书籍的index
   * @param bookId 书籍id
   * @param isRowBook 是否为行式展示的书籍
   */
  public onBookItemLayout = (event: any, index: number, bookId: string, isRowBook: boolean) => {
    const detailData = vectorToArray(FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject.vDetailData', {}));
    // 列式展示的书籍的数目
    const columnNum = vectorToArray(detailData?.[0]?.vColumnRes).length;
    // 列式展示的书籍的高度
    const columnListHeight = IMAGE_HEIGHT + styles.listContainer.marginBottom;
    // 多层 View 嵌套，导致行式的书籍获取到的 y 不是相对于卡片的，需要手动加上所有列式书籍的高度
    const y = isRowBook ? event.layout.y + (columnNum * columnListHeight) : event.layout.y;
    // 书籍的index，如果是行式展示的书籍，需要加上之前列式书籍的个数
    const bookIndex = isRowBook ? columnNum + index : index;

    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      rect: {
        ...event.layout,
        y,
      },
    });
  };

  public onTitleLayout = (event: any) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /**
   * 切换猜你想看 换一换
   */
  public switchNovel = () => {
    const { refreshKey = '', size } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    let { position = 0, pageList } = this.state;

    position = position === pageList.length - 1 ? 0 : position + 1;

    switchNovelPrefetch(this.props, position, pageList.length - 1, size, (res) => {
      const preFetchBooks = FeedsUtils.getSafeProps(res[refreshKey] || {}, 'parsedObject.vDetailData', []);
      pageList = [...pageList, ...preFetchBooks];
      this.setState({
        pageList,
      });
    });

    this.setState({
      position,
    });

    this.doBeaconBySwitch(pageList, position);
  };

  /**
   * 渲染标题
   */
  public renderTitle = () => {
    const { title = '', parsedObject = {} } = FeedsUtils.getSafeProps(this.props, 'itemBean', {});
    const { linkType = 0 } = parsedObject;
    const titleRight = getTitleRight(this.props);
    if (!title || title.length === 0) return null;

    return (
      <View
        collapsable={false}
        onClick={this.onClickTitle}
      >
        <Title
          title={title}
          onLayout={this.onTitleLayout}
          switchNovel={this.switchNovel}
          changeable={linkType === CardLinkType.CHANGE}
          right={titleRight}
          parent={this}
          doBeaconByClick={this.doBeaconByClickAll}
        />
      </View>
    );
  };

  /**
   * 渲染一本列式排列的书籍
   * @param book 书籍
   * @param index 书籍的index
   */
  public renderBookColumn = (book: MTT.HomepageFeedsNovelDetailData, index: number) => {
    const { itemBean, globalConf = {} } = this.props || {};
    const { sBookId = '', sTitle = '', sUrl = '', sPicUrl = '',
      sBrief = '', sTag = '', sState = '', sScore = '' } = book;
    const style = {
      scoreStyle: styles.bookScore,
      titleStyle: styles.bookName,
      picImgStyle: styles.bookImg,
      middleStyle: styles.middleStyle,
      picViewStyle: styles.picView,
      titleViewStyle: styles.titleViewStyle,
      textViewStyle: styles.textView,
      middleViewStyle: styles.middleView,
    };

    if (!sBookId || !sTitle) {
      return null;
    }

    return (
      <View
        onLayout={(event: any) => this.onBookItemLayout(event, index, sBookId, false)}
        key={`${CARD_TAG}_book_column_${index}`}
      >
        <PicText
          title={sTitle}
          picUrl={sPicUrl}
          openUrl={sUrl}
          score={sScore}
          intro={sBrief}
          bookid={sBookId}
          type={sTag}
          status={sState}
          hasButton={false}
          item_id={itemBean.item_id}
          parents={this}
          globalConf={globalConf}
          bookIndex={index}
          doBeaconByClick={this.doBeaconByClick}
          styles={style}
        />
      </View>
    );
  };

  /**
   * 渲染一排行式排列的书籍
   * @param {*} books 行式排列的书籍
   * @param {Number} rowIndex 书籍是第几行
   */
  public renderBooksRow = (books: MTT.HomepageFeedsNovelDetailData[]) => {
    const { itemBean } = this.props;

    return books.map((book, index) => {
      if (!book || !Object.keys(book).length) {
        return null;
      }
      const { sBookId = '', sTitle = '', sPicUrl = '', sScore = '' } = book;
      return (
        <View
          key={`${CARD_TAG}_books_row_${sBookId}_${index}`}
          style={styles.item}
          onLayout={event => this.onBookItemLayout(event, index, sBookId, true)}
          onClick={
            strictExposeReporter.triggerExpoCheck(() => this.openFromUrl(book))
          }
        >
          <View>
            <Image
              style={[styles.bookImg, styles.smallBookImg]}
              reportData={{ sourceFrom: itemBean?.item_id }}
              source={{
                uri: sPicUrl || FeedsIcon.novel_default_cover,
              }}
            />
            <Text style={styles.smallBookName} numberOfLines={2}>
              {sTitle}
            </Text>
          </View>
          {
            sScore ? <Text style={[styles.bookScore, styles.smallBookScore]} numberOfLines={1}>
              {sScore}分
            </Text> : null
          }
        </View>
      );
    });
  };

  /**
   * 渲染列式排列的书籍
   * TODO： 拆细组件粒度
   */
  public renderColumnBookList = () => {
    const { position, pageList } = this.state;
    const { vColumnRes = {} } = pageList[position] || {};
    const columnBookList = vectorToArray(vColumnRes);
    if (!columnBookList || !columnBookList.length) {
      return null;
    }
    return (
      <View style={styles.columnContainer}>
        {columnBookList.map((
          item: MTT.HomepageFeedsNovelDetailData,
          index: number,
        ) => (this.renderBookColumn(item, index)))}
      </View>
    );
  };

  /**
   * 渲染行式排列的书籍
   */
  public renderRowBooksList = () => {
    const { position, pageList } = this.state;
    const { vRowRes = {} } = pageList[position] || {};
    const rowBookList = vectorToArray(vRowRes);
    if (!rowBookList || !rowBookList.length || rowBookList.length < ONE_ROW_NUM) {
      return null;
    }

    return (
      <View style={styles.rowBooksContainer}>
        {this.renderBooksRow(rowBookList)}
      </View>
    );
  };

  public render() {
    countReRender(this, CARD_TAG);
    const { index: cardIndex } = this.props;
    const { parsedObject = {} } = FeedsUtils.getSafeProps(this.props, 'itemBean', {});
    if (!parsedObject) return null;

    const { position, pageList } = this.state;
    const { vColumnRes = [], vRowRes = [] } = pageList?.[position] || {};
    const bookIds = vColumnRes.map(item => item.sBookId).concat(vRowRes.map(item => item.sBookId));

    strictExposeReporter.updateBookIds(cardIndex, position, bookIds);

    return (
      <View
        style={[CommonCardStyle, { transform: [{ scale: this.scaleAnim }] }]}
      >
        {this.renderTitle()}
        <View>
          {this.renderColumnBookList()}
          {this.renderRowBooksList()}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  columnContainer: {
    marginBottom: 12,
  },
  bookImg: {
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
    borderColors: FeedsTheme.SkinColor.N1_2,
    borderRadius: 2,
    borderWidth: 0.5,
  },
  picView: {
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
  },
  smallBookImg: {
    marginBottom: 6,
  },
  bookName: {
    fontSize: FeedsUIStyle.T2,
  },
  titleViewStyle: {
    height: 20,
    marginBottom: (IMAGE_HEIGHT - 20 - 36 - 16) / 2,
    flex: 0,
  },
  middleStyle: {
    marginTop: 0,
  },
  smallBookName: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
    marginBottom: 2,
  },
  bookScore: {
    fontSize: FeedsUIStyle.T1,
    fontFamily: 'PingFangSC-Semibold',
    fontWeight: 'bold',
    colors: FeedsTheme.SkinColor.N3,
  },
  smallBookScore: {
    lineHeight: FeedsLineHeight.T1,
  },
  listContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  rowBooksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 3,
  },
  item: {
    width: IMAGE_WIDTH,
    marginLeft: 13,
    marginRight: 13,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  textView: {
    height: IMAGE_HEIGHT,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  middleView: {
    flex: 1,
    flexGrouw: 2,
  },
});
