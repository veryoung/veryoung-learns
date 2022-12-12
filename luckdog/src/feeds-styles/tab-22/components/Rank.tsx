/* eslint-disable no-loop-func */
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  ScrollView,
} from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsTheme } from './utils';
import FeedsIcon from '../../../framework/FeedsIcon';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsUtils from '../../../framework/FeedsUtils';
import { colorDict } from '../../../framework/FeedsConst';
import { strictExposeReporter } from '@/luckdog';
import { throttle } from '@/luckbox';
import { CommonProps } from '../../../entity';

const STYLE_A_IMAGE_WIDTH = 60;
const STYLE_A_IMAGE_HEIGHT = 80;
const STYLE_A = {
  CARD_MARGIN: 20,
};
const styles = StyleSheet.create({
  imageContainer: {
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
});

const isAndroid = FeedsUtils.isAndroid();

const styleABgLeftFontColors = FeedsTheme.SkinColor.N3;
const styleABgRightFontColors = ['rgba(0,0,0,.3)', 'rgba(102,102,102,1)', 'rgba(0,0,0,.3)', 'rgba(102,102,102,1)'];

const stylesA = StyleSheet.create({
  cardWarp: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 0,
  },
  bookWarp: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: 0,
    paddingLeft: 4,
  },
  book: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  image: {
    borderColors: FeedsTheme.SkinColor.D2,
    borderRadius: 2,
    borderWidth: 0.5,
    height: STYLE_A_IMAGE_HEIGHT,
    width: STYLE_A_IMAGE_WIDTH,
    marginRight: 8,
  },
  info: {
    justifyContent: 'center',
    flexDirection: 'column',
    maxWidth: 120,
  },
  top: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 2,
    fontSize: FeedsUIStyle.T2,
    height: 15,
    width: 120,
  },
  orangeNumBlock: {
    height: 14,
    minWidth: 14,
    justifyContent: 'center',
    borderRadius: 2,
    padding: 0,
    overflow: 'hidden',
    marginRight: 4,
  },
  orangeNum: {
    fontFamily: Platform.OS === 'ios' ? 'DIN Next LT Pro' : 'DINNextLTPro-Medium',
    paddingHorizontal: 2,
    textAlign: 'center',
    minWidth: 14,
    lineHeight: 14,
    colors: FeedsTheme.SkinColor.D5_2,
    fontSize: FeedsUIStyle.T1,
    borderRadius: 2,
    ...!isAndroid && {
      height: 14,
      paddingTop: -1,
    },
  },
  hotNum: {
    fontSize: FeedsUIStyle.T1,
  },
  bookname: {
    fontSize: FeedsUIStyle.T2,
    fontFamily: 'PingFangSC-Regular',
    colors: FeedsTheme.SkinColor.N1,
    lineHeight: 20,
  },
  picTagText: {
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.SMALL,
    left: 0,
    lineHeight: Platform.OS === 'ios' ? 14 : 16,
    paddingHorizontal: 3,
    borderTopLeftRadius: 2,
    borderBottomRightRadius: 2,
    position: 'absolute',
    top: 0,
    zIndex: 3,
  },
  middle: {
    marginBottom: 24,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomTxt: {
    fontFamily: 'PingFangSC-Regular',
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_1,
    lineHeight: 16,
    maxWidth: 80,
  },
  line: {
    width: .5,
    height: 8,
    marginRight: 6,
    marginLeft: 6,
    backgroundColors: FeedsTheme.SkinColor.N1_1,
  },
});

interface Props extends CommonProps {
  cardIndex: number;
  books?: any[];
}

@FeedsProtect.protect
export default class Rank extends React.Component<Props> {
  public RankScrollView: any;
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'Rank');
  }

  public fillerMergeData = (data, length) => {
    const result: any[] = [];
    for (let i = 0;i < data.length;i += length) {
      result.push(data.slice(i, i + length));
    }
    return result;
  };

  public clickHandle = (book, start) => {
    const {
      parent,
      doBeaconByClick,
    } = this.props || {};
    doBeaconByClick?.({
      book_id: book.sBookId,
      ext_data1: start - 1,
      bigdata_contentid: '',
    });
    parent.loadUrl(book.sUrl);
  };

  public onScrollEndDrag = (e) => {
    const ACardWidth = STYLE_A_IMAGE_WIDTH + STYLE_A.CARD_MARGIN + 120;
    const width = ACardWidth ;
    const index = Math.floor(e.contentOffset.x / width);
    this.props.doBeaconBySlide?.({ ext_data1: index });
  };

  public onLayout = (event, tabIndex, bookIndex, bookId) => {
    const leftCount = Math.floor(bookIndex / 3);
    const leftMargin = leftCount * STYLE_A.CARD_MARGIN;
    const leftWidth = leftCount * event.layout.width;
    const x = event.layout.x + leftMargin + leftWidth;
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.cardIndex,
      tabIndex,
      bookIndex,
      bookId,
      rect: {
        ...event.layout,
        x,
      },
      supportHorizontalScroll: true,
    });
  };

  public onScroll = (e) => {
    this.checkExpose(e.contentOffset.x);
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public checkExpose = throttle((left) => {
    strictExposeReporter.updateViewportLeft(this.props.cardIndex, left);
  }, 500);

  /**
   * 获得A排行榜
   */
  public getRank = () => {
    const {
      books = [],
      itemBean = {},
      cardIndex,
    } = this.props || {};
    const bookView: any[] = [];
    let bookRanks = this.fillerMergeData(books, 3);
    if (bookRanks.length > 4) bookRanks = bookRanks.splice(0, 4);

    strictExposeReporter.updateBookIds(cardIndex, 0, bookRanks.reduce((acc, list) => {
      const bookIds = list.map(book => book.sBookId);
      return acc.concat(bookIds);
    }, []));

    // A 排行榜3个一列
    for (let index = 0; index < bookRanks.length; index++) {
      const bookRank = bookRanks[index];
      if (bookRank.length > 0) {
        const rankView: any[] = [];
        for (let start = 0; start < bookRank.length; start ++) {
          const book = bookRank[start];
          const { stTag = {} } = book || {};
          const { sText = '', iColor = 1 } = stTag;
          const tagColors = colorDict[iColor] || colorDict[4];
          const bookIndex = (index * 3) + start;

          rankView.push(<View
            key={`${book.sBookId}-${start}`}
            onLayout={event => this.onLayout(event, 0, bookIndex, book.sBookId)}
            collapsable={false}
            style={[
              stylesA.book,
              start !== bookRank.length - 1 ? null : { marginBottom: 8 },
            ]}
            onClick={strictExposeReporter.triggerExpoCheck(() => this.clickHandle(book, bookIndex + 1 || 1))}
          >
            <Image
              style={stylesA.image}
              reportData={{ sourceFrom: itemBean.item_id }}
              source={{ uri: book.sPicUrl || FeedsIcon.novel_default_cover }}
            />
            { !sText ? null : (
              <Text style={[stylesA.picTagText, { backgroundColors: tagColors }]}>
                {sText}
              </Text>
            )}
            <View
              style={stylesA.info}
            >
              <View
                style={stylesA.top}
              >

                <View style={[stylesA.orangeNumBlock, {
                  backgroundColors: index === 0 ? styleABgLeftFontColors : styleABgRightFontColors,
                }]}>
                  <Text numberOfLines={1} style={stylesA.orangeNum}>{`${bookIndex + 1 || 1}` }</Text>
                </View>
                <Text
                  style={[stylesA.hotNum, {
                    colors: index === 0 ? styleABgLeftFontColors : styleABgRightFontColors,
                  }]} numberOfLines={1}
                >
                  {`${(Math.ceil(book.sHot / 1000) / 10).toFixed(1)}万人气` || ''}
                </Text>

              </View>
              <View
                style={stylesA.middle}
              >
                <Text
                  style={stylesA.bookname} numberOfLines={1}
                >
                  { book.sTitle || '' }
                </Text>
              </View>
              <View
                style={stylesA.bottom}
              >
                <Text style={stylesA.bottomTxt} numberOfLines={1}>{book.sAuthor || ''}</Text>
                <View style={stylesA.line}></View>
                <Text style={stylesA.bottomTxt} numberOfLines={1}>{book.sTag || ''}</Text>
              </View>
            </View>
          </View>);
        }
        bookView.push(<View
          collapsable={false}
          style={[
            stylesA.cardWarp,
            {
              marginRight: index === bookRanks.length - 1 ? 0 : STYLE_A.CARD_MARGIN,
            },
          ]}
          key={index}
        >
          <View
            collapsable={false}
            style={stylesA.bookWarp}
          >
            {rankView}
          </View>
        </View>);
      }
    }


    return bookView;
  };

  public render() {
    countReRender(this, 'Rank');
    const bookView = this.getRank();
    return (
      <ScrollView
        contentContainerStyle={styles.imageContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        sendMomentumEvents
        ref={(ref) => {
          this.RankScrollView = ref;
        }}
        onScroll={this.onScroll}
        onScrollEndDrag={this.onScrollEndDrag}
        scrollEventThrottle={100}
      >
        {bookView}
      </ScrollView>
    );
  }
}

