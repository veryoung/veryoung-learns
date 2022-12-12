// 运营视频
/**
 *  author: veryoungwan
 *
 *  退避策略说明
 *  1.记录当前tab对应的书籍id并记录在缓存内
 *  2.每次请求的时候需要提取 NEW_USER_BOOK_EXPOSE__KEY 作为扩展字段
 *  3.缓存过期时间为1天
*/
/* eslint-disable no-nested-ternary */
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from '@tencent/hippy-react-qb';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsViewItem from '../FeedsViewItem';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsConst, { CommonCardStyle, FeedsLineHeight, FeedsUIStyle, NEW_USER_BOOK_EXPOSE__KEY, UI_426_KEY } from '../../framework/FeedsConst';
import { reportUDS, strictExposeReporter, BusiKey, logError } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { FeedsIcon, FeedsTheme } from './components/utils';
import FeedsUtils from '../../framework/FeedsUtils';
import ItemVideo from './components/ItemVideo';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { isTopTab, throttle } from '@/luckbox';
import { CommonProps } from '../../entity';

const { width } = FeedsUtils.getScreen();
const IMAGE_WIDTH = width * (608 / 750);
const IMAGE_HEIGHT = IMAGE_WIDTH * (342 / 608);
const IMAGE_MARGIN = width * (8 / 750);
const WARP_MARGIN = width * (16 / 750);

const styles = StyleSheet.create({
  bookInfo: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: IMAGE_WIDTH,
  },
  bookLeft: {
    flex: 1,
    height: 56,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  bookDescWarp: {
    flex: 1,
    paddingRight: 16,
  },
  bookRight: {
    height: 56,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookPic: {
    width: 36,
    height: 48,
    borderRadius: 2,
    marginRight: 6,
  },
  goRead: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goReadBtn: {
    backgroundColors: FeedsTheme.SkinColor.N2_2,
    borderRadius: 14,
  },
  goReadText: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T0,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bookName: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T3,
    lineHeight: FeedsLineHeight.T3,
    marginBottom: 2,
  },
  bookDesc: {
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
    paddingBottom: WARP_MARGIN,
    paddingHorizontal: WARP_MARGIN,
  },
  item: {
    flexDirection: 'column',
    borderWidth: .5,
    borderColors: FeedsTheme.SkinColor.D2,
    marginTop: 6,
    width: IMAGE_WIDTH,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  videoWarp: {
    position: 'relative',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  videoImg: {
    position: 'absolute',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    left: 0,
    top: 0,
    zIndex: 9999,
  },
  video: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
});

interface U426Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle426 extends FeedsViewItem<U426Props> {
  public static getRowType() {
    return 426;
  }
  public BookShelfScrollView: any;
  public state = {
    position: 0,
    isplay: true,
  };
  public isFirstSlide = true; // 记录是否第一次触发滑动事件，屏蔽第一次上报
  public isVideo = false; // 判断当前展示的内容是否为视频
  public shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle419');

  public componentDidMount() {
    this.recordBookKey(this.state.position);
  }

  // 记录展示的key
  public recordBookKey = async (i = 0) => {
    const {
      itemBean,
      parent = null,
    } = this.props || {};
    try {
      const { parsedObject = {} } = itemBean || {};
      const { vDetailData = {} } = parsedObject;
      const books = vDetailData.value || [];
      const { sId = '' } = books[i];
      const totalTime = 24 * 60 * 60;
      if (sId !== '') {
        const keys = FeedsConst.getGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY)
          || (await readSharedSettings(NEW_USER_BOOK_EXPOSE__KEY));
        // 如果keys不存在说明是从没曝光过或者已过期,可以初始话value
        const info = {
          value: sId,
          firstTime: new Date().getTime(),
        };
        if (!keys) {
          // 第一次就可以设置一下当前时间了 这里记录一下 省的每次都去读内存
          FeedsConst.setGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY, info);
          writeSharedSettings(NEW_USER_BOOK_EXPOSE__KEY, info);
          parent?.mViewModel.setExtParams(UI_426_KEY, sId);
          return;
        }
        // 判断有没有过期
        const time = keys.firstTime ? Math.floor((new Date().getTime() - keys.firstTime) / 1000) : 0;
        // 如果时间差不为0, 且小于一天
        if (time !== 0 && time < totalTime) {
          const keysArray = keys?.value ? keys.value.split(',') : [];
          // 判断下有没有 有才加
          if (keysArray.indexOf(sId) < 0) {
            const newKey = `${keys.value},${sId}`;
            const newInfo = {
              value: newKey,
              firstTime: keys.firstTime,
            };
            parent?.mViewModel.setExtParams(UI_426_KEY, newKey);
            FeedsConst.setGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY, newInfo);
            writeSharedSettings(NEW_USER_BOOK_EXPOSE__KEY, newInfo);
          } else {
            FeedsConst.setGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY, keys);
            parent?.mViewModel.setExtParams(UI_426_KEY, keys.value);
            writeSharedSettings(NEW_USER_BOOK_EXPOSE__KEY, keys);
          }
        } else {
          // 重置时间
          FeedsConst.setGlobalConfKV(NEW_USER_BOOK_EXPOSE__KEY, info);
          writeSharedSettings(NEW_USER_BOOK_EXPOSE__KEY, info);
          parent?.mViewModel.setExtParams(UI_426_KEY, sId);
        }
      }
    } catch (e) {
      logError(e, 'FeedsViewUIStyle426.recordBookKey');
    }
  };

  // 获得当前视频或图片类型
  public getCurentContentType = (position) => {
    const { itemBean } = this.props;
    const { parsedObject = {} } = itemBean || {};
    const { vDetailData = {} } = parsedObject;
    const books = vDetailData.value || [];

    const { bIsVideo } = (books?.[position]) || {};
    return bIsVideo ? 'video' : 'pic';
  };

  // 上报灯塔事件，确定上报书籍内容
  public doBeaconEventReport = (eventName, moreData = {}) => {
    reportUDS(eventName, this.props, moreData);
  };

  public onClickVideoBlock = (data, start, type) => {
    this.goRead(data);

    const { sId = '', sResourceId = '' } = data || {};

    const resourceId = `${sId}_${sResourceId}`;

    // 上报点击视频区域
    this.doBeaconEventReport(BusiKey.CLICK__CARD, {
      type,
      resource_id: resourceId,
      ext_data1: start,
      book_id: sResourceId,
      bigdata_contentid: '',
    });
  };

  public doBeaconBySlide = () => {
    if (!this.isFirstSlide) {
      this.isFirstSlide = true;
    } else {
      this.doBeaconEventReport(BusiKey.SLIDE__CARD);
    }
  };

  public doBeaconByPlay = () => {
    this.doBeaconEventReport(BusiKey.CLICK__CARD_PLAY);
  };

  public doBeaconByPause = () => {
    this.doBeaconEventReport(BusiKey.CLICK__CARD_PAUSE);
  };

  public doBeaconByMute = () => {
    this.doBeaconEventReport(BusiKey.CLICK__CARD_MUTE);
  };

  public renderBanner = (data, start) => {
    const { position, isplay } = this.state;
    const { itemBean = {}, globalConf = {} } = this.props || {};
    const showRenderVideo = data.bIsVideo;
    const defaultUri = data.sFirScreenUrl;
    const sourceUri = data.sBookUrl;
    if (!showRenderVideo) {
      // 如果不展示视频 则展示图片
      return <Image
        onClick={() => this.onClickVideoBlock(data, start, 'pic')}
        style={styles.image}
        reportData={{ sourceFrom: itemBean.item_id }}
        source={{ uri: sourceUri || FeedsIcon.novel_default_cover }}
      />;
    }
    if (position === start) {
      return <View
        style={styles.videoWarp}
      >
        {
          !isplay
            ? <Image
              style={styles.videoImg}
              reportData={{ sourceFrom: itemBean.item_id }}
              source={{ uri: defaultUri }}
            /> : null
        }
        <ItemVideo
          key={`${start}-video`}
          style={styles.video}
          setliveRoomState={this.setliveRoomState}
          globalConf={globalConf}
          itemBean={itemBean}
          click={() => this.onClickVideoBlock(data, start, 'video')}
          sIconImg={FeedsIcon.ad_replay_icon}
          sPlayUrl={sourceUri}
          sPicUrl={defaultUri}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          doBeaconByPlay={this.doBeaconByPlay}
          doBeaconByPause={this.doBeaconByPause}
          doBeaconByMute={this.doBeaconByMute}
        />
      </View>;
    }
    return <Image
      style={styles.image}
      reportData={{ sourceFrom: itemBean.item_id }}
      source={{ uri: defaultUri }}
    />;
  };

  public setliveRoomState = (isplay) => {
    this.setState({
      isplay,
    });
  };

  public goRead = (o) => {
    const { sUrl } = o;
    // 去阅读
    this.loadUrl(sUrl);
  };

  public onClickBookBlock = (o, start) => {
    this.goRead(o);
    // 上报点击书籍事件
    const { bIsVideo = false } = o;
    this.doBeaconEventReport(BusiKey.CLICK__CARD_BOOK, {
      type: bIsVideo ? 'video' : 'pic',
      ext_data1: start,
      book_id: o.sId,
      bigdata_contentid: '',
    });
  };

  /**
   * 获得小说Book的视图
   */
  public getBookView = () => {
    const {
      itemBean = {},
      index,
    } = this.props || {};
    const { parsedObject = {} } = itemBean;
    const { vDetailData = {} } = parsedObject;
    const books = vDetailData.value || [];
    const imageMargin = IMAGE_MARGIN;
    const bookView: any[] = [];
    const end = books.length;

    strictExposeReporter.updateBookIds(index, 0, books.map(book => book.sId));

    for (let start = 0; start < end; start += 1) {
      const o = books[start];
      if (o) {
        bookView.push(<View
          key={`${start}-bookView`}
          onLayout={event => this.onBookItemLayout(event, start, o.sId)}
          collapsable={false}
        >
          <View
            style={[
              styles.item,
              { marginRight: start === books.length - 1 ? 0 : imageMargin },
            ]}
          >
            <View style={styles.image}>{this.renderBanner(o, start)}</View>
            <View
              style={styles.bookInfo}
              onClick={strictExposeReporter.triggerExpoCheck(() => this.onClickBookBlock(o, start))}
            >
              <View style={styles.bookLeft}>
                {
                  !o.sPicUrl ? null
                    : <Image
                      style={styles.bookPic}
                      source={{ uri: o.sPicUrl }}
                      reportData={{ sourceFrom: itemBean.item_id }}
                    />
                }
                <View style={styles.bookDescWarp} >
                  <Text style={styles.bookName} numberOfLines={1}>
                    {o.sName}
                  </Text>
                  <Text style={styles.bookDesc} numberOfLines={2}>
                    {o.sTitle}
                  </Text>
                </View>
              </View>
              <View style={styles.bookRight}>
                <View style={styles.goRead}>
                  <View style={styles.goReadBtn}>
                    <Text style={styles.goReadText}>免费阅读</Text>
                  </View>
                </View>
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
    let index = 0;
    // 第一屏的数据没有超过一半 就说明还是在第一屏
    if (e.contentOffset.x > IMAGE_WIDTH / 2) {
      index = Math.floor(e.contentOffset.x / e.layoutMeasurement.width) + 1;
    } else {
      index = 0;
    }
    this.recordBookKey(index);
    this.setState({
      position: index,
    });

    // 上报滑动事件
    this.doBeaconBySlide();
  };

  public onScroll = (e) => {
    this.checkExpose(e.contentOffset.x);
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public checkExpose = throttle((left) => {
    strictExposeReporter.updateViewportLeft(this.props.index, left);
  }, 500);

  public onBookItemLayout = (event, bookIndex, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      rect: event.layout,
      supportHorizontalScroll: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle426');
    const { itemBean = {}, globalConf } = this.props;
    return (
      <View
        style={{
          ...!isTopTab() && CommonCardStyle,
        }}
      >
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        <ScrollView
          contentContainerStyle={styles.imageContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
          sendMomentumEvents
          ref={(ref) => {
            this.BookShelfScrollView = ref;
          }}
          onMomentumScrollEnd={this.onScrollEndDrag}
          scrollEventThrottle={10}
          onScroll={this.onScroll}
        >
          {this.getBookView()}
        </ScrollView>
      </View>
    );
  }
}
