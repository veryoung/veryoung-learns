/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-nested-ternary */
/**
 * 听书直播卡片
 * 支持左右滑动
 */
import React from 'react';
import {
  Image,
  ScrollView,
  Text,
  View,
  QBGifImageView,
  Platform,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { shouldComponentUpdate, countReRender, throttle, MTT } from '@/luckbox';
import FeedsProtect from '../../mixins/FeedsProtect';
import { colorDict, ColorDictKey, CommonCardStyle, FeedsUIStyle } from '../../framework/FeedsConst';
import { TabId, ItemBean } from '../../entity';
import { reportUDS, BeaconReportProps, strictExposeReporter, BusiKey } from '@/luckdog';
import { ConstantUtils } from '../common/utils';
import { Title } from './components';
import { FeedsTheme, vectorToArray } from './components/utils';
import FeedsUtils from '../../framework/FeedsUtils';

import FeedsViewItem from '../FeedsViewItem';

/** 有声书直播卡片Props类型 */
interface LiveRoomProps extends BeaconReportProps {
  title?: string;
  parsedObject?: {
    itemBean: LiveRoomItemBean;
  }
  globalConf?: any;
  index: number;
}

/** 有声书直播卡片itemBean类型 */
interface LiveRoomItemBean extends ItemBean {
  vDetailData?: LiveRoomItem;
}

/** 直播item类型 */
interface LiveRoomItem {
  value?: MTT.HomepageLiveBroadcastInfo[];
}

/** 模块关键字 */
const CARD_TAG = 'FeedsViewUIStyle430';
/** 模块uiStyle */
const CARD_NUMBER = 430;
/** 屏幕宽度 */
const screenWidth = ConstantUtils.getScreenWidth();
/** 直播封面宽度 */
const liveCoverWidth = (screenWidth * 284) / 750;
/** 封面图片高度 */
const coverHeight = (liveCoverWidth * 160) / 284;
/** 书籍封面宽度 */
const bookCoverWidth = (coverHeight * 120) / 160;

@FeedsProtect.protect
export default class FeedsViewUIStyle430 extends FeedsViewItem<LiveRoomProps> {
  public static getRowType() {
    return CARD_NUMBER;
  }

  public loadUrl!: (sUrl: string) => void;
  public shouldComponentUpdate = shouldComponentUpdate(this, CARD_TAG);
  // 直播间id
  public liveIds: string[] = [];

  /** 检查曝光 */
  public checkExpose = throttle((left) => {
    strictExposeReporter.updateViewportLeft(this.props.index, left);
  }, 500);

  public constructor(props: LiveRoomProps) {
    super(props);
    const { globalConf: { curTabId = TabId.BOTTOM_RECOMM2 } = {}, index = 0 } = props || {};

    // 精准曝光携带直播间id
    strictExposeReporter.addReportDataHandler(curTabId, index, (moreData) => {
      // ext_data2为bookIndex, 所有曝光的书籍的index拼接而成的string
      const indexArr = moreData?.ext_data2?.split(',');

      if (!indexArr || indexArr?.length === 0) {
        return moreData;
      }

      // 获得曝光书籍对应的直播间id的集合
      const liveId = indexArr.reduce((arr: string[], curr) => ([...arr, this.liveIds[curr] || '']), []).join(',');
      return {
        ...moreData,
        ext_data3: liveId, // 直播间id
      };
    });
  }

  public UNSAFE_componentWillMount() {
    const { vDetailData }: { vDetailData?: LiveRoomItem } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const liveRoomList: MTT.HomepageLiveBroadcastInfo[] = vectorToArray(vDetailData);
    const liveGif: string | undefined = liveRoomList?.[0]?.stIcon?.sIconUrl;

    this.setLiveIds(this.props);

    // 预加载直播icon
    liveGif && Image.prefetch(liveGif);
    // 预加载封面图片
    liveRoomList?.forEach((item) => {
      const { sLiveCoverUrl = '', sBookCoverUrl = '' } = item || {};
      sLiveCoverUrl && Image.prefetch(sLiveCoverUrl);
      sBookCoverUrl && Image.prefetch(sBookCoverUrl);
    });
  }

  public UNSAFE_componentWillReceiveProps(nextProps: LiveRoomProps) {
    this.setLiveIds(nextProps);
  }

  /**
   * 设置所有直播间的直播id集合
   * @param {*} props this.props
   */
  public setLiveIds = (props: LiveRoomProps) => {
    const { vDetailData }: { vDetailData?: LiveRoomItem } = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
    const liveRoomList: MTT.HomepageLiveBroadcastInfo[] = vectorToArray(vDetailData);
    this.liveIds = liveRoomList?.map(item => item?.sLiveId || '');
  };

  /** 精准曝光 */
  public onItemLayout = (event: any, bookIndex: number, bookId: string) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      rect: event.layout,
      supportHorizontalScroll: true,
    });
  };

  /** 滚动检查是否曝光过 */
  public onScroll = (e: any) => {
    this.checkExpose(e.contentOffset.x);
  };

  /**
   * 点击进入直播间
   * @param {*} item 直播间数据
   * @param {*} index 直播间index
   */
  public onClickItem = (item: MTT.HomepageLiveBroadcastInfo, index: number) => {
    const { sUrl = '', sLiveId = '' } = item || {};

    sUrl && this.loadUrl(sUrl);

    // 上报点击事件
    reportUDS(BusiKey.CLICK__CARD, this.props, {
      ext_data1: sLiveId, // 直播间id
      book_id: item.sBookId,
      ext_data2: index,
    });
  };

  public onTitleLayout = (event: any) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /**
   * 渲染左上角标签
   * @param {*} item 直播间数据
   */
  public renderTag = (item: MTT.HomepageLiveBroadcastInfo) => {
    const { stIcon } = item || {};
    const { sText = '', iColor = ColorDictKey.BLUE, sIconUrl = '' } = stIcon || {};
    if (!sText && !sIconUrl) {
      return null;
    }

    // android 播放gif需要使用 QBGifImageView TODO: 拆成单独组件
    const gifView = Platform.OS === 'ios' ? (
      <Image
        source={{ uri: sIconUrl }}
        style={styles.tagImg}
        noPicMode={{ enable: false }}
      />
    ) : (
      <QBGifImageView
        gifInfo={{ sustainedPlay: true, startPlay: true, gifUrl: sIconUrl }}
        style={styles.tagImg}
      />
    );

    return (
      <View style={[
        styles.tagContainer,
        { backgroundColors: colorDict[iColor] },
      ]}>
        {sIconUrl ? gifView : null}
        {sText ? <Text style={styles.tagText}>{sText}</Text> : null}
      </View>
    );
  };

  /**
   * 渲染一个直播间数据
   * @param {*} item 直播间数据
   * @param {Number} index index
   * @param {Number} length 直播间的数量
   */
  public renderLiveRoomItem = (item: MTT.HomepageLiveBroadcastInfo, index: number, length: number) => {
    const { item_id } = FeedsUtils.getSafeProps(this.props, 'itemBean', {});
    const { sBookId, sLiveId, sTitle = '', sLiveCoverUrl = '', sBookCoverUrl = '' } = item || {};
    if (!sBookId || !sLiveId) {
      return null;
    }

    return (
      <View
        key={`${CARD_TAG}_${index}`}
        onLayout={event => this.onItemLayout(event, index, sBookId)}
        onClick={strictExposeReporter.triggerExpoCheck(() => this.onClickItem(item, index))}
        style={[styles.liveRoomContainer, {
          marginRight: index < length - 1 ? 8 : 0,
        }]}
      >
        {this.renderTag(item)}
        <View style={styles.coverContainer}>
          {
            sLiveCoverUrl ? <View style={styles.liveCover}>
              <Image
                source={{ uri: sLiveCoverUrl }}
                style={[{
                  width: liveCoverWidth,
                  height: coverHeight,
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                }]}
                reportData={{ sourceFrom: item_id }}
                noPicMode={{ enable: true }}
                resizeMode={'cover'}
              />
            </View> : null
          }
          {
            sBookCoverUrl ? <View style={styles.bookCover}>
              <Image
                source={{ uri: sBookCoverUrl }}
                style={[{
                  width: bookCoverWidth,
                  height: coverHeight,
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                }]}
                reportData={{ sourceFrom: item_id }}
                noPicMode={{ enable: true }}
              />
            </View> : null
          }
        </View>
        {
          sTitle ? <View style={styles.title}>
            <Text style={styles.titleText} numberOfLines={1}>{sTitle}</Text>
          </View> : null
        }
      </View>
    );
  };

  /**
   * 渲染直播卡片内容
   */
  public renderLiveRoomList = () => {
    const { index } = this.props;
    const { vDetailData }: { vDetailData?: LiveRoomItem } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const liveRoomList: MTT.HomepageLiveBroadcastInfo[] = vectorToArray(vDetailData);

    strictExposeReporter.updateBookIds(index, 0, liveRoomList.map(data => data.sBookId || ''));

    return (
      <View style={styles.container} collapsable={false}>
        {liveRoomList.map((item, index) => this.renderLiveRoomItem(item, index, liveRoomList.length))}
      </View>
    );
  };

  public render() {
    countReRender(this, CARD_TAG);
    const { title = '' } = FeedsUtils.getSafeProps(this.props, 'itemBean', {});
    const { vDetailData }: { vDetailData?: LiveRoomItem } = FeedsUtils.getSafeProps(this.props, 'itemBean.parsedObject', {});
    const liveRoomList: MTT.HomepageLiveBroadcastInfo[] = vectorToArray(vDetailData);
    if (!liveRoomList || !liveRoomList.length) {
      return null;
    }

    return (
      <View
        style={{ ...CommonCardStyle }}
      >
        <Title
          title={title}
          changeable={false}
          parent={this}
          onLayout={this.onTitleLayout}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          sendMomentumEvents
          scrollEventThrottle={10}
          onScroll={this.onScroll}
          style={styles.scrollContainer}
        >
          {this.renderLiveRoomList()}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexDirection: 'row',
  },
  container: {
    paddingHorizontal: FeedsUIStyle.T3,
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  liveRoomContainer: {
    flexDirection: 'column',
    maxWidth: liveCoverWidth + bookCoverWidth,
  },
  coverContainer: {
    position: 'relative',
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColors: FeedsTheme.SkinColor.N1_2,
  },
  liveCover: {
    width: liveCoverWidth,
    heigth: coverHeight,
    borderWidth: 0,
  },
  bookCover: {
    width: bookCoverWidth,
    height: coverHeight,
  },
  tagContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  tagImg: {
    width: 10,
    height: 10,
    marginRight: 2,
  },
  tagText: {
    fontSize: 11,
    colors: FeedsTheme.SkinColor.A5,
  },
  title: {
    marginTop: 8,
  },
  titleText: {
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1,
    lineHeight: 16,
  },
});
