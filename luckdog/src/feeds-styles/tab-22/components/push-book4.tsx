/* eslint-disable no-loop-func */
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Animation,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsLineHeight, FeedsTheme } from './utils';
import FeedsIcon from '../../../framework/FeedsIcon';
import FeedsProtect from '../../../mixins/FeedsProtect';
import FeedsAbilities from '../../../framework/FeedsAbilities';

import { logError, strictExposeReporter } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { getWidthHeight } from '../../../framework/utils/device';
import { isTopTab, throttle, showToast } from '@/luckbox';
import { CommonProps } from '../../../entity';
import { BookCoverRadiusStyle } from '../../../types/card';
import { BookCover } from '../../../components/book-font-cover';

const windowWidth = getWidthHeight().width;
const imageWidthScale = 96 / 750;
const imageHeightScale = 128 / 96;
const imageMarginScale = 24 / 96;
const IMAGE_WIDTH = (windowWidth * imageWidthScale) + 2; // 适配手机展示书名的前4个字
const IMAGE_HEIGHT = IMAGE_WIDTH * imageHeightScale;
const IMAGE_MARGIN = IMAGE_WIDTH * imageMarginScale;
const maxLength = 21; // 我的书架卡片最多展示20本书，加上最后的添加本地书，最多展示21个书籍模块

interface Props extends CommonProps {
  slideEnable: boolean;
  books: any[];
  cardIndex: number;
  numberOfLines: number;
  iposition?: number;
  showSubTitle?: boolean;
  collectBookAnimaInfo?: any;

  doBeaconByClickLocal?: () => void;
}

@FeedsProtect.protect
export class PushBook4 extends React.Component<Props> {
  public shouldComponentUpdate = shouldComponentUpdate(this, 'PushBook4');
  public userInfo = this.props.globalConf || {};
  public hasRedHotExposured = false;
  public addBookIconExposured = false;

  // 推荐tab我的书架位移动画
  public showHiddenBookAnimation = new Animation({
    startValue: -(IMAGE_WIDTH + IMAGE_MARGIN),
    toValue: 0,
    duration: 300,
    delay: 0,
    mode: 'timing',
    timingFunction: 'ease_bezier',
  });
  // 推荐tab我的书架第一本书透明度动画
  public changeHiddenBookOpacity = new Animation({
    startValue: 0,
    toValue: 1,
    duration: 300,
    delay: 0,
    mode: 'timing',
    timingFunction: 'ease_bezier',
  });
  public BookShelfScrollView: any;

  // eslint-disable-next-line camelcase
  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.initCollectAnimation(nextProps);
  }

  public componentDidMount() {
    this.initCollectAnimation(this.props);
  }

  public componentWillUnMount() {
    this.showHiddenBookAnimation?.destroy();
    this.changeHiddenBookOpacity?.destroy();
  }

  /**
   * 接收到参数后初始化收藏动画
   */
  public initCollectAnimation = (curProps) => {
    const { collectBookAnimaInfo: { needCollectAnimation = false } = {} } = curProps || {};
    if (needCollectAnimation) {
      this.doCollectAnimation();
    }
  };

  /**
   * 执行收藏动画
   */
  public doCollectAnimation = () => {
    const { doAfterCollectAnimation, cancleCollectAnimation } = this.props.collectBookAnimaInfo || {};

    // 在动画结束时改变动画状态，执行回调函数
    this.showHiddenBookAnimation.onHippyAnimationEnd(() => {
      doAfterCollectAnimation?.();
      cancleCollectAnimation?.();
    });
    this.showHiddenBookAnimation.start();
    // 异步处理，不然ios无法显示透明度动画
    setTimeout(() => {
      this.changeHiddenBookOpacity.start();
    }, 0);
  };

  /** 获得需要展示的书籍的个数 */
  public getFinalBookLength = () => {
    const { slideEnable, books = [] } = this.props || {};
    return slideEnable ? books.length : 4;
  };

  /** 获取最后的书籍的index */
  public getEndIndex = () => {
    const finalBookLength = this.getFinalBookLength();
    return finalBookLength > maxLength ? maxLength : finalBookLength;
  };

  /** 判断是否是最后一个添加本地书的图标 */
  public isLastAdd = (index) => {
    const { books = [] } = this.props;
    if (!books || books.length === 0) return false;

    const lastItem = books[books.length - 1];
    const end = this.getEndIndex();

    if (index === end - 1) {
      if (lastItem.timeStamp && lastItem.timeStamp === '-1') {
        return true;
      }
    }

    return false;
  };

  /** 获取我的书架中的每一本书籍 */
  public renderCollectedBook = (book, index) => {
    const {
      collectBookAnimaInfo: { animationBook = '', needCollectAnimation = false } = {},
    } = this.props || {};
    // 需要展示的书籍的个数
    const finalBookLength = this.getFinalBookLength();
    // 如果是第一本需要展示动画的书籍设置动画
    const animationStyle = index === 0 && book.sBookId === animationBook && needCollectAnimation ? {
      opacity: this.changeHiddenBookOpacity,
    } : {};

    return (<View
      key={index}
      style={animationStyle}
      collapsable={false}
    >
      { this.renderBookBlock(book, index, finalBookLength)}
    </View>);
  };

  /**
   * 渲染书籍模块
   * @param {*} book 书籍信息
   * @param {Number} index 书籍的index
   * @param {NUmber} finalBookLength 所有书籍的数量
   */
  public renderBookBlock = (book, index, finalBookLength) => {
    const { slideEnable } = this.props || {};
    const imageMargin = slideEnable ? IMAGE_MARGIN : 0;
    return (
      <View
        style={[
          styles.item,
          { marginRight: index === finalBookLength - 1 ? 16 : imageMargin },
        ]}
        onClick={() => this.onClickBook(book, index)}
      >
        { this.renderBookContainer(book)}
      </View>
    );
  };

  /**
   * 渲染一本书的内容
   * @param {*} itemBean 卡片的itemBean
   * @param {*} book 书籍信息
   */
  public renderBookContainer = (book) => {
    const { sPicUrl, sBookId, stStatus } = book;
    const { sText, iColor } = stStatus || {};
    const { itemBean, showSubTitle = true, numberOfLines = 1 } = this.props || {};
    return (
      <View>
        <BookCover
          height={IMAGE_HEIGHT}
          width ={IMAGE_WIDTH}
          url={sPicUrl}
          bookID={sBookId}
          radius={BookCoverRadiusStyle.SMALL}
          sourceFrom={itemBean?.item_id}
          rightTag={{
            type: iColor,
            text: sText,
            offsetY: 3,
            offsetX: 3,
          }
          }
        />
        <Text style={styles.bookName} numberOfLines={numberOfLines}>
          {book.sTitle}
        </Text>
        {book.sAuthor && showSubTitle ? (
          <Text style={styles.bookDesc} numberOfLines={1}>
            {book.sAuthor}
          </Text>
        ) : null}
      </View>
    );
  };

  /** 获得添加本地书UI */
  public renderAddLocalBookBlock = (books, index) => {
    const { itemBean } = this.props;
    const { sPicUrl } = books[books.length - 1] || {};
    return (<View
      style={[
        styles.item,
        { marginRight: 24 },
      ]}
      onClick={this.onClickAddBook}
      key={index}
    >
      <Image
        style={styles.image}
        reportData={{ sourceFrom: itemBean?.item_id }}
        source={{ uri: sPicUrl || FeedsIcon.novel_default_cover }}
      />
    </View>);
  };

  /**
   * 获得小说Book的视图
   */
  public renderBookView = () => {
    const {
      parent = {},
      slideEnable,
      collectBookAnimaInfo: { needCollectAnimation = false } = {},
      books = [],
    } = this.props || {};

    const bookView: any[] = [];
    const start = 0;
    const end = this.getEndIndex();

    for (let i = start; i < end; i += 1) {
      const o = books[i];
      // 判断是否应该展示最后的添加本地书图片
      const isLastAdd = this.isLastAdd(i);

      // 书籍和添加本地书展示成不同形式
      if (o && !isLastAdd) {
        bookView.push(this.renderCollectedBook(o, i));
      } else if (o && isLastAdd && parent.mergeBook) {
        bookView.push(this.renderAddLocalBookBlock(books, i));
      }
    }
    const animationStyle = needCollectAnimation && !isTopTab() ? {
      transform: [{
        translateX: this.showHiddenBookAnimation,
      }],
    } : {};

    return (
      <View style={[animationStyle, !slideEnable ? {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
      } : styles.booksBlock]}>
        { bookView}
      </View>
    );
  };

  /** 点击书籍 */
  public onClickBook = (book, index) => {
    const { parent } = this.props || {};
    const beaconConfig = { ext_data1: index };

    // 是在线书，跳转到对应落地页
    if (book.sUrl) {
      parent.loadUrl(book.sUrl);
      this.props.doBeaconByClick?.({
        ...beaconConfig,
        book_id: book.sBookId,
        ext_data2: book.sUrl,
      });
      return false;
    }
    if (book.sBookId) {
      FeedsAbilities.openNovelLocalBook(book.sBookId);
      this.props.doBeaconByClick?.({
        ...beaconConfig,
        book_id: book.sBookId,
      });
      return false;
    }
  };

  /** 点击添加本地书 */
  public onClickAddBook = () => {
    const { parent = {} } = this.props;
    // 新增10.4.1后才有用否则提醒版本过低
    // 当 o.sUrl 和 o.sBookId 都为空，调用导入txt接口，安卓9.9支持
    FeedsAbilities.importNovelLocalBooks()
      .then(() => {
        this.BookShelfScrollView?.scrollTo({ x: 0, y: 0, animated: true });
        parent.mergeBook(); // 更新收藏卡片
        showToast('添加成功', 2000);
      })
      .catch(err => logError(err, 'PushBook4.onClickAddBook'));
    this.props.doBeaconByClickLocal?.();
  };

  public onScrollEndDrag = (e) => {
    const index = Math.floor(e.contentOffset.x / 80);
    this.props.doBeaconBySlide?.({ ext_data1: index });
  };

  public onScroll = (e) => {
    this.checkExpose(e.contentOffset.x);
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public checkExpose = throttle((left) => {
    strictExposeReporter.updateViewportLeft(this.props.cardIndex, left);
  }, 500);

  public render() {
    countReRender(this, 'PushBook4');
    const { slideEnable } = this.props || {};

    if (slideEnable) {
      return (
        <ScrollView
          contentContainerStyle={styles.imageContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
          sendMomentumEvents
          ref={(ref) => {
            this.BookShelfScrollView = ref;
          }}
          onScroll={this.onScroll}
          onScrollEndDrag={this.onScrollEndDrag}
          scrollEventThrottle={100}
        >
          {this.renderBookView()}
        </ScrollView>
      );
    }
    return <View style={styles.rowContainer}>{this.renderBookView()}</View>;
  }
}

const styles = StyleSheet.create({
  bookDesc: {
    colors: FeedsTheme.SkinColor.A3,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
  },
  bookName: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
    width: IMAGE_WIDTH,
    marginTop: 4,
  },
  image: {
    borderColors: FeedsTheme.SkinColor.D2,
    borderRadius: 6,
    borderWidth: 0.5,
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
  },
  imageContainer: {
    marginHorizontal: 16,
    overFlow: 'hidden',
  },
  item: {
    marginRight: IMAGE_MARGIN,
    width: IMAGE_WIDTH,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: FeedsUIStyle.FEED_ITEM_PADDING_SIDE,
  },
  booksBlock: {
    position: 'relative',
    flexDirection: 'row',
  },
});
