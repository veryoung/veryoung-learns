/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 新用户KOL推书卡
 */

import React, { ForwardRefRenderFunction, useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, ImageBackground } from '@tencent/hippy-react-qb';
import FeedsUtils from '../../framework/FeedsUtils';
import { ConstantUtils, FeedsTheme, vectorToArray } from './components/utils';
import FeedsConst, { FeedsLineHeight, FeedsUIStyle, imageDict, NEW_USER_CONTENT_EXPOSE__KEY } from '../../framework/FeedsConst';
import { readSharedSettings, writeSharedSettings } from '../../utils/shareSettings';
import { logError, strictExposeReporter, reportUDS, BusiKey } from '@/luckdog';
import { ViewRef } from '@/entity';

/** 屏幕宽度 */
const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
/** 卡片宽与屏幕宽度比 */
const CARD_WIDTH_RATIO = 750 / 680;
/** 卡片宽度 */
const CARD_WIDTH = SCREEN_WIDTH / CARD_WIDTH_RATIO;
/** 边距 */
const CARD_MARGIN = 2;
/** 卡片高度(有副标题) */
const CARD1_HEIGHT = CARD_WIDTH * (390 / 680);
/** 卡片高度(无副标题) */
const CARD2_HEIGHT = CARD_WIDTH * (296 / 680);
/** 背景图片尺寸 */
const BG_IMAGE_HEIGHT = 473;
const BG_IMAGE_WIDTH = 1125;

/** 总长度 */
let TOTAL_WIDTH = 0;
/** 计算出整个滑动区域的中心 */
const MIDDLE = (Math.floor(CARD_WIDTH * 1.5) + (CARD_MARGIN * 2)) - (SCREEN_WIDTH / 2);
let hasReported: string[] = []; // 已经曝光过的书架id
/** 默认背景图 */
const DEFAULT_BG = 'https://novel.imqq.com/ricoxiao/1621412327/bg_story_and_video.png';

/** 背景图片露出高度 */
let imageShowHeight = 0;

type Props = {
  itemBean: {
    parsedObject: {
      vDetailData: any;
    }
  }
  parent: any;
  index: number;
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

/** 渲染头像框 */
const renderHeader = (header: string[]) => header.map((item, index) => <View key={index}>
  <Image
    style={[styles.header, {
      marginLeft: index === 0 ? 0 : -10,
    }]}
    source={{ uri: item }}
    reportData={{ sourceFrom: 'renderHeader' }}
  />
</View>);

/** 跳转 */
const goRead = (sUrl: string, bookId: string, props: Record<string, any>): void => {
  const { itemBean } = props;

  // 上报点击
  reportUDS(BusiKey.CLICK__CARD_BOOK, { itemBean }, { book_id: bookId });

  // 跳转
  FeedsUtils.doLoadUrl(sUrl, itemBean?.tab_id);
};

const UserKOL = (props): JSX.Element => {
  const { data = [], size = 0, props: componentProps } = props;
  if (!data || data.length === 0) return <View/>;

  // 更新精准曝光书籍id
  const { index: cardIndex = 0 } = componentProps || {};
  const bookIds = data.map(item => item.sId);
  strictExposeReporter.updateBookIds(cardIndex, 0, bookIds);

  TOTAL_WIDTH = (CARD_MARGIN * (size - 1) * 2) + (CARD_WIDTH * size);

  return <View
    style={[styles.container]}
  >
    {
      data.map((i, index) => {
        const { sId, sReason, sName, vHeadPic, sPicUrl, sTitle, sUrl  } = i;
        // 判断有没有简介情况下
        const CARD_HEIGHT = sTitle ? CARD1_HEIGHT : CARD2_HEIGHT;
        const headerPic = vectorToArray(vHeadPic);
        return <View
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            marginHorizontal: CARD_MARGIN,
            ...(index === 0 && {
              marginLeft: 0,
            }),
            ...(index === data.length - 1 && {
              marginRight: 0,
            }),
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: 'black',
          }}
          onClick={() => goRead(sUrl, sId, componentProps)}
          key={sId}
          onLayout={e => onLayout(e, cardIndex, index, sId)}
        >
          <ImageBackground
            source={{ uri: sPicUrl }}
            style={[styles.imageBg, {
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }]}
          >
            <View style={[styles.mask, {
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }]}>
              <View>
                <Text
                  style={styles.name}
                  numberOfLines={2}
                >{sName}</Text>
              </View>
              <View
                style={styles.reasonContainer}
              >
                <View
                  style={
                    styles.headerContainer
                  }
                >
                  {
                    headerPic.length > 0 ? renderHeader(headerPic) : null
                  }
                  <Text style={styles.reason}>{sReason}</Text>
                </View>
                {
                  sTitle ? <View
                    style={styles.title }
                  >
                    <Text numberOfLines={3} style={styles.titleText}>{sTitle}</Text>
                  </View> : null
                }
              </View>
            </View>
          </ImageBackground>
        </View>;
      })
    }
  </View>;
};


const UserKOLCard: ForwardRefRenderFunction<ViewRef, Props> = (props, ref: React.Ref<ViewRef>): JSX.Element => {
  let multiPicsSize = 0; // 总共可以滑动的长度
  let scrollView: any  = null; // 记录当前滑动元素的节点

  const [origin, setOrigin] = useState(0);
  const [position, setPosition] = useState(0);

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

  useEffect(() => {
    if (origin !== 0 || hasReported.length === 0) {
      recordKey(position);
    }
    // 刷新后清空
    hasReported = [];
  }, [props.itemBean]);

  /** 移动元素的判断 */
  const onMomentumScrollEnd = (e) => {
    const endDragX = e.contentOffset.x;
    // 滑动的绝对值 是否真实滑动
    const abs = Math.abs(endDragX - origin);
    // 是否右滑动
    const isRight = endDragX - origin > 0;
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
      <UserKOL data={detailData} size={multiPicsSize} props={props} />
    </ScrollView>
  </View>);
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  mask: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColors: ['rgba(0, 0, 0, 0.4)'],
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  imageBg: {
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
  },
  name: {
    colors: FeedsTheme.SkinColor.A8,
    lineHeight: FeedsLineHeight.T6_1,
    fontSize: FeedsUIStyle.T7,
    fontWeight: 'bold',
    height: 56,
  },
  title: {
    marginTop: 14,
    height: 61,
  },
  titleText: {
    colors: ['rgba(255,255,255, 0.55)'],
    fontSize: FeedsUIStyle.T2,
    lineHeight: FeedsUIStyle.T4,
  },
  reasonContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  reason: {
    colors: ['rgba(255,255,255, 0.85)'],
    fontSize: FeedsUIStyle.T1,
    marginLeft: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColors: ['#F3F5F7'],
  },
});


export default React.forwardRef(UserKOLCard);


