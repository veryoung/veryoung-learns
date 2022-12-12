/* eslint-disable no-loop-func */
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsLineHeight, FeedsTheme } from './utils';
import FeedsIcon from '../../../framework/FeedsIcon';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { strictExposeReporter } from '@/luckdog';
import { throttle } from '@/luckbox';
import { CommonProps } from '../../../entity';

const IMAGE_WIDTH = 240;
const IMAGE_HEIGHT = 135;
const IMAGE_MARGIN = 8;

const styles = StyleSheet.create({
  bookInfo: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: IMAGE_WIDTH,
  },
  bookLeft: {
    height: 56,
    width: 60,
    marginRight: 8,
  },
  bookPic: {
    width: 60,
    height: 80,
    position: 'relative',
    top: -24,
    left: 0,
    borderRadius: 2,
  },
  bookRight: {
    flex: 1,
    height: 56,
    width: 152,
    flexDirection: 'column',
  },
  bookName: {
    width: 152,
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T2,
    lineHeight: FeedsLineHeight.T0,
    marginBottom: 2,
  },
  bookDesc: {
    width: 152,
    colors: FeedsTheme.SkinColor.N1_1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T0,
  },
  image: {
    height: IMAGE_HEIGHT,
    marginBottom: 8,
    width: IMAGE_WIDTH,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  imageContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'column',
    borderWidth: .5,
    borderColors: FeedsTheme.SkinColor.D2,
    marginRight: IMAGE_MARGIN,
    marginTop: 6,
    width: IMAGE_WIDTH,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});

interface Props extends CommonProps {
  cardIndex: number;
  books: any[];
}

@FeedsProtect.protect
export class BigBanner extends React.Component<Props> {
  public userInfo = this.props.globalConf || {};
  public hasRedHotExposured = false;
  public addBookIconExposured = false;
  public BookShelfScrollView: any;

  public shouldComponentUpdate = shouldComponentUpdate(this, 'BigBanner');

  public onLayout = (event, bookIndex, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.cardIndex,
      bookIndex,
      bookId,
      rect: event.layout,
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
   * 获得小说Book的视图
   */
  public getBookView = () => {
    const {
      books = [],
      itemBean = {},
      parent,
    } = this.props || {};
    const imageMargin = IMAGE_MARGIN;
    const bookView: any[] = [];
    const end = books.length;
    const clickHandle = (o, index) => {
      this.props.doBeaconByClick?.({
        ext_data1: index,
        book_id: o.sId,
        bigdata_contentid: '',
      });
      parent.loadUrl(o.sUrl);
    }; // 解决闭包引用自增start的bug

    for (let start = 0; start < end; start += 1) {
      const o = books[start];
      if (o) {
        bookView.push(<View
          key={start}
          onLayout={event => this.onLayout(event, start, o.sId)}
          collapsable={false}
        >
          <View
            style={[
              styles.item,
              { marginRight: start === books.length - 1 ? 0 : imageMargin },
            ]}
            onClick={strictExposeReporter.triggerExpoCheck(() => clickHandle(o, start))}
          >
            <Image
              style={styles.image}
              reportData={{ sourceFrom: itemBean.item_id }}
              source={{ uri: o.sPicUrl || FeedsIcon.novel_default_cover }}
            />
            <View style={styles.bookInfo}>
              {
                !o.sBookPicUrl ? null
                  : (<View style={styles.bookLeft}>
                    <Image
                      style={styles.bookPic}
                      source={{ uri: o.sBookPicUrl }}
                      reportData={{ sourceFrom: itemBean.item_id }}
                    />
                  </View>)
              }
              <View style={styles.bookRight}>
                <Text style={styles.bookName} numberOfLines={1}>
                  {o.sName}
                </Text>
                <Text style={styles.bookDesc} numberOfLines={2}>
                  {o.sTitle}
                </Text>
              </View>
            </View>

          </View>
        </View>);
      } else {
        bookView.push(<View key={start} style={styles.item} />);
      }
    }
    return bookView;
  };

  public onScrollEndDrag = (e) => {
    const index = Math.floor(e.contentOffset.x / 160);
    if (this.props.doBeaconBySlide) {
      this.props.doBeaconBySlide({ ext_data1: index });
    }
  };

  public render() {
    countReRender(this, 'BigBanner');
    let bookView: any[] = [];
    bookView = this.getBookView();
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
        {bookView}
      </ScrollView>
    );
  }
}
