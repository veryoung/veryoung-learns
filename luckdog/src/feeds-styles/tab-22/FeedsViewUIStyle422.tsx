/* eslint-disable no-unused-vars */
/**
 * @Author: veryoungwan
 * 我的书架
 */

import React from 'react';
import { View, Text, Image, Platform, QBToastModule, StyleSheet } from '@tencent/hippy-react-qb';
import {
  vectorToArray,
  FeedsTheme,
  FeedsIcon,
  FeedsUIStyle,
  FeedsLineHeight,
  ConstantUtils,
} from './components/utils';
import FeedsUtils from '../../framework/FeedsUtils';
import FeedsViewItem from '../FeedsViewItem';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, strictExposeReporter, BusiKey, addKeylink, logError } from '@/luckdog';
import FeedsAbilities from '../../framework/FeedsAbilities';
import FeedsEventEmitter from '../../framework/FeedsEventEmitter';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsConst, { BigBookCoverLeftTagStyle, fetchUrlList } from '../../framework/FeedsConst';
import { bundleConfig } from '../../../package.json';
import { CommonProps } from '../../entity';
import { localBooksMerge } from '../../utils/localBooksMerge';
import { isCacheBook } from '../../utils/bookCache';
import { PushBook } from './components/push-book';
import { MTT } from '@tencent/luckbox-hippyjce-homepage';
import { Tag } from '../../components/tag';
import { getDeviceVisitor } from '@/luckbox';
import { BookCoverRadiusStyle } from '../../types/card';
import { BookCover } from '../../components/book-font-cover';

const editUrl = FeedsIcon.novel_422_editUrl;
const unEditUrl = FeedsIcon.novel_422_unEditUrl;
const SCREEN_WIDTH = ConstantUtils.getScreenWidth();

const WRAP_MARGIN = 16;
const bookRatio = 750 / 160;
const IMAGE_WIDTH = SCREEN_WIDTH / bookRatio;
const IMAGE_HEIGHT = (IMAGE_WIDTH / 160) * 214;
const IMAGE_MARGIN = 8;

const smallBookRatio = 750 / 68;
const SMALL_IMAGE_WIDTH = SCREEN_WIDTH / smallBookRatio;
const SMALL_IMAGE_HEIGHT = (SMALL_IMAGE_WIDTH / 68) * 88;
const addTextUrl = 'https://today.imtt.qq.com/novelsingtab/422/addtxtimg.png';
const TAG = 'UIStyle422';

/** 书籍容器宽度 */
const CONTAINER_WIDTH = SCREEN_WIDTH - 32;

const isAdr = FeedsUtils.isAndroid();

const staticBooks = {
  sPicUrl: '',
  sTitle: '',
  sUrl: '',
  sAuthor: '',
  sBookId: 0,
  sUpdatedNumber: '',
  inFolder: false,
  timeStamp: '-1',
  _classname: 'MTT.HomepageBookInfo',
};

interface Props extends CommonProps {
  isEdit: boolean;
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle422 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 422;
  }
  public BookShelfScrollView: any;
  public flag;
  public clickCount = 0;
  public lastClickTime = 0;
  public clickTimer;
  public previousDeleteModal = false;
  public info = '';
  /** 内容区域宽度 */
  public contentWidth = 0;
  public state = {
    list: [] as any[],
    selected: [] as any[],
    isEdit: this.props.isEdit || false,
    bookCount: 0,
    message: '',
  };
  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle422');

  // eslint-disable-next-line class-methods-use-this
  public UNSAFE_componentWillMount() {
    Image.prefetch(editUrl);
    Image.prefetch(unEditUrl);
    Image.prefetch(addTextUrl);
    Image.prefetch(FeedsIcon.isCacheBook);
    this.mergeBook(this.props);
  }

  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.mergeBook(nextProps);
  }

  public unique = (arr) => {
    const res: any[] = [];
    const obj = {};
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].sBookId]) {
        obj[arr[i].sBookId] = 1;
        res.push(arr[i]);
      }
    }
    return res;
  };

  public mergeBook = (props?: any) => {
    const { itemBean = {} } = props || this.props;
    const { parsedObject = {} } = itemBean;
    const { bIsShouldBeMerge = false, vDetailData = {}, bPageEnd, vCollectData = {} } = parsedObject;
    let books: any[] = [];
    const data = vectorToArray(vDetailData);
    if (bIsShouldBeMerge) {
      let newBooks = [];
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < data.length; i++) {
        newBooks = [].concat(newBooks, data[i]);
      }
      books = newBooks;
    } else {
      books = JSON.parse(JSON.stringify(data));
    }
    // 加入藏书页面
    const collectBooks = vectorToArray(vCollectData);
    if (collectBooks.length > 0 && bPageEnd) {
      books.push({
        sBookId: '0',
        vCollectBooks: collectBooks,
        timeStamp: '0',
      });
    }
    // 当前版本大于10.4.1的时候才有本地书功能
    this.loadLocalBooks(books, props);
  };

  public loadLocalBooks = async (books, props) => {
    const { itemBean = {}, parent } = props || this.props;
    const { isEdit, state } = parent;
    const { deleteModal, deleteCancel } = state || {};
    const { parsedObject = {} } = itemBean;
    const { iBookshelfTotal = 0 } = parsedObject;

    // 加入添加书籍页面
    books.push({
      sBookId: '-1',
      isAddBooks: true,
      timeStamp: '0',
    });
    try {
      const { booksList, localBookLength } = await localBooksMerge(books);
      const bookCount = iBookshelfTotal + localBookLength || 0;
      if (!deleteCancel && !deleteModal) {
        if (!isEdit) {
          parent.NOVEL_422_SELECTED = [];
          this.setState({
            list: booksList,
            selected: [],
            bookCount,
          });
        } else {
          this.setState({
            list: booksList,
            bookCount,
          });
        }
      } else {
        this.setState({
          list: booksList,
          bookCount,
        });
      }
    } catch (err) {
      logError(err, 'FeedsViewUIStyle422.loadLocalBooks');
    }
  };

  /** 跳转到我的藏书页 **/
  public loadCollectUrl = (url) => {
    const { itemBean = {}, parent } = this.props;
    const { isEdit } = parent.state;
    if (isEdit) return;
    reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_COLLECT_DETAIL, this.props);
    FeedsUtils.doLoadUrl(url, itemBean.tab_id, false, itemBean);
  };

  public onBookItemLayout = (event, bookIndex, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public onTitleLayout = (event) => {
    this.contentWidth = event?.layout?.width;
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /**
  * 获得小说Book的视图
  */
  public getBookView = () => {
    const { index } = this.props || {};
    const { list } = this.state;
    const books = this.unique(list);
    const number = 3 - (books.length % 3);
    if (number < 3) {
      for (let i = 0; i < number; i++) {
        books.push(staticBooks);
      }
    }

    const bookIds = books.filter(book => !(book.vCollectBooks || book.isAddBooks));
    // 如果有 bookId 为空，说明没有 ready
    const bookIdsReady = !bookIds.some(book => !book.sBookId);
    if (bookIdsReady) {
      strictExposeReporter.updateBookIds(
        index,
        0,
        bookIds.map(book => book.sBookId),
      );
    }
    return books.reduce((acc, book: MTT.HomepageBookShelfInfo, index) => {
      if (!book) {
        return [...acc, <View key={index} style={styles.item} />];
      }
      const { sUpdatedNumber, sBookId, stStatus } = book;
      // 是否支持右上角标
      const isSupportTab = !!stStatus?.sText;
      let updatedNumber = '';
      if (sUpdatedNumber && sUpdatedNumber !== '0') {
        if (Number.parseInt(sUpdatedNumber, 10) >= 100) {
          updatedNumber = '99+';
        } else {
          updatedNumber = `${sUpdatedNumber}`;
        }
      }
      return [...acc, <View
        key={`${sBookId}-${index}`}
        collapsable={false}
        onLayout={event => ![0, -1].includes(parseInt(sBookId, 10)) && this.onBookItemLayout(event, index, sBookId)}
      >
        {this.getBookItemView(book, index)}
        {updatedNumber && !isSupportTab ? (
          <View
            key={`${sBookId}-${index}-updatedNumber`}
            style={[styles.updatedNumContainer, styles.tagRedBright]}
          >
            <Text style={[styles.updatedNum, styles.tagRedBright]}>{updatedNumber}</Text>
          </View>
        ) : null}
      </View>];
    }, []);
  };

  public makeClickHandle = (o, start) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const { parent } = this.props || {};
    const { isEdit } = parent.state;
    const isReallyBooks = this.isReallyBooks(o);

    let clickHandle;
    if (o.sUrl) {
      clickHandle = () => {
        if (!isEdit) {
          reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_BOOKLIST, this.props, {
            ext_data1: start,
            book_id: o.sBookId || encodeURIComponent(o.sUrl),
            bigdata_contentid: '',
          });
          this.loadUrl(o.sUrl);
        } else {
          this.handleBookClick(o, start);
        }
      }; // 解决闭包引用自增start的bug
    } else if (o.sBookId) {
      clickHandle = () => {
        if (!isEdit) {
          if (!isReallyBooks) return;
          reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_BOOKLIST, this.props, {
            ext_data1: start,
            book_id: o.sBookId,
            bigdata_contentid: '',
            ext_data2: 'local',
          });
          // 解决闭包引用自增start的bug
          FeedsAbilities.openNovelLocalBook(o.sBookId);
        } else {
          this.handleBookClick(o, start);
        }
      };
    } else {
      // 当 o.sUrl 和 o.sBookId 都为空，调用导入txt接口，安卓9.9支持
      clickHandle = () => {
        if (!isReallyBooks) return;
        FeedsAbilities.importNovelLocalBooks()
          .then(() => {
            that.BookShelfScrollView?.scrollTo({ x: 0, y: 0, animated: true });
            this.mergeBook(); // 更新收藏卡片
            QBToastModule.show('添加成功', '', 2000);
          })
          .catch(err => logError(err, 'FeedsViewUIStyle422'));
      };
    }

    return clickHandle;
  };

  /** 不需要现实阅读进度 */
  public readProgress = (book, isReallyBooks) => {
    const { sBookId, bookType, iLastReadSerialID, iChapterNum } = book;
    return (
      isNaN(sBookId)
       || !isReallyBooks
       || (bookType && bookType === 'txt')
       || iLastReadSerialID === -1
       || iChapterNum === -1
    );
  };

  /** 是否是真的书 */
  public isReallyBooks = (book) => {
    const { sBookId } = book;
    return parseInt(sBookId, 10) !== 0 && parseInt(sBookId, 10) !== -1; // 书籍id为0 和 -1都是手动添加的
  };

  /** 藏书卡片 */
  public renderCollect = (book) => {
    const { vCollectBooks } = book;
    const { itemBean = {} } = this.props || {};
    const { parsedObject = {} } = itemBean;
    const { iCollectTotal, sCollectDataUrl, bCollectUpdated, vPushBook } = parsedObject;
    return <>
      <View
        style={[styles.item, { marginRight: IMAGE_MARGIN }]}
        onClick={() => this.loadCollectUrl(sCollectDataUrl)}
      >
        <View style={styles.collectBooks}>
          {bCollectUpdated && vPushBook ? this.renderRightTag({ sText: '更新', iColor: 4 }) : null}
          {vCollectBooks.map(i => (
            <Image
              key={i.sUrl}
              style={styles.collectBooksPic}
              reportData={{ sourceFrom: itemBean.item_id }}
              source={{ uri: i.sPicUrl }}
            />
          ))}
        </View>
        <Text style={styles.bookName} numberOfLines={1}>
             我的藏书
        </Text>
        <Text style={styles.readHistory} numberOfLines={1}>
          {`共${iCollectTotal || 0}本`}
        </Text>
      </View>
      {bCollectUpdated && !vPushBook ? <View style={styles.littleRedDot}></View> : null}
    </>;
  };

  /** 加书卡片 */
  public renderAddBook = () => (
    <View style={[styles.item, { marginRight: IMAGE_MARGIN }]} onClick={this.handleGoBookshelf}>
      {isAdr ? (
        <View style={styles.androidAddBooks}>
          <Image style={styles.adrAddPic} source={{ uri: addTextUrl }} />
        </View>
      ) : (
        <View style={styles.iosAddBooks}>
          <Image style={styles.addPic} source={{ uri: FeedsIcon.novel_422_add }} />
        </View>
      )}
    </View>
  );

  /** 书封 */
  public renderBookCover = (book) => {
    const isReallyBooks = this.isReallyBooks(book);
    if (!isReallyBooks) return null;
    const { sPicUrl, sBookId, stStatus = {}, stIcon = {} } = book;
    const { iColor, sText = 0 } = stStatus;
    const { itemBean = {} } = this.props || {};
    const leftTag = FeedsUtils.getLeftTagStyle(stIcon, BigBookCoverLeftTagStyle);
    return <View style={[styles.imgWrap, {
      ...getDeviceVisitor().isAdr() && {
        overflow: 'hidden',
      },
    }]}>
      <BookCover
        height={IMAGE_HEIGHT}
        width ={IMAGE_WIDTH}
        url={sPicUrl}
        bookID={sBookId}
        radius={BookCoverRadiusStyle.BIG}
        sourceFrom={itemBean?.item_id}
        rightTag={{
          type: iColor,
          text: sText,
          offsetY: 4,
          offsetX: 4,
        }}
        leftTag={leftTag}
      />
    </View>;
  };


  /** 绘制右上角 */
  public renderRightTag = tag => <View
    style={styles.tag}
  >
    <Tag
      icon={tag}
    />
  </View>;


  /** 获取书的渲染元素 */
  public getBookItemView = (book, start) => {
    const { sBookId, sTitle, vCollectBooks, isAddBooks } = book;
    const { itemBean = {}, parent } = this.props || {};
    const { isEdit } = parent.state;
    const isShowEdit = !!isEdit;
    const { selected } = this.state;
    const isReallyBooks = this.isReallyBooks(book);
    const clickHandle = this.makeClickHandle(book, start);
    let uri = unEditUrl;
    let selectBg = { backgroundColor: 'transparent' };
    if (isShowEdit && sBookId) {
      const index = selected.indexOf(sBookId);
      uri = index < 0 ? unEditUrl : editUrl;
      selectBg = index < 0 ? { backgroundColor: 'transparent' } : { backgroundColor: 'rgba(0,0,0,0.50)' };
    }
    // 是否是需要显示藏书卡片
    if (vCollectBooks && vCollectBooks.length > 0) {
      return this.renderCollect(book);
    }
    // 是否需要显示加书卡片
    if (isAddBooks) {
      return this.renderAddBook();
    }
    // 判断是否是缓存书
    const cacheBook = isCacheBook(sBookId);
    return (
      <View
        style={[styles.item, { marginRight: IMAGE_MARGIN }]}
        onClick={clickHandle}
        onPressIn={this.handleTouchStart}
        onPressOut={this.handleTouchEnd}
        key={sBookId}
      >
        {
          this.renderBookCover(book)
        }
        {isShowEdit && isReallyBooks ? (
          <View style={[styles.selectedWrap, selectBg]}>
            <Image
              style={styles.selectedPic}
              reportData={{ sourceFrom: itemBean.item_id }}
              source={{ uri }}
              key={sBookId}
            />
          </View>
        ) : null}
        <View style={
          styles.bookNameWarp
        }>
          {
            cacheBook
              ? <Image
                style={styles.cacheBookPic}
                reportData={{ sourceFrom: itemBean.item_id }}
                source={{ uri: FeedsIcon.isCacheBook }}
              /> : null
          }
          <Text style={styles.bookName} numberOfLines={2}>
            {`${cacheBook ? '      ' : ''}${sTitle}`}
          </Text>
        </View>
        {
          this.renderReadProgress(book)
        }
      </View>
    );
  };

  public handleGoBookshelf = () => {
    const { parent } = this.props;
    const { isEdit } = parent.state;
    if (isEdit) return;
    if (isAdr) {
      this.handleLoadLocalBook();
    } else {
      this.handleGoTab();
    }
  };

  public handleClick = (books?: number, collect?: number) => {
    if (books === 0 && collect === 0) return;
    const { parent } = this.props;
    parent?.handleEdit();
  };

  public handleBookClick = (o, start) => {
    const { sBookId } = o;
    const { selected } = this.state;
    const { parent } = this.props;
    // 判断数组是否已经有某值 如果没有则加入 有则删除
    const data = JSON.parse(JSON.stringify(selected));
    const index = data.indexOf(sBookId);
    if (index < 0) {
      data.push(sBookId);
      this.setState({
        selected: data,
      });
      reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_EDIT_ON, this.props, {
        ext_data1: start,
        book_id: sBookId,
        bigdata_contentid: '',
      });
    } else {
      data.splice(index, 1);
      this.setState({
        selected: data,
      });
    }
    parent.NOVEL_422_SELECTED = data;
  };

  /** 前往阅读记录 */
  public handleGoHistory = (url) => {
    if (!url) return;
    addKeylink('前往阅读记录', TAG);
    reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_READ_HISTORY, this.props);
    this.loadUrl(url);
  };

  /** 新增本地书 */
  public handleLoadLocalBook = () => {
    const { itemBean = {}, parent } = this.props;
    addKeylink('新增本地书', TAG);
    FeedsAbilities.importNovelLocalBooks()
      .then(() => {
        QBToastModule.show('添加成功', '', 2000);
        FeedsEventEmitter.sendEventToList(itemBean.symbolKey, FeedsEventEmitter.event.refresh, {
          message: '添加成功',
        });
        parent.refresh?.();
      })
      .catch(err => logError(err, 'FeedsViewUIStyle422'));
  };


  public handleTouchStart = () => {
    /**
      * 设置定时器 这里需要判断一下 不然多指触摸会触发多个定时器
      */
    if (!this.flag) {
      this.flag = setInterval(this.longPress, 500);
    }
  };

  public handleTouchEnd = () => {
    // 这里执行点击的操作，长按和点击互不影响
    if (this.flag) {
      clearInterval(this.flag);
      this.flag = 0;
    }
  };

  public longPress = () => {
    reportUDS(BusiKey.CLICK__BOOK_SHELF_TAB_LONG_PRESS_EDIT, this.props);
    this.handleClick();
  };

  public goWelfareTime = (url) => {
    const { itemBean = {} } = this.props;
    reportUDS(BusiKey.CLICK__WELFARE_BUBBLE_TIME_ICON, this.props);
    FeedsUtils.doLoadUrl(url, itemBean.tab_id, false, itemBean);
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle422');
    const { itemBean = {}, parent } = this.props;
    const { isEdit } = parent.state;
    const { bookCount } = this.state;
    parent.NOVEL_422_ITEMBEAN = itemBean;
    parent.NOVEL_422_CLICKITEM = this.handleClick;
    const { parsedObject = {} } = itemBean;
    const { sHistoryUrl = '', iPerPageNum = 12, sCurBookID = '', iCollectTotal = 0 } = parsedObject;
    if (sCurBookID === '') {
      parent.mViewModel.deleteExtParam('CUR_BOOK_ID');
      parent.mViewModel.deleteExtParam('PAGE_NUM');
    } else {
      parent.mViewModel.setExtParams('CUR_BOOK_ID', sCurBookID);
      parent.mViewModel.setExtParams('PAGE_NUM', iPerPageNum);
    }
    let bookView: any[] = [];

    bookView = this.getBookView();
    const text = !isEdit ? '编辑' : '取消';
    // 福利中心数据
    const welfareInfo = FeedsConst.getGlobalConfKV('welfareTime') || {};
    const { url = '', time = 0 } = welfareInfo;
    const readTime = Math.floor(time / 60);
    const hasWelfareData = url === '';
    return (
      <View style={styles.container} onPressIn={this.handleTouchStart} onPressOut={this.handleTouchEnd}>
        <View style={styles.titleWarp} onLayout={this.onTitleLayout} onClick={this.showVC}>
          <View>
            {hasWelfareData || readTime === 0 ? (
              <Text style={styles.font}>{`已加入${bookCount}本书`}</Text>
            ) : (
              <View style={styles.welfareTimeWarp} onClick={() => this.goWelfareTime(url)}>
                <Image
                  style={styles.welfareTimeIcon}
                  reportData={{ sourceFrom: itemBean.item_id }}
                  source={{ uri: fetchUrlList.bg.timeIcon }}
                />
                <Text style={styles.welfareTimeFont}>{`今日已读${readTime}分钟`}</Text>
              </View>
            )}
          </View>
          <View style={styles.textWarp} onClick={() => this.handleGoHistory(sHistoryUrl)}>
            <Text
              style={[
                styles.font,
                {
                  paddingRight: 12,
                },
              ]}
            >
               阅读记录
            </Text>
            <Text style={styles.split}>|</Text>
            <Text
              className="edit"
              style={[
                styles.font,
                {
                  paddingLeft: 12,
                  opacity: bookCount === 0 && iCollectTotal === 0 ? 0.4 : 1,
                },
              ]}
              onClick={() => this.handleClick(bookCount, iCollectTotal)}
            >
              {text}
            </Text>
          </View>
        </View>
        {
          this.renderPushBook()
        }
        {bookCount === 0 && iCollectTotal === 0 ? (
          this.showEmptyBookshelf()
        ) : (
          <View
            style={[
              {
                width: CONTAINER_WIDTH,
              },
              styles.booksWarp,
            ]}
          >
            {bookView}
          </View>
        )}
      </View>
    );
  }

  /** 展示版本号 */
  private showVC = () => {
    if (this.clickCount === 0) {
      this.lastClickTime = new Date().getTime();
    }
    const currentTime = new Date().getTime();
    // 计算两次相连的点击时间间隔
    this.clickCount = currentTime - this.lastClickTime < 800 ? this.clickCount + 1 : 0;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    this.clickTimer = setTimeout(() => {
      clearTimeout(this.clickTimer);
      // 处理点击事件
      if (this.clickCount >= 4) {
        QBToastModule.show(bundleConfig.RUA, '', 1000);
      }
    }, 100);
  };

  /** 展示空书籍 */
  private showEmptyBookshelf = () => {
    const { itemBean = {} } = this.props;
    const uri = 'https://today.imtt.qq.com/novelsingletab/noBookShelf.png';
    let isCanShowLocalLoad = true;
    if (Platform.OS === 'ios') {
      isCanShowLocalLoad = false;
    }
    return (
      <View style={styles.EmptyBookWarp}>
        <Image style={styles.EmptyBookImg} reportData={{ sourceFrom: itemBean.item_id }} source={{ uri }} />
        <View style={styles.EmptyBookTips}>书架上暂无书籍</View>
        <View style={styles.EmptyBookAddBook} onClick={this.handleGoTab}>
          <Text>添加免费小说</Text>
        </View>
        {isCanShowLocalLoad ? (
          <View style={styles.EmptyBookAddLocal} onClick={this.handleLoadLocalBook}>
             添加本地书籍
          </View>
        ) : (
          false
        )}
      </View>
    );
  };

  /** 前往推荐tab */
  private handleGoTab = () => {
    const { parent = {} } = this.props;
    const FeedsHomePage = parent.parent || {};
    FeedsHomePage?.setPageIndexView(1);
  };

  /** 阅读进度 */
  private renderReadProgress = (book) => {
    const { iLastReadSerialID, iChapterNum, sReadProgress = '' } = book;
    const isReallyBooks = this.isReallyBooks(book);
    const noShowReadHistory = this.readProgress(book, isReallyBooks);
    const progress = sReadProgress ?
      sReadProgress :
      `${iLastReadSerialID === 0 ? '未读' : `${iLastReadSerialID}章`} / ${iChapterNum}章`;
    if (noShowReadHistory) return null;
    return  <Text style={styles.readHistory} numberOfLines={1}>
      {progress}
    </Text>;
  };

  /** 追更卡滑动曝光 */
  private pushBookDoBeaconBySlide = (bookid) => {
    reportUDS(BusiKey.SLIDE__CARD, this.props, {
      ext_data1: bookid,
      ext_data2: 'push_Book',
    });
  };

  /** 追更卡点击曝光 */
  private pushBookDoBeaconByClick = (bookid, index) => {
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, {
      book_id: bookid,
      ext_data1: index,
      ext_data2: 'push_Book',
    });
  };

  /** 获取追更视图 */
  private renderPushBook = () => {
    const { vPushBook } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const pushBook = vectorToArray(vPushBook);
    const { itemBean = {}, parent } = this.props;
    const { isEdit } = parent.state;
    const contentWidth = CONTAINER_WIDTH - 12;
    if (isEdit) return;
    if (pushBook.length === 0) return null;
    return <View
      style={{
        marginBottom: 16,
        paddingHorizontal: 8,
      }}
      collapsable={false}
    >
      <PushBook
        itemBean={itemBean}
        contentWidth={contentWidth}
        pushBooks={pushBook}
        pushBookSlide={this.pushBookDoBeaconBySlide}
        pushBookClick={this.pushBookDoBeaconByClick}
      />
    </View>;
  };
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: WRAP_MARGIN,
  },
  titleWarp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tag: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 999,
  },
  littleRedDot: {
    position: 'absolute',
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColors: ['#FA7270', '#764143', '#FA7270', '#FA7270'],
    top: 5,
    right: 5,
  },
  textWarp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  font: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_7,
    lineHeight: FeedsLineHeight.T0,
    paddingBottom: 18,
    paddingTop: 20,
  },
  split: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_1,
    paddingBottom: 19,
    paddingTop: 19,
  },
  booksWarp: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookName: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
    marginBottom: 2,
  },
  readHistory: {
    colors: FeedsTheme.SkinColor.N1_1,
    fontSize: FeedsUIStyle.T0,
    lineHeight: FeedsLineHeight.T1,
  },
  imgWrap: {
    position: 'relative',
    borderRadius: 6,
  },
  collectBooks: {
    position: 'relative',
    borderColors: FeedsTheme.SkinColor.D2,
    borderRadius: BookCoverRadiusStyle.BIG,
    borderWidth: 0.5,
    height: IMAGE_HEIGHT,
    marginBottom: 8,
    width: IMAGE_WIDTH,
    backgroundColors: FeedsTheme.SkinColor.D2_1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  collectBooksPic: {
    height: SMALL_IMAGE_HEIGHT,
    width: SMALL_IMAGE_WIDTH,
    marginLeft: 2,
    marginRight: 2,
    marginBottom: 5,
    borderRadius: 2,
  },
  selectedWrap: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
    borderRadius: BookCoverRadiusStyle.BIG,
  },
  selectedPic: {
    width: 18,
    height: 18,
    marginLeft: (IMAGE_WIDTH / 184) * 136,
    marginTop: (IMAGE_HEIGHT / 246) * 194,
  },
  bookNameWarp: {
    position: 'relative',
    marginTop: 4,
  },
  cacheBookPic: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 15,
    height: 15,
  },
  item: {
    marginRight: IMAGE_MARGIN,
    marginLeft: IMAGE_MARGIN,
    width: IMAGE_WIDTH,
    position: 'relative',
    marginBottom: 14,
    marginTop: 8,
    borderRadius: 6,
  },
  tagRedBright: {
    backgroundColors: FeedsTheme.LiteColor.B2,
  },
  updatedNum: {
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.SMALL_2,
    lineHeight: Platform.OS === 'ios' ? 14 : 15,
  },
  updatedNumContainer: {
    alignItems: 'center',
    borderRadius: 28,
    height: 16,
    justifyContent: 'center',
    paddingHorizontal: 5,
    position: 'absolute',
    right: 1,
    top: 0,
  },
  welfareTimeWarp: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 7,
    backgroundColors: FeedsTheme.SkinColor.N2_1,
  },
  welfareTimeIcon: {
    width: 20,
    height: 14,
    marginRight: 6,
  },
  welfareTimeFont: {
    height: 14,
    lineHeight: 14,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_7,
    marginRight: 4,
  },
  EmptyBookWarp: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  EmptyBookImg: {
    width: 140,
    height: 140,
    marginTop: 107,
  },
  EmptyBookTips: {
    opacity: 0.4,
    fontSize: FeedsUIStyle.T3,
    colors: FeedsTheme.SkinColor.N1,
    marginBottom: 23,
  },
  EmptyBookAddBook: {
    backgroundColors: FeedsTheme.SkinColor.N2,
    width: 164,
    height: 40,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: 16,
    fontSize: FeedsUIStyle.T3,
    colors: FeedsTheme.SkinColor.N1,
  },
  EmptyBookAddLocal: {
    opacity: 0.7,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1,
    lineHeight: FeedsLineHeight.T0,
  },
  iosAddBooks: {
    borderColors: FeedsTheme.SkinColor.D2,
    borderRadius: 6,
    borderWidth: 0.5,
    height: IMAGE_HEIGHT,
    marginBottom: 8,
    width: IMAGE_WIDTH,
    backgroundColors: FeedsTheme.SkinColor.D5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPic: {
    width: 20,
    height: 20,
  },
  androidAddBooks: {
    borderRadius: 6,
    height: IMAGE_HEIGHT,
    marginBottom: 8,
    width: IMAGE_WIDTH,
  },
  adrAddPic: {
    borderRadius: 6,
    height: IMAGE_HEIGHT,
    width: IMAGE_WIDTH,
  },
});
