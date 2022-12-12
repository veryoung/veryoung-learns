/**
 * @Author: liquid
 * @Date:   2019年10月22日16:41:20
 * @Last modified by:   liquid
 * 支持txt的收藏卡片
 */

import React from 'react';
import { View, Platform, QBToastModule, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';
import { FeedsIcon, FeedsTheme, vectorToArray } from './components/utils';
import FeedsViewItem from '../FeedsViewItem';
import { Book4, Title, PushBook4 } from './components';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CommonCardStyle, FeedsUIStyle, colorDict, FeedsLineHeight } from '../../framework/FeedsConst';
import { strictExposeReporter, reportUDS, BusiKey, logError } from '@/luckdog';
import { getLocation, getSearchParams, isTopTab } from '@/luckbox';
import { emitter, events } from '../../utils/emitter';
import { bundleConfig } from '../../../package.json';
import { scale } from '../../components/animationStyle';
import FeedsUtils from '../../framework/FeedsUtils';
import { CommonProps, TabId } from '../../entity';
import { getTabList, getRedDotPresenter } from '@/presenters';
import { localBooksMerge } from '../../utils/localBooksMerge';
import { getUrlQueryParam } from '../../framework/Utils';
import { getWidthHeight } from '../../framework/utils/device';
import FeedsAbilities from '../../framework/FeedsAbilities';

const windowWidth = getWidthHeight().width;
const imageWidthScale = 96 / 750;
const imageHeightScale = 128 / 96;
const IMAGE_WIDTH = windowWidth * imageWidthScale;
const IMAGE_HEIGHT = IMAGE_WIDTH * imageHeightScale;
// 书籍标签的默认底色
const DEFAULT_TAG_COLOR = 4;
/**
  * 添加新的收藏书籍或移动原有收藏书籍到书籍列表的第一位
  * @param newBook 需要添加或移动的书籍
  * @param bookList 原收藏书籍列表
  */
const addOrUpdateCollectedBook = (newBook, bookList) => {
  if (!newBook) {
    return bookList;
  }
  const oldBookIndex = bookList?.findIndex(item => item.sBookId === newBook?.sBookId);
  if (oldBookIndex < 0) {
    return [newBook].concat(bookList);
  }
  bookList.splice(oldBookIndex, 1);
  return [newBook].concat(bookList);
};

/** 格式化书籍信息 */
const fmtCollectBookInfo = (bookInfo) => {
  const { picUrl = '', bookName = '', jumpUrl = '', resId = '' } = bookInfo || {};
  return {
    sUrl: jumpUrl,
    sBookId: resId,
    sTitle: bookName,
    sPicUrl: picUrl,
    timeStamp: Date.now(),
  };
};

/** 是否正在执行动画 */
let needCollectAnimation = false;
/** 需要进行动画的bookid */
let animationBook = '';
/** 执行动画之后的回调函数 */
let doAfterCollectAnimation;

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle417 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 417;
  }
  public lastTime;
  public clickTimer: any;
  public state = {
    list: [] as any[],
    isAnimationEnd: false, // 动画是否结束
    redPoint: 0, // 书架红点数
    updateShow: true, // 是否展示红点更新信息
  };
  public clickCount = 0;
  public scaleAnim = scale(200, 1.015); // 点击动画效果
  public traceid = '';
  public constructor(props) {
    super(props);
    this.mergeBook(props);
    if (!isTopTab()) {
      emitter.on(events.DO_COLLECT_ANIMATION, this.doCollectAnimation);
      emitter.on(events.CANCLE_COLLECT_ANIMATION, this.cancleCollectAnimation);
      getLocation().onChange(this.resetIsAnimationEnd);
    }
  }

  public async componentDidMount() {
    const reportInfo = FeedsUtils.getSafeProps(this.props, 'itemBean.report_info', []);
    reportInfo?.forEach(([key, value]) => {
      if (key === 'sTraceId') {
        this.traceid = value;
        return;
      }
    });
    this.scaleAnim.onHippyAnimationEnd(() => {
      // 执行跳转
      this.clickBlankJumpMore();
    });
    /** 设置红点 */
    const { updateNum } = await getRedDotPresenter().getRedDotConfig();
    this.setState({
      redPoint: updateNum,
    });
  }

  public componentWillUnmount() {
    this.scaleAnim?.destory();
    if (!isTopTab()) {
      emitter.off(events.DO_COLLECT_ANIMATION, this.doCollectAnimation);
      emitter.off(events.CANCLE_COLLECT_ANIMATION, this.cancleCollectAnimation);
      getLocation().removeChange(this.resetIsAnimationEnd);
    }
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
  public onClickTitle = () => {
    this.showVC();
    const { clickBlankJump = false } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    if (clickBlankJump) {
      reportUDS(BusiKey.CLICK__BLANK_TO_MORE, this.props, { traceid: this.traceid });
      this.scaleAnim.start();
    }
  };

  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.mergeBook(nextProps);
  }

  public mergeBook = async (props) => {
    const { vDetailData } = FeedsUtils.getSafeProps(props || this.props, 'itemBean.parsedObject', {});
    const books = vectorToArray(vDetailData);
    this.loadLocalBooks(books);
  };

  public loadLocalBooks = async (books) => {
    try {
      const { booksList } = await localBooksMerge(books);
      if (!isTopTab()) {
        this.filterAnimationBook(booksList);
      } else {
        this.setState({
          list: booksList,
        });
      }
    } catch (err) {
      logError(err, 'FeedsViewUIStyle417.loadLocalBooks');
    }
  };

  /** 过滤掉需要展示的收藏书籍
    *  如果需要展示动画，并且收藏书籍的bookid等于需要进行动画的bookid，则需要在我的书架里先隐藏这本书
    */
  public filterAnimationBook = (books) => {
    const { show_halfpop_book: showHalfpopBook = '', float_page_url: floatPageUrl = '' } = getSearchParams();
    animationBook = showHalfpopBook || getUrlQueryParam(floatPageUrl, 'bookid') || '';

    let realBooks = books;
    // 如果url没有需要动画的书籍id,就不作任何过滤
    if (animationBook !== '') {
      realBooks = (!this.state.isAnimationEnd && books.filter(item => item.sBookId !== animationBook)) || books;
    }
    this.setState({
      list: realBooks,
    });
  };

  /** 在地址改变时如果有指定参数重新将动画置为未完结 */
  public resetIsAnimationEnd = () => {
    if (getSearchParams().show_halfpop_book) {
      this.setState({
        isAnimationEnd: false,
      });
    }
  };

  /**
    * 执行收藏动画
    * @param {Function} callback 动画结束后的回调函数
    */
  public doCollectAnimation = (data: any) => {
    const [bookInfo, callback] = data;
    const book = fmtCollectBookInfo(bookInfo);
    needCollectAnimation = true;
    doAfterCollectAnimation = callback;
    // 更新展示书籍列表
    this.setState({
      list: addOrUpdateCollectedBook(book, this.state.list),
    });
  };

  /** 取消动画，改变动画状态 */
  public cancleCollectAnimation = () => {
    needCollectAnimation = false;
    this.setState({
      isAnimationEnd: true,
    });
  };

  public filterCanBeShow(books: any[] = []) {
    // 在ios端 没有收藏书books长度为0
    // 在安卓端 因为存在添加本地书 books长度1 则有本地收藏书
    if (Platform.OS === 'ios' ? books.length <= 0 : books.length <= 1) {
      return false;
    }
    return true;
  }

  public doBeaconByClickAll = () => {
    // 上报点击全部事件
    reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, this.props);
  };

  public doBeaconByClick = (data = {}) => {
    // 上报点击事件
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, data);
  };

  public doBeaconBySlide = (moreData = {}) => {
    // 上报滑动事件
    reportUDS(BusiKey.SLIDE__CARD, this.props, moreData);
  };

  public doBeaconByClickLocal = () => {
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, { bigdata_contentid: '' });
  };

  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /** 展示当前版本号 */
  public showVC = () => {
    if (this.clickCount === 0) {
      this.lastTime = new Date().getTime();
    }
    const currentTime = new Date().getTime();
    // 计算两次相连的点击时间间隔
    this.clickCount = currentTime - this.lastTime < 800 ? this.clickCount + 1 : 0;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => {
      clearTimeout(this.clickTimer);
      // 处理点击事件
      if (this.clickCount >= 4) {
        QBToastModule.show(bundleConfig.RUA, '', 1000);
      }
    }, 100);
  };

  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  /** 底部tab固定跳往书架,顶部tab通过地址跳转 */
  public goBookShelf = () => {
    const { redPoint } = this.state;
    const { itemBean = {}, parent } = this.props;
    const { parsedObject = {} } = itemBean;
    const titleRight = vectorToArray(parsedObject.vTextLink)[0];
    this.doBeaconByClickAll();
    /** 是否支持新tag样式 */
    const isSupportNewTag = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject.stPushData.bIsPushItem', false);
    if (isSupportNewTag && redPoint > 0) {
      /** 取消红点 */
      getRedDotPresenter().cancelRedDot();
      this.setState({
        redPoint: 0,
        updateShow: false,
      });
    }
    if (isTopTab()) {
      this.loadUrl?.(titleRight?.sUrl);
      return;
    }
    const tabList = getTabList();
    const tabIndex = tabList.findIndex(i => i.tabId === TabId.SHELF);
    parent?.parent?.setPageIndexView(tabIndex); // parent?.parent 是指的HomePage
  };

  /** 单本书跳往阅读器 */
  public goRead = (book) => {
    const { redPoint } = this.state;
    /** 取消红点 */
    if (redPoint > 0) {
      getRedDotPresenter().cancelRedDot();
      this.setState({
        redPoint: 0,
        updateShow: false,
      });
    }

    const { sUrl, sBookId } = book || {};

    if (sUrl) {
      // 网络书
      this.loadUrl?.(sUrl);
    } else if (sBookId) {
      // 本地书
      FeedsAbilities.openNovelLocalBook(sBookId);
    }

    this.doBeaconByClick({ book_id: sBookId, ext_data1: 0 });
  };

  public render() {
    const { list } = this.state;
    const shouldShowBooks = this.filterCanBeShow(list);
    /** 是否支持新tag样式 */
    if (!shouldShowBooks || list.length === 0) return null;
    /** 是否支持新tag样式 */
    const isSupportNewTag = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject.stPushData.bIsPushItem', false);
    return (
      <View
        style={{ transform: [{ scale: this.scaleAnim }] }}
        collapsable={false}
        onLayout={this.onLayout}
      >
        <View
          style={{
            ...((!isTopTab() || isSupportNewTag) && CommonCardStyle),
          }}
        >
          {
            this.rendeContent(isSupportNewTag)
          }
        </View>
      </View>
    );
  }

  /** 渲染内容主体 */
  private rendeContent = (isSupportNewTag) => {
    const { itemBean = {}, index: cardIndex } = this.props;
    const { parsedObject = {}, title } = itemBean;
    const { bSlidable = false, vTextLink = {} } = parsedObject;
    const { list } = this.state;
    if (isSupportNewTag) {
      return this.renderPushBookContent(list);
    }
    const books = list;
    const titleRight = vectorToArray(vTextLink)[0];
    return <View collapsable={false}>
      <View collapsable={false} onClick={this.onClickTitle}>
        <Title
          title={title}
          onLayout={this.onTitleLayout}
          right={titleRight}
          changeable={false}
          parent={this}
          showDot={
            books.slice(0, 4).every(o => !o.sUpdatedNumber || o.sUpdatedNumber === '0')
            && books.slice(4).some(o => o.sUpdatedNumber && o.sUpdatedNumber !== '0')
          }
          titleStyle={styles.titleStyle}
          doBeaconByClick={this.doBeaconByClickAll}
          rightClick={this.goBookShelf}
          noExposeAddition={true}
        />
      </View>
      <Book4
        books={books}
        cardIndex={cardIndex}
        parent={this}
        itemBean={itemBean}
        slideEnable={bSlidable}
        numberOfLines={1}
        showSubTitle={false}
        doBeaconByClick={this.doBeaconByClick}
        doBeaconBySlide={this.doBeaconBySlide}
        doBeaconByClickLocal={this.doBeaconByClickLocal}
        collectBookAnimaInfo={{
          animationBook,
          needCollectAnimation,
          doAfterCollectAnimation,
          cancleCollectAnimation: this.cancleCollectAnimation,
        }}
      />
    </View>;
  };

  private renderPushBookContent = (list) => {
    const { itemBean = {} } = this.props;
    // 安卓因为有添加本地书元素,只有一本书时实际上有两个元素
    const singleLength = Platform.OS === 'ios' ? 1 : 2;
    if (list.length === singleLength) {
      return this.renderSingleContent(itemBean);
    }
    return this.renderContent();
  };


  /** 渲染多本书内容 */
  private renderContent = () => {
    const { list, redPoint, updateShow } = this.state;
    const { itemBean = {}, index: cardIndex } = this.props;
    const { parsedObject = {} } = itemBean;
    const { bSlidable = false } = parsedObject;
    return <View
      style={[styles.container, {
        marginHorizontal: 0,
      }]}
    >
      <View
        style={{ flex: 1 }}
      >
        <PushBook4
          books={list}
          cardIndex={cardIndex}
          parent={this}
          itemBean={itemBean}
          slideEnable={bSlidable}
          numberOfLines={1}
          showSubTitle={false}
          doBeaconByClick={this.doBeaconByClick}
          doBeaconBySlide={this.doBeaconBySlide}
          doBeaconByClickLocal={this.doBeaconByClickLocal}
          collectBookAnimaInfo={{
            animationBook,
            needCollectAnimation,
            doAfterCollectAnimation,
            cancleCollectAnimation: this.cancleCollectAnimation,
          }}
        />
      </View>
      <View
        style={styles.moreContent}
        onClick={this.goBookShelf}
      >
        <View
          style={styles.shadowBox}
        >
          <Image
            style={[
              styles.shadow,
            ]}
            source={{ uri: FeedsIcon.pushBlock }}
            noPicMode={{ enable: false }}
            nightMode={{ enable: false }}
          />
        </View>
        {
          redPoint >= 1 && updateShow ?
            <View style={styles.contentBox}>
              <View style={styles.updateDot}>
                <Text style={styles.updateNum} >{redPoint}</Text>
              </View>
              <Text style={[styles.updateText, {
                colors: FeedsTheme.SkinColor.B3,
              }]}>本更新</Text>
              <Image
                source={{ uri: FeedsIcon.novel_card_arrow }}
                style={[styles.arrow, {
                  tintColors: FeedsTheme.SkinColor.B3,
                }]}
                noPicMode={{ enable: false }}
              />
            </View> :
            <View style={styles.contentBox}>
              <Text style={[styles.updateText, { colors: FeedsTheme.SkinColor.N1 }]}>书架</Text>
              <Image
                source={{ uri: FeedsIcon.novel_card_arrow }}
                style={[styles.arrow, { tintColors: FeedsTheme.SkinColor.N1 }]}
                noPicMode={{ enable: false }}
              />
            </View>
        }
      </View>
    </View>;
  };
  /** 渲染一本书情况下内容 */
  private renderSingleContent = (itemBean) => {
    const { list, redPoint, updateShow } = this.state;
    const book = list[0];
    const { sTitle, stStatus, sPicUrl, sUpdateTips = '' } = book;
    return <View
      style={styles.container}
      onClick={() => this.goRead(book)}
    >
      <View
        style={styles.bookPic}
      >
        <Image
          style={styles.image}
          reportData={{ sourceFrom: itemBean?.item_id }}
          source={{ uri: sPicUrl || FeedsIcon.novel_default_cover }}
        />
        {
          stStatus && this.renderTagView(stStatus)
        }
      </View>
      <View
        style={styles.singleContent}
      >
        <View style={styles.bookInfo}>
          <Text numberOfLines={1} style={styles.bookTitle}>{sTitle}</Text>
          <Text numberOfLines={1} style={styles.bookUpdate}>{sUpdateTips}</Text>
        </View>
        {
          redPoint >= 1 && updateShow ?
            <View style={styles.contentBox}>
              <View style={[styles.updateDot]}>
                <Text style={styles.updateNum} >{redPoint}</Text>
              </View>
              <Text style={[styles.updateText, {
                colors: FeedsTheme.SkinColor.B3,
              }]}>本更新</Text>
              <Image
                source={{ uri: FeedsIcon.novel_card_arrow }}
                style={[styles.arrow, {
                  tintColors: FeedsTheme.SkinColor.B3,
                }]}
                noPicMode={{ enable: false }}
              />
            </View> :
            <View
              style={styles.btn}
            >
              <Text style={styles.btnText}>立即阅读</Text>
            </View>
        }
      </View>
    </View>;
  };

  /** 渲染书籍左上角标签  */
  private renderTagView = (icon) => {
    const { sText = '', iColor } = icon || {};
    if (!sText) {
      return null;
    }
    return (
      <View style={[
        styles.tagBlock,
        { backgroundColors: colorDict[iColor] || colorDict[DEFAULT_TAG_COLOR] },
      ]}>
        <Text style={styles.tagText} numberOfLines={1}>
          {sText}
        </Text>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  titleStyle: {
    paddingBottom: FeedsUIStyle.SMALL,
  },
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  bookPic: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    borderColors: FeedsTheme.SkinColor.D2,
    borderRadius: 6,
    borderWidth: 0.5,
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
  },
  singleContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  moreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  arrow: {
    height: 9,
    width: 5,
    marginLeft: 4,
  },
  contentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateDot: {
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    fontSize: FeedsUIStyle.T2,
    backgroundColors: FeedsTheme.SkinColor.B3,
    marginRight: 4,
  },
  updateNum: {
    colors: FeedsTheme.SkinColor.D2_1,
    fontSize: FeedsUIStyle.SMALL_2,
    marginHorizontal: 4,
  },
  updateText: {
    fontSize: FeedsUIStyle.T2,
  },
  bookInfo: {
    flex: 1,
    paddingRight: 16,
  },
  bookUpdate: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1,
    opacity: 0.6,
    height: FeedsLineHeight.T0,
    lineHeight: FeedsLineHeight.T0,
  },
  bookTitle: {
    fontSize: FeedsUIStyle.T2,
    marginBottom: 4,
    colors: FeedsTheme.SkinColor.N1,
    height: FeedsLineHeight.T2_5,
    lineHeight: FeedsLineHeight.T2_5,
  },
  tagBlock: {
    position: 'absolute',
    top: 3,
    right: 3,
    borderRadius: 3,
    paddingHorizontal: 3,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    marginVertical: 1,
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.SMALL_2,
  },
  shadowBox: {
    position: 'absolute',
    left: -6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    width: 6,
    height: 120,
    tintColors: ['black', '#202429'],
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
    backgroundColors: FeedsTheme.SkinColor.N2,
    borderRadius: 14,
  },
  btnText: {
    height: 28,
    lineHeight: 28,
    paddingHorizontal: 12,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1,
  },
});

