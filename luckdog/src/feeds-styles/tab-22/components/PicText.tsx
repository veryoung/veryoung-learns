// 左图右文
import React from 'react';
import { View, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsTheme } from './utils';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsIcon from '../../../framework/FeedsIcon';
import { getWidthHeight } from '../../../framework/utils/device';
import { strictExposeReporter } from '@/luckdog';
import { CommonProps } from '../../../entity';
import { BigBookCoverLeftTagStyle } from '../../../framework/FeedsConst';
import FeedsUtils from '../../../framework/FeedsUtils';
import { BookCoverRadiusStyle, LeftTag } from '../../../types/card';
import { getOrderedReasons, StyleExperimentType } from '@/presenters';
import { BookCover } from '../../../components/book-font-cover';

const windowWidth = getWidthHeight().width;
const imageWidth = (windowWidth * 132) / 750;
const imageHeight = (imageWidth * 176) / 132;

interface Props extends CommonProps {
  title: string;
  score: string;
  intro: string;
  type: string;
  status: string;
  styles?: Record<string, any>;
  author?: string;
  tag?: string;
  hot?: string;
  hasButton?: boolean;
  recommendReasons?: string[];
  item_id?: string;
  bookid?: string;
  bookIndex?: number;
  picUrl?: string;
  isUnlimited?: boolean;
  openUrl?: string;
  leftTag?: LeftTag;
  doBeaconByClick?: (...args) => void;
  /** 负反馈按钮 */
  onFeedBack?: () => void;
  styleExperimentType?: StyleExperimentType;
  vOpReasons?: string[];
}

/** 推荐tag间的分隔线 */
const TagSpliter = ({ styles }) => <Text style={styles}>|</Text>;

@FeedsProtect.protect
export class PicText extends React.Component<Props> {
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PicText');
  }

  /**
   * 渲染右侧头部标题和评分
   */
  public renderHeadBlock = () => {
    const {
      title = '',
      score = '',
      styles: { scoreStyle = {}, titleStyle = {}, titleViewStyle = {} } = {},
    } = this.props;
    if (!title) return null;

    return (
      <View style={[styles.textHead, titleViewStyle]}>
        <Text style={[styles.textTitle, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {!score ? null : (
          <View style={styles.textScoreBlock}>
            <Text style={[styles.textScore, scoreStyle]}>{score}分</Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * 渲染右侧中间简介和标签
   */
  public renderMiddleBlock = () => {
    const {
      intro = '',
      type = '',
      status = '',
      styles: { middleStyle = {}, middleViewStyle = {} } = {},
      styleExperimentType,
    } = this.props;
    if (!intro) return null;

    const canShowTypeAndStatus = (type || status) && styleExperimentType !== StyleExperimentType.ONLY_ONE_LINE;
    const canShowSplit = type && status;

    return (
      <View style={middleViewStyle}>
        <Text style={styles.textIntro} numberOfLines={2}>
          {intro}
        </Text>
        {canShowTypeAndStatus ? (
          <View style={[styles.middleClassification, middleStyle]}>
            {type ? <Text style={styles.textMiddleClassification}>{type}</Text> : null}
            {canShowSplit ? <TagSpliter styles={[styles.textMiddleClassification, styles.tagSpliter]} /> : null}
            {status ? <Text style={styles.textMiddleClassification}>{status}</Text> : null}
          </View>
        ) : null}
      </View>
    );
  };

  /**
   * 渲染右侧底部推荐标签
   */
  public renderBottomBlock = () => {
    const {
      author = '',
      tag = '',
      hot = '',
      hasButton = true,
      onFeedBack = () => null,
      recommendReasons = [],
      bookid = '',
      vOpReasons = [],
      styleExperimentType,
      type = '',
      status = '',
    } = this.props;

    // 没有推荐理由的时候显示作者、二级分类和热度
    const defaultTags = author || tag || hot ? [author, tag, hot] : [];
    const orderedReasons = getOrderedReasons({
      styleExperimentType,
      recommendReasons,
      vOpReasons,
      type,
      status,
      defaultTags,
    });

    if (!orderedReasons?.length) return null;

    const isOnlyOnelineExperiment = styleExperimentType === StyleExperimentType.ONLY_ONE_LINE;

    return (
      <View style={styles.textBottom}>
        {/* 运营语、推荐tag、作者、分类、热度 */}
        <View style={styles.textBottomLeft}>
          {orderedReasons.map((reason, index) => (
            <View style={styles.textItem} key={`${bookid}_${index}`}>
              <Text
                style={[
                  styles.bottomText,
                  isOnlyOnelineExperiment
                    ? styles.bottomTextOnlyOneline // 只展示一行的时候字体颜色跟简介保持一致
                    : styles[`bottomText_${index}`],
                ]}
                numberOfLines={1}
              >
                {reason}
              </Text>
              {/* 命中仅显示一行实验时，各个tag间需要加分隔线 */}
              {isOnlyOnelineExperiment && index < orderedReasons.length - 1 ? (
                <TagSpliter styles={styles.onlyOnelineSpliter} />
              ) : null}
            </View>
          ))}
        </View>
        {/* 负反馈按钮 */}
        {hasButton ? (
          <View style={styles.textBtn} onClick={onFeedBack}>
            <Image style={styles.btnImage} source={{ uri: FeedsIcon.closeBtn }} />
          </View>
        ) : null}
      </View>
    );
  };

  public handleClick = () => {
    const { openUrl, parents = {}, bookIndex, doBeaconByClick, bookid } = this.props;
    doBeaconByClick?.({ ext_data1: `${bookIndex}`, book_id: bookid, bigdata_contentid: '' });
    parents.loadUrl(openUrl);
    // 不阻止点击事件冒泡
    return false;
  };

  public render() {
    countReRender(this, 'PicText');
    const {
      picUrl,
      item_id: itemId,
      bookIndex,
      isUnlimited,
      bookid = 0,
      styles: { picViewStyle = {}, textViewStyle = {} } = {},
      leftTag,
    } = this.props;
    const leftTagConfig = FeedsUtils.getLeftTagStyle(leftTag, BigBookCoverLeftTagStyle);

    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: bookIndex === 0 && !isUnlimited ? 0 : 12,
          },
        ]}
        key={itemId}
        onClick={strictExposeReporter.triggerExpoCheck(this.handleClick)}
      >
        <View style={[styles.imageView, picViewStyle]}>
          <BookCover
            height={imageHeight}
            width={imageWidth}
            url={picUrl || FeedsIcon.novel_default_cover}
            bookID={bookid}
            radius={BookCoverRadiusStyle.NORMAL}
            sourceFrom={itemId}
            leftTag={leftTagConfig}
          />
        </View>
        <View style={[styles.textView, textViewStyle]}>
          {this.renderHeadBlock()}
          {this.renderMiddleBlock()}
          {this.renderBottomBlock()}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 12,
  },
  imageView: {
    width: imageWidth,
    height: imageHeight,
    marginRight: 12,
  },
  textView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  textHead: {
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  textTitle: {
    flex: 3,
    fontSize: FeedsUIStyle.T3_4,
    fontFamily: 'PingFangSC-Regular',
    colors: FeedsTheme.SkinColor.N1,
    lineHeight: 24,
  },
  textScoreBlock: {
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  textScore: {
    fontWeight: 'bold',
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N3,
    lineHeight: 24,
  },
  textIntro: {
    flex: 1,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_4,
    lineHeight: FeedsUIStyle.T4,
  },
  middleClassification: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  textMiddleClassification: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_4,
    lineHeight: FeedsUIStyle.T3,
    marginRight: 8,
  },
  textBottom: {
    height: FeedsUIStyle.FEEDSTEXTTAGVIEW_HEIGHT,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  textBottomLeft: {
    flex: 1,
    height: FeedsUIStyle.FEEDSTEXTTAGVIEW_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    overflow: 'hidden',
    paddingRight: 16,
  },
  textItem: {
    flexDirection: 'row',
  },
  bottomText: {
    fontSize: FeedsUIStyle.T1,
    height: FeedsUIStyle.FEEDSTEXTTAGVIEW_HEIGHT,
    lineHeight: FeedsUIStyle.FEEDSTEXTTAGVIEW_HEIGHT,
    marginRight: 8,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  bottomText_0: {
    colors: FeedsTheme.SkinColor.N4,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  bottomText_2: {
    colors: FeedsTheme.SkinColor.N7,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  bottomText_1: {
    colors: FeedsTheme.SkinColor.N5,
  },
  bottomTextOnlyOneline: {
    colors: FeedsTheme.SkinColor.N1_4,
  },
  onlyOnelineSpliter: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_8,
    lineHeight: FeedsUIStyle.T3,
    marginRight: 8,
  },
  tagSpliter: {
    colors: FeedsTheme.SkinColor.N1_8,
  },
  textBtn: {
    position: 'absolute',
    bottom: -20,
    right: -20,
    height: 50,
    width: 50,
    flexDirection: 'row',
  },
  btnImage: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    height: 12,
    width: 12,
  },
});
