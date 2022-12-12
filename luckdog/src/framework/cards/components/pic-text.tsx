import React from 'react';
import { View, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsIcon from '../../FeedsIcon';
import { getWidthHeight } from '../../utils/device';
import { strictExposeReporter } from '@/luckdog';
import { CommonProps } from '../../../entity';
import FeedsUtils from '../../FeedsUtils';
import { FeedsTheme, FeedsUIStyle } from '../../../feeds-styles/tab-22/components/utils';
import { KNOWLEDGE_INFINITE_CARD_KEY, SmallBookCoverLeftTagStyle } from '../../FeedsConst';
import { BookCoverRadiusStyle } from '../../../types/card';
import { BookCover } from '../../../components/book-font-cover';
import { BaseBook } from '@/framework/protocol';

const windowWidth = getWidthHeight().width;
const imageWidth = (windowWidth * 132) / 750;
const imageHeight = (imageWidth * 176) / 132;

interface Props extends CommonProps {
  bookInfo: BaseBook,
  styles?: Record<string, any>;
  cardKey?: string;
  hasButton?: boolean;
  bookIndex?: number;
  isUnlimited?: boolean;
  doBeaconByClick?: (...args) => void;
  /** 负反馈按钮 */
  onFeedBack?: () => void;
}

/** 图文卡 */
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
    const { bookInfo, styles: { scoreStyle = {}, titleStyle = {}, titleViewStyle = {} } = {} } = this.props;
    const { resourceName = '', score = '' } = bookInfo || {};

    return (
      <View style={[styles.textHead, titleViewStyle]}>
        <Text style={[styles.textTitle, titleStyle]} numberOfLines={1}>
          {resourceName}
        </Text>
        {
          !score ? null : (
            <View style={styles.textScoreBlock}>
              <Text style={[styles.textScore, scoreStyle]}>{score}</Text>
            </View>
          )
        }
      </View>
    );
  };

  /**
   * 渲染右侧中间简介和标签
   */
  public renderMiddleBlock = () => {
    const {
      bookInfo, cardKey, styles: { middleStyle = {}, middleViewStyle = {} } = {},
    } = this.props;
    const { brief = '', category = '', status = '', description = '' } = bookInfo || {};

    // 是否见识tab无限流
    const isKnowledgeInfinite = cardKey === KNOWLEDGE_INFINITE_CARD_KEY;
    // 显示分类和书籍连载状态
    const categoryStatus = category || status ? (
      <View style={[styles.middleClassification, middleStyle]}>
        {category ? <Text style={styles.textMiddleClassification}>{category}</Text> : null}
        {
          category && status ? (
            <Text style={[styles.textMiddleClassification, { colors: FeedsTheme.SkinColor.N1_8 }]}>|</Text>
          ) : null
        }
        {status ? <Text style={styles.textMiddleClassification}>{status}</Text> : null}
      </View>
    ) : null;

    return (
      <View style={middleViewStyle}>
        <Text style={styles.textIntro} numberOfLines={2}>
          {isKnowledgeInfinite ? description || brief : brief}
        </Text>
        {isKnowledgeInfinite ? null : categoryStatus}
      </View>
    );
  };

  /**
   * 渲染右侧底部推荐标签
   */
  public renderBottomBlock = () => {
    const { cardKey, bookInfo, hasButton = true, onFeedBack = () => null } = this.props;
    const { author = '', hot = '', reason = [], resourceId = '' } = bookInfo;

    let bottomText: any = null;
    // 是否见识tab无限流
    const isKnowledgeInfinite = cardKey === KNOWLEDGE_INFINITE_CARD_KEY;
    // 见识tab底部显示作者
    const konwledgeAuthor = <Text style={styles.textIntro} numberOfLines={1}>{author}</Text>;
    // 没有推荐理由的时候显示作者、二级分类和热度
    const noReasonBottomTxt = author || hot ? (
      <View style={styles.textBottomLeft}>
        {author ? <Text style={[styles.bottomText, styles.bottomText_0]}>{author}</Text> : null}
        {hot ? <Text style={[styles.bottomText, styles.bottomText_2]}>{hot}</Text> : null}
      </View>
    ) : null;
    // 有推荐理由的时候显示推荐理由
    const reasonBottomTxt = <View style={styles.textBottomLeft}>
      {
        reason.map((reason, index) => <Text
          key={`${resourceId}_${index}`}
          style={[styles.bottomText, styles[`bottomText_${index}`]]}
          numberOfLines={1}
        >{reason}</Text>)
      }
    </View>;

    if (reason?.length) {
      bottomText = isKnowledgeInfinite ? konwledgeAuthor : reasonBottomTxt;
    } else {
      bottomText = isKnowledgeInfinite ? konwledgeAuthor : noReasonBottomTxt;
    }

    return bottomText ? (
      <View style={styles.textBottom}>
        {bottomText}
        {hasButton ? (<View style={styles.textBtn} onClick={onFeedBack}>
          <Image
            style={styles.btnImage}
            source={{ uri: FeedsIcon.closeBtn }}
          />
        </View>) : null}
      </View>
    ) : null;
  };

  public handleClick = () => {
    const { bookIndex, doBeaconByClick, bookInfo } = this.props;
    doBeaconByClick?.({
      ext_data1: bookIndex,
      book_id: bookInfo.resourceId,
      bigdata_contentid: '',
    });
    bookInfo.jumpUrl && FeedsUtils.doLoadUrl(bookInfo.jumpUrl);
    // 不阻止点击事件冒泡
    return false;
  };

  public render() {
    countReRender(this, 'PicText');
    const {
      bookIndex, isUnlimited, bookInfo,
      styles: { textViewStyle = {} } = {},
    } = this.props;
    const { picUrl = '', tag, resourceId } = bookInfo;

    let leftTag: any = undefined;
    if (tag) {
      leftTag = FeedsUtils.getBookTagStyle(tag, SmallBookCoverLeftTagStyle);
    }
    return (
      <View
        style={[styles.container, {
          paddingTop: bookIndex === 0 && !isUnlimited ? 0 : 12,
        }]}
        key={`item_${resourceId}`}
        onClick={strictExposeReporter.triggerExpoCheck(this.handleClick)}
      >
        <BookCover
          height={imageHeight}
          width={imageWidth}
          url={picUrl}
          bookID={resourceId}
          radius={BookCoverRadiusStyle.SMALL}
          sourceFrom={resourceId}
          leftTag={leftTag}
        />
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
  textView: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 12,
  },
  textHead: {
    flex: 1,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  textTitle: {
    flex: 3,
    fontSize: FeedsUIStyle.T3_4,
    fontFamily: 'PingFangSC-Regular',
    colors: FeedsTheme.SkinColor.N1,
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
    flex: 1,
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
  bottomText: {
    fontSize: FeedsUIStyle.T1,
    height: FeedsUIStyle.FEEDSTEXTTAGVIEW_HEIGHT,
    lineHeight: FeedsUIStyle.FEEDSTEXTTAGVIEW_HEIGHT,
    marginRight: 8,
  },
  bottomText_0: {
    colors: FeedsTheme.SkinColor.N4,
  },
  bottomText_2: {
    colors: FeedsTheme.SkinColor.N7,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  bottomText_1: {
    colors: FeedsTheme.SkinColor.N5,
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
    bottom: 23,
    right: 23,
    height: 12,
    width: 12,
  },
});
