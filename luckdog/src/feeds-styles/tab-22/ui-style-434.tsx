/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 新用户视频推书卡
 */

import React, { ForwardRefRenderFunction, useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text } from '@tencent/hippy-react-qb';
import FeedsUtils from '../../framework/FeedsUtils';
import { ConstantUtils, FeedsIcon, FeedsTheme, vectorToArray } from './components/utils';
import FeedsConst, { FeedsUIStyle, imageDict, NEW_USER_CONTENT_EXPOSE__KEY } from '../../framework/FeedsConst';
import ItemVideo from './components/ItemVideo';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { logError, strictExposeReporter, reportUDS, BusiKey } from '@/luckdog';
import { ViewRef } from '@/entity';

/** 屏幕宽度 */
const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
/** 卡片元素宽高比 */
const CARD_RATIO = 608 / 438;
/** 卡片宽与屏幕宽度比 */
const CARD_WIDTH_RATIO = 750 / 608;
/** 卡片宽度 */
const CARD_WIDTH = SCREEN_WIDTH / CARD_WIDTH_RATIO;
/** 卡片高度 */
const CARD_HEIGHT  = CARD_WIDTH / CARD_RATIO;
/** 视频边距 */
const CARD_MARGIN = 2;
/** 视频和卡片高度比 */
const VIDEO_HEIGHT_RATIO = 342 / 438;
/** 视频高度 */
const VIDEO_HEIGHT =  CARD_HEIGHT * VIDEO_HEIGHT_RATIO;
/** 背景图片尺寸 */
const BG_IMAGE_HEIGHT = 473;
const BG_IMAGE_WIDTH = 1125;
/** 总长度 */
let TOTAL_WIDTH = 0;
/** 默认背景图 */
const DEFAULT_BG = 'http://novel.imqq.com/ricoxiao/1621412327/bg_story_and_video.png';
/** 计算出整个滑动区域的中心 */
const MIDDLE = (Math.floor(CARD_WIDTH * 1.5) + (CARD_MARGIN * 2)) - (SCREEN_WIDTH / 2);
/** 已经曝光过的书架id */
let hasReported: string[] = [];
/** 图片露出的高度 */
let imageShowHeight = 0;

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  videoContainer: {
    flexDirection: 'row',
  },
  container: {
    flexDirection: 'column',
    borderRadius: 8,
    backgroundColors: FeedsTheme.SkinColor.D2_1,
    overflow: 'hidden',
  },
  contextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryWarp: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColors: FeedsTheme.SkinColor.N2,
  },
  category: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.D2_1,
  },
  bookName: {
    flex: 1,
    fontSize: FeedsUIStyle.T2,
    marginLeft: 2,
    colors: FeedsTheme.SkinColor.N1,
    opacity: 0.85,
    paddingRight: 5,
  },
  reader: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_85,
  },
  arrow: {
    height: 9,
    width: 5,
    marginLeft: 4,
  },
});

 type Props = {
   itemBean: {
     parsedObject: {
       vDetailData: any;
     }
   },
   parent: any;
   index: number;
 };

/** 跳往阅读器 */
const onJump = (sUrl: string, bookId: string, props: Record<string, any>) => {
  const { itemBean } = props;

  // 上报点击事件
  reportUDS(BusiKey.CLICK__CARD_BOOK, { itemBean }, { book_id: bookId });

  // 跳转
  FeedsUtils.doLoadUrl(sUrl, itemBean?.tab_id);
};

/** 精准曝光 */
const onLayout = (event: Record<string, any>, cardIndex: number, bookIndex: number, bookId: string): void => {
  strictExposeReporter.addExpoItem({
    cardIndex,
    bookIndex,
    bookId,
    supportHorizontalScroll: true,
    rect: {
      y: imageShowHeight,
      ...event.layout,
    },
  });
};

const UserVideos = (props): JSX.Element | null => {
  const { data = [], size = 0, position = 1, props: componentProps, muteClick, mute } = props;
  if (!data || data.length === 0) return null;

  // 更新精准曝光书籍id
  const { index: cardIndex = 0 } = componentProps || {};
  const bookIds = data.map(item => item.sResourceId);
  strictExposeReporter.updateBookIds(cardIndex, 0, bookIds);

  TOTAL_WIDTH = (CARD_MARGIN * (size - 1) * 2) + (CARD_WIDTH * size);


  return <View
    style={[styles.videoContainer]}
  >
    {
      data.map((i, index) => {
        const {  sName, sUrl, sCategory, sBookUrl, sFirScreenUrl, sResourceId  } = i;
        return <View
          style={[styles.container, {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            marginHorizontal: CARD_MARGIN,
            ...(index === 0 && {
              marginLeft: 0,
            }),
            ...(index === data.length - 1 && {
              marginRight: 0,
            }),
          }]}
          key={sResourceId}
          onLayout={e => onLayout(e, cardIndex, index, sResourceId)}
        >
          {
            position === index ?
              <ItemVideo
                globalConf={{}}
                controls={true}
                isMuted={mute}
                autoPlay={true}
                loop={true}
                itemBean={{}}
                title={''}
                videoCanClick={true}
                noWifiCanPlay={true}
                sPlayUrl={sBookUrl}
                sPicUrl={sFirScreenUrl}
                sIconImg={FeedsIcon.ad_replay_icon}
                width={CARD_WIDTH}
                height={VIDEO_HEIGHT}
                muteClick={() => muteClick?.()}
                click={() => onJump?.(sUrl, sResourceId, componentProps)}
              /> : <Image
                source={{ uri: sFirScreenUrl }}
                style={[{
                  height: VIDEO_HEIGHT,
                  width: CARD_WIDTH,
                }]}
              />
          }
          <View
            style={styles.contextContainer}
            onClick={() => onJump?.(sUrl, sResourceId, componentProps)}
          >
            <View
              style={styles.titleContainer}
            >
              <View
                style={styles.categoryWarp}
              >
                <Text
                  style={styles.category}
                >{sCategory}</Text>
              </View>
              <Text
                style={styles.bookName}
                numberOfLines={1}
              >{sName ? `《${sName}》` : ''}</Text>
            </View>
            <View
              style={styles.btnContainer}
            >
              <Text
                style={styles.reader}
              >免费阅读</Text>
              <Image
                source={{ uri: FeedsIcon.novel_card_arrow }}
                style={[styles.arrow, {
                  tintColors: FeedsTheme.SkinColor.N1_85,
                }]}
                noPicMode={{ enable: false }}
              />
            </View>
          </View>
        </View>;
      })
    }
  </View>;
};

const UserVideoCard: ForwardRefRenderFunction<ViewRef, Props> = (props, ref: React.Ref<ViewRef>): JSX.Element => {
  let multiPicsSize = 0; // 总共可以滑动的长度
  let scrollView: any  = null; // 记录当前滑动元素的节点

  const [origin, setOrigin] = useState(0);
  const [position, setPosition] = useState(0);
  const [mute, setMute] = useState(true);

  useEffect(() => {
    // 初始化移动到中间
    if (position === 1 && origin === 0) {
      setOrigin(MIDDLE);

      // 更新精准曝光参考线x坐标
      strictExposeReporter.updateViewportLeft(props.index, MIDDLE);
    }
  }, [position]);

  useEffect(() => {
    scrollView?.scrollTo?.({ x: origin, y: 0, animated: true });

    // 更新精准曝光参考线x坐标
    strictExposeReporter.updateViewportLeft(props.index, origin);
  }, [origin]);

  /** 移动元素的判断 */
  const onMomentumScrollEnd = async (e) => {
    const endDragX = e.contentOffset.x;
    // 滑动的绝对值 是否真实滑动
    const abs = Math.abs(endDragX - origin);
    // 是否右滑动
    const isRight = endDragX - origin > 0;
    // 是否滑动越界
    // 一次滑动的距离
    const offset = CARD_WIDTH + CARD_MARGIN;
    const overFlow = endDragX < 0 || TOTAL_WIDTH - endDragX < CARD_WIDTH + (CARD_MARGIN * (multiPicsSize - 1));
    if (abs > 40 && !overFlow) {
      if (isRight) {
        setPosition(position + 1);
        setOrigin(origin + offset);
        recordKey(position + 1);
      } else {
        setPosition(position - 1);
        setOrigin(origin - offset);
        recordKey(position - 1);
      }
    } else {
      scrollView?.scrollTo?.({ x: origin, y: 0, animated: true });
    }
  };

  /** 初始化移动 */
  const onLayout = async () => {
    if (position === 0 && origin === 0) {
      const { itemBean } = props || {};
      const { vDetailData = {} } = itemBean.parsedObject || {};
      const books = vDetailData.value || [];
      if (books.length === 1) {
        setPosition(0);
      } else {
        setPosition(1);
      }
    }
  };

  useEffect(() => {
    // 刷新后清空
    if (origin !== 0 || hasReported.length === 0) {
      recordKey(position);
    }
    hasReported = [];
  }, [props.itemBean]);

  /** 静音点击事件 */
  const muteClick = () => {
    setMute(!mute);
  };

  /** 退避原则记录key */
  const recordKey = async (i = 0) => {
    const {
      itemBean,
      parent = null,
    } = props || {};
    try {
      const { vDetailData = {} } = itemBean.parsedObject || {};
      const books = vDetailData.value || [];
      const { sId = '' } = books[i] || {};
      // 同一生命周期内 曝光过的不再曝光
      if (hasReported.includes(sId)) return;
      hasReported.push(sId);
      const totalTime = 24 * 60 * 60;
      if (sId !== '') {
        const keys = FeedsConst.getGlobalConfKV(NEW_USER_CONTENT_EXPOSE__KEY)
        || (await readSharedSettings(NEW_USER_CONTENT_EXPOSE__KEY));
        // 如果从内存中没有取到任何缓存的退避内容, 就需要初始化生成
        if (!keys) {
          const info = {
            firstTime: new Date().getTime(),
            repeatValue: {},
          };
          info.repeatValue[sId] = 1;
          writeSharedSettings(NEW_USER_CONTENT_EXPOSE__KEY, info);
          return;
        }
        // 判断有没有过期
        const time = keys.firstTime ? Math.floor((new Date().getTime() - keys.firstTime) / 1000) : 0;
        // 如果时间差不为0, 且小于一天
        if (time !== 0 && time < totalTime) {
          // 记录一下每本书出现的次数
          const booksTimes = keys?.repeatValue?.[sId] || 0;
          // 如果小于三次 直接 + 1记录
          if (booksTimes < 3) {
            if (!keys.repeatValue) keys.repeatValue = {};
            keys.repeatValue[sId] = booksTimes + 1;
            FeedsConst.setGlobalConfKV(NEW_USER_CONTENT_EXPOSE__KEY, keys);
            writeSharedSettings(NEW_USER_CONTENT_EXPOSE__KEY, keys);
            return;
          }
          const repeatKeys = Object.keys(keys.repeatValue).join(',');
          parent?.mViewModel.setExtParams(NEW_USER_CONTENT_EXPOSE__KEY, repeatKeys);
        } else {
          // 重置时间
          const info = {
            firstTime: new Date().getTime(),
            repeatValue: {},
          };
          info.repeatValue[sId] = 1;
          FeedsConst.setGlobalConfKV(NEW_USER_CONTENT_EXPOSE__KEY, info);
          writeSharedSettings(NEW_USER_CONTENT_EXPOSE__KEY, info);
        }
      }
    } catch (e) {
      logError(e, 'FeedsViewUIStyle426.recordBookKey');
    }
  };

  const data = FeedsUtils.getSafeProps(props, 'itemBean.parsedObject', {});
  const { vDetailData,  BgPic = {} } = data;
  const { sUrl = '', iPicSize = 5 } = BgPic;
  const detailData = vectorToArray(vDetailData);
  const ratio = BG_IMAGE_HEIGHT / BG_IMAGE_WIDTH;
  const imageHeight = SCREEN_WIDTH * ratio;
  imageShowHeight = imageHeight * imageDict[iPicSize];
  multiPicsSize = detailData.length;

  return (<View ref={ref}
    style={{
      flexDirection: 'column',
    }}
  >
    <Image source={{ uri: sUrl || DEFAULT_BG }} style={[styles.image, {
      height: imageHeight,
      width: SCREEN_WIDTH,
    }]}/>
    <ScrollView
      style={{
        marginTop: - (imageHeight - imageShowHeight),
        width: SCREEN_WIDTH,
      }}
      onLayout={onLayout}
      onScrollEndDrag={onMomentumScrollEnd}
      ref={(ref) => {
        scrollView = ref;
      }}
      contentInset={[0, 40, 0, 40]}
      horizontal
      scrollEnabled={multiPicsSize > 1}
      showsHorizontalScrollIndicator={false}
    >
      <UserVideos
        data={detailData}
        size={multiPicsSize}
        position={position}
        props={props}
        mute={mute}
        muteClick={muteClick}
      />
    </ScrollView>
  </View>);
};

export default React.forwardRef(UserVideoCard);


