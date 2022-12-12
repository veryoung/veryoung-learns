/**
 * UGC 话题卡片
 */
import React from 'react';
import { View, ScrollView, StyleSheet } from '@tencent/hippy-react-qb';
import { throttle } from '@/luckbox';
import { strictExposeReporter, reportUDS, BusiKey, addKeylink, logError, KeylinkCmd } from '@/luckdog';
import { CommonCardStyle } from '@/framework/FeedsConst';
import { RightBehavior, Topic, TopicCard } from '@/framework/protocol';
import { LayoutList } from '@/framework/cards/components/layout-list';
import { Title } from './components';
import FeedsUtils from '../../framework/FeedsUtils';
import { TopicItem } from './components/topic-item';

const TAG = 'ui-style-441';

/** layout-item的列/行间距 */
const ColumnSpacing = 10;
const RowSpacing = 16;

/** 话题Tag高度宽度 */
const TopicItemHeight = 20;
const TopicItemWidth = 215;

const ScrollContainerPaddingHorizontal = 14;


/** 链接跳转 */
const loadUrl = (url?: string): void => {
  if (!url) {
    logError('跳转url为空', TAG);
    return;
  }
  FeedsUtils.doLoadUrl(url);
};

/** 话题Tag曝光 */
const onTopicItemLayout = (
  event: Record<string, any>,
  cardIndex: number,
  topicId: string,
  topicIndex: number,
  layoutIdx: number,
  itemIdx: number,
): void => {
  const rect = {
    ...event.layout,
    x: itemIdx * (
      ColumnSpacing + TopicItemWidth +
      ScrollContainerPaddingHorizontal + CommonCardStyle.marginHorizontal
    ),
    y: layoutIdx * (RowSpacing + TopicItemHeight),
  };

  strictExposeReporter.addExpoItem({
    cardIndex,
    bookId: topicId,
    bookIndex: topicIndex,
    supportHorizontalScroll: true,
    rect,
  });
};

/** 更新卡片标题高度 */
const onTitleLayout = (event: Record<string, any>, cardIndex: number): void => {
  strictExposeReporter.updateTitleHeight(cardIndex, event.layout.height);
};

/** 滑动时更新Tag x坐标 */
const onTopicScroll = (event: Record<string, any>, cardIndex: number): void => {
  strictExposeReporter.updateViewportLeft(cardIndex, event.contentOffset.x);
};

interface Props {
  index: number;
  /** 当前tabid */
  selectTabID: number;
  /** 卡片后台数据 */
  itemBean: {
    parsedObject?: {
      sData: TopicCard; // 新协议结构
    }
  };
  globalConf: any;
}


export const FeedsViewUIStyle441 = (props: Props): JSX.Element | null => {
  const cardIndex = props.index;
  const { jumpLink, behavior, layoutList = [], isRow = false, title = '' } = props.itemBean.parsedObject?.sData || {};
  if (layoutList.length === 0) {
    logError(`话题卡数据异常: ${props.itemBean.parsedObject?.sData}`, TAG);
    return null;
  }
  if (layoutList.some(item => item.dataList.length !== layoutList[0].dataList.length)) {
    addKeylink(`话题卡片列数不一致: ${layoutList.map(item => item.dataList.length)}`, TAG);
    addKeylink('topic-row-columns-notmatch', KeylinkCmd.PR_ERROR_SUM);
  }

  // 根据话题index（从上往下，从左往右）将topicId重排序为一维数组
  const colNum = layoutList[0].dataList.length;
  const topIdsList: string[][] = layoutList.map(item => item.dataList.map(({ topicId }) => topicId));
  const rearrangeTopicIds: string[] = [...Array(colNum).keys()]
    .map(index => topIdsList.map(arr => arr[index]))
    .reduce((acc, item) => [...acc, ...item], []);
  strictExposeReporter.updateBookIds(cardIndex, 0, rearrangeTopicIds);

  /** 点击话题Tag */
  const onTopicItemClick = (topicUrl: string, topicId: string, topicIndex: number): void => {
    loadUrl(topicUrl);
    // 点击话题Tag上报
    reportUDS(BusiKey.CLICK__CARD, props, { ext_data1: topicIndex, ext_data2: topicId, bigdata_contentid: '' });
  };

  /** 渲染话题的一个Tag */
  const onTopicItemRender = (_isSmallItem: boolean, layoutIdx: number, itemIdx: number): JSX.Element => {
    // 计算话题index(从1开始)，从上往下，从左往右
    const topicIndex = layoutIdx + (itemIdx * layoutList.length) + 1;
    const { dataList } = layoutList[layoutIdx];
    const { topicId, topicUrl } = dataList[itemIdx];
    return <TopicItem
      topic={dataList[itemIdx]}
      height={TopicItemHeight}
      width={TopicItemWidth}
      onClick={strictExposeReporter.triggerExpoCheck(() => onTopicItemClick(topicUrl, topicId, topicIndex))}
      onLayout={event => onTopicItemLayout(event, cardIndex, topicId, topicIndex, layoutIdx, itemIdx)}
    />;
  };

  /** 点击标题右上角 */
  const onTitleRightClick = (url?: string): void => {
    // 点击查看更多上报
    if (behavior === RightBehavior.LINK_MORE) {
      loadUrl(url);
      reportUDS(BusiKey.CLICK__CARD_VIEW_ALL, props);
    }
  };

  return (
    <View
      style={CommonCardStyle}
    >
      <Title
        title={title}
        right={FeedsUtils.convertTitleRight(jumpLink)}
        rightClick={() => onTitleRightClick(jumpLink?.linkUrl)}
        onLayout={event => onTitleLayout(event, cardIndex)}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={throttle(event => onTopicScroll(event, cardIndex), 500, 500)}
      >
        <LayoutList<Topic>
          isRow={isRow}
          columnSpacing={ColumnSpacing}
          rowSpacing={RowSpacing}
          layoutList={layoutList}
          onItemRender={onTopicItemRender}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: ScrollContainerPaddingHorizontal,
    paddingTop: 8,
    marginBottom: 16,
  },
});
