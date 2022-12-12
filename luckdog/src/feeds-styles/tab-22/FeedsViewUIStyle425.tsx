/**
 * KOL文章卡片
 */
import React from 'react';
import { View, StyleSheet, Image, Text, ViewPager } from '@tencent/hippy-react-qb';
import FeedsViewItem from '../FeedsViewItem';
import FeedsViewContainer from '../common/FeedsViewContainer';
import { FeedsUIStyle, FeedsTheme } from './components/utils';
import FeedsProtect from '../../mixins/FeedsProtect';
import { CommonCardStyle } from '../../framework/FeedsConst';
import FeedsUtils from '../../framework/FeedsUtils';
import { logInfoAll, reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { isTopTab } from '@/luckbox';
import FeedsIcon from '../../framework/FeedsIcon';
import { CommonProps, ItemBean } from '../../entity';

const isAndroid = FeedsUtils.isAndroid();

const styles = StyleSheet.create({
  KOLContainer: {
    flexDirection: 'column',
    minHeight: 228,
  },
  bottomBtns: {
    height: 6,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomBtn: {
    backgroundColors: FeedsTheme.SkinColor.N1_6,
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeBtn: {
    backgroundColors: FeedsTheme.SkinColor.N2,
  },

  headBlock: {
    paddingHorizontal: FeedsUIStyle.T5,
    flexDirection: 'row',
    alignItems: 'center',
    height: FeedsUIStyle.T9,
  },
  headImg: {
    width: FeedsUIStyle.T9,
    height: FeedsUIStyle.T9,
    borderRadius: FeedsUIStyle.T1,
  },
  headNameText: {
    marginLeft: 8,
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N1_4,
  },
  headTag: {
    marginLeft: 4,
    backgroundColors: FeedsTheme.SkinColor.N2,
    borderRadius: 2,
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  headTagText: {
    fontSize: 11,
    colors: FeedsTheme.SkinColor.D5,
  },

  KOLBlock: {
    height: 193,
  },
  contentMiddle: {
    position: 'relative',
    paddingHorizontal: FeedsUIStyle.T5,
    marginTop: 8,
  },
  contentText: {
    lineHeight: 28,
    colors: FeedsTheme.SkinColor.N1_5,
    fontSize: 16,
    textAlign: 'justify',
    justifyContent: 'space-between',
  },
  linkBlock: {
    position: 'absolute',
    bottom: isAndroid ? 0 : 1.5,
    right: 20,
    width: 60,
    height: 28,
    backgroundColors: ['transparent'],
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  linkBgImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 60,
    height: 28,
    tintColors: FeedsTheme.SkinColor.D5,
  },
  totalLink: {
    lineHeight: 28,
    colors: FeedsTheme.SkinColor.N5,
    fontSize: 16,
  },
  contentBottom: {
    marginTop: 7,
    paddingLeft: FeedsUIStyle.T5,
  },
  bookName: {
    lineHeight: 18,
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N1_4,
  },
});

interface Props extends CommonProps {
  itemBean: ItemBean;
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle425 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 425;
  }
  public viewpager: any;
  public state = {
    selectedIndex: 0, // 滑动到第几屏
  };
  public isFirstSlide = true; // 记录是否第一次触发滑动事件，屏蔽第一次上报

  // 上报灯塔事件，确定上报书籍内容
  public doBeaconEventReport = (eventName, moreData = {}) => {
    reportUDS(eventName, this.props, moreData);
  };

  // 切换文章
  public onPageSelected = (pageData) => {
    const { position = 0 } = pageData;

    this.setState({
      selectedIndex: position,
    });

    // 上报滑动事件、曝光事件，首次曝光自动触发滑动事件，进行上报屏蔽
    if (this.isFirstSlide) {
      this.isFirstSlide = false;
    } else {
      this.doBeaconEventReport(BusiKey.SLIDE__CARD, { ext_data1: position });
      this.doBeaconEventReport(BusiKey.EXPOSE__CARD, { ext_data1: position });
    }
  };

  // 点击头像跳转
  public onHeadClick = (sAvatarUrl, sBookId) => {
    if (!sAvatarUrl) return;
    // 跳转进入阅读器，上报时带book_id，按照点击书籍处理
    this.doBeaconEventReport(BusiKey.CLICK__CARD_AVATAR, { book_id: sBookId });
    super.onClick(sAvatarUrl);
  };

  // 顶部用户信息
  public getHeadBlock = (avatar, nickname, url, sBookId) => {
    const tagText = '推书达人';
    return (
      <View style={styles.headBlock} onClick={() => this.onHeadClick(url, sBookId)}>
        {
          !avatar ? null
            : <Image
              style={styles.headImg}
              source={{ uri: avatar }}
              noPicMode={{ enable: false }}
              reportData={{ sourceFrom: 'KOLHead' }}
            />
        }
        {
          !nickname ? null : <Text style={styles.headNameText}>{nickname}</Text>
        }
        <View style={styles.headTag}>
          <Text style={styles.headTagText}>{tagText}</Text>
        </View>
      </View>
    );
  };

  // 点击正文
  public onContentClick = (sUrl, sBookId) => {
    if (!sUrl) return;
    // 上报点击事件
    this.doBeaconEventReport(BusiKey.CLICK__CARD_BOOK, {
      book_id: sBookId,
    });

    super.onClick(sUrl);
  };

  // 中间文章部分
  public getContentBlock = (content, bookName, url, sBookId) => (
    <View>
      <View style={styles.contentMiddle} onClick={() => this.onContentClick(url, sBookId)}>
        <Text numberOfLines={6} style={styles.contentText} >{content}</Text>
        <View style={styles.linkBlock}>
          <Image
            source={{ uri: FeedsIcon.bgImg }}
            style={styles.linkBgImg}
          />
          <Text style={styles.totalLink}>全文</Text>
        </View>
      </View>
      {
        !bookName ? null
          : <View style={styles.contentBottom} >
            <Text style={styles.bookName}>来自《{bookName}》</Text>
          </View>
      }
    </View>
  );

  // 加入精准曝光
  public onBookItemLayout = (event, bookIndex, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      rect: event.layout,
    });
  };

  // 获得每一页KOL文章
  public getKOLPageBlock = (item, index) => {
    // 获得推书信息，头像地址、用户名、正文、点击正文跳转内容、书籍名称、书籍id
    const { sAvatar = '', sNickname = '', sAvatarUrl = '', sContent = '', sBookName = '', sBookId = '', sUrl = '' } = item;
    if (!sContent || !sBookId) {
      logInfoAll(`sBookId=${sBookId},sContent=${sContent}`, 'FeedsViewUIStyle425.getKOLPageBlock');
      return null;
    }

    const { itemBean: { item_id: itemId = '' } } = this.props;
    return (
      <View
        style={styles.KOLBlock}
        key={`${itemId}-kolPage-${index}`}
        onLayout={event => this.onBookItemLayout(event, index, sBookId)}
      >
        { this.getHeadBlock(sAvatar, sNickname, sAvatarUrl, sBookId)}
        { this.getContentBlock(sContent, sBookName, sUrl, sBookId)}
      </View>
    );
  };

  public render() {
    const { itemBean = {}, index: cardIndex } = this.props;
    const { parsedObject = {}, item_id: itemId = '' } = itemBean;
    const { vDetailData = {} } = parsedObject || {};
    const books = vDetailData.value || [];
    const { selectedIndex = 0 } = this.state;

    strictExposeReporter.updateBookIds(cardIndex, 0, books.map(book => book.sBookId));

    // 获得KOL文章列表
    const KOLPageBlock: any[] = [];
    books.forEach((item, index) => {
      if (this.getKOLPageBlock(item, index)) {
        KOLPageBlock.push(this.getKOLPageBlock(item, index));
      }
    });
    if (KOLPageBlock.length === 0) return null;
    return (
      <FeedsViewContainer
        parentProps={this.props}
        noPressState
        noPadding
      >
        <View style={{
          ...!isTopTab() && CommonCardStyle,
        }}>
          <ViewPager
            ref={(ref) => {
              this.viewpager = ref;
            }}
            style={styles.KOLContainer}
            initialPage={0}
            keyboardDismissMode="none"
            scrollEnabled
            onPageSelected={this.onPageSelected}
          >
            {KOLPageBlock}
          </ViewPager>

          <View style={styles.bottomBtns}>
            {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              books.map((_item, index) => (
                <View style={index === selectedIndex ? [styles.bottomBtn, styles.activeBtn] : styles.bottomBtn} key={`${itemId}-kolBtmBtn-${index}`}></View>
              ))
            }
          </View>
        </View>
      </FeedsViewContainer>
    );
  }
}
