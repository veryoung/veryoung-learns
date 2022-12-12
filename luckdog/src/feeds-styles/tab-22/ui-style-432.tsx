import React from 'react';
import { View, Text, Image, StyleSheet, PixelRatio, Animation } from '@tencent/hippy-react-qb';

import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsIcon from '../../framework/FeedsIcon';
import FeedsTheme from '../../framework/FeedsTheme';
import { getWidthHeight } from '../../framework/utils/device';
import { reportUDS, BusiKey } from '@/luckdog';
import FeedsUtils from '../../framework/FeedsUtils';
import { getDeviceVisitor } from '@/luckbox';
import { BookCoverRadiusStyle } from '../../types/card';
import { SmallBookCoverLeftTagStyle } from '../../framework/FeedsConst';
import { BookCover } from '../../components/book-font-cover';

/** 屏幕宽度 */
const windowWidth = getWidthHeight().width;
/** 跟随无限流点击的书封面图宽度 */
const bigImageWidth = (windowWidth * 132) / 750;
/** 整个卡片宽度 */
const contentWidth = windowWidth - 24 - 32;
/** 图片高度 */
const bookPicHeight = 64;
/** 行间距 */
const rowSpacing = 16;
/** 列间距 */
const columnSpacing = 35;

interface CompProps {
  curTabId: number;
  mpReportInfo?: { [key: string]: string };
  cardData: any;
  onBookItemLayout?: (event, bookIndex, bookInfo) => void;
}

/**
 * 无限流中插卡
 * 设计稿: https://codesign.woa.com/s/XgRxnjPM8E9Lmqr
 */
@FeedsProtect.protect
export default class FeedsViewUIStyle432 extends React.Component<CompProps> {
  private animation: Animation | null = null;

  public constructor(props) {
    super(props);
    if (getDeviceVisitor().isAdr()) {
      this.animation = new Animation({
        startValue: 0,
        toValue: 0,
        duration: 400,
        delay: 0,
        mode: 'timing',
        timingFunction: 'ease-out',
      });
    }
  }

  public componentDidMount() {
    getDeviceVisitor().isAdr() && this.exeCuteAnimation();
  }

  public componentWillUnmount() {
    getDeviceVisitor().isAdr() && this.animation?.destroy();
  }

  public render() {
    const animationStyle = getDeviceVisitor().isAdr() ? {
      zIndex: 1,
      height: this.animation,
    } : {};
    return <View style={[styles.container, animationStyle]}>
      {this.renderTopLine()}
      {this.renderTitle()}
      {this.renderContent()}
      {this.renderBottomLine()}
    </View>;
  }

  /** 执行动画 */
  private exeCuteAnimation = () => {
    const { layoutList = [] } = this.props.cardData || {};
    // 【2行2列】或者【1列3行】两种样式的行数
    const rowNum = layoutList.length === 1 ? (layoutList[0]?.dataList?.length || 0) : layoutList.length;
    // 书籍区域总高度
    const booksContentHeight = (bookPicHeight * rowNum) + (rowSpacing * (rowNum - 1));
    // 顶线高度 + 标题高度 + 标题上下间距 + 书籍区域总高度 + 底线高度
    const toValueHeight = 4 + 20 + 28 + booksContentHeight + 20;
    this.animation?.updateAnimation({
      startValue: 0,
      toValue: toValueHeight,
    });
    this.animation?.start();
  };

  /** 顶部线 */
  private renderTopLine = () => <View style={styles.lineWrap}>
    <View style={styles.leftLine} />
    <View style={styles.arrowWrap}>
      <View style={styles.upArrow} />
      <View style={styles.upArrowInner} />
    </View>
    <View style={styles.rightLine} />
  </View>;

  /** 底部线 */
  private renderBottomLine = () => <View style={[styles.line, { marginTop: 16, marginBottom: 4 }]} />;

  /** 标题渲染 */
  private renderTitle = () => {
    const { title = '' } = this.props.cardData;
    return <View style={styles.topTitleWrap}>
      <Image source={{ uri: FeedsIcon.redLoveIcon }} style={styles.topTitleIcon} />
      <Text style={styles.topTitleTxt}>{title}</Text>
    </View>;
  };

  /** 内容容器渲染 */
  private renderContent = () => {
    const { isRow, layoutList = [] } = this.props.cardData;
    // 容器样式
    const contentStyle = isRow ? styles.row : styles.column;
    // layout之间的上下间距
    const layoutVerticalSpacing = rowSpacing;
    // 每个layout宽度（这里没有需要考虑左右间距的样式）
    const layoutWidth = isRow ? contentWidth / layoutList.length : contentWidth;
    return <View style={[contentStyle, { width: contentWidth }]}>
      {
        layoutList.map((layoutItem, idx) => {
          const spacingStyle = isRow ? { marginLeft: 0 } : { marginTop: layoutVerticalSpacing };
          return <View key={idx} style={idx > 0 ? spacingStyle : {}}>
            {this.renderLayout(layoutItem, layoutWidth, idx)}
          </View>;
        })
      }
    </View>;
  };

  /** 外层layout渲染 */
  private renderLayout = (layoutItem, layoutWidth, layoutIdx) => {
    const { isRow, dataList = [] } = layoutItem || {};
    // layout样式
    const layoutStyle = isRow ? styles.row : styles.column;
    // item之间的左右间距
    const itemHorizontalSpacing = columnSpacing;
    // item之间的上下间距
    const itemVerticalSpacing = rowSpacing;
    // 每个item宽度
    const itemWidth = isRow ? (layoutWidth - itemHorizontalSpacing) / dataList.length : layoutWidth;
    // 一行多个，则是小卡片
    const isSmallCard = isRow && dataList.length > 1;
    return <View style={[layoutStyle, { width: layoutWidth }]}>
      {
        dataList.map((dataItem, idx) => {
          const spacingStyle = isRow ? { marginLeft: itemHorizontalSpacing } : { marginTop: itemVerticalSpacing };
          return <View
            key={dataItem?.resourceId} style={idx > 0 ? spacingStyle : {}}
            onLayout={event => this.onBookItemLayout(event, dataItem, layoutIdx)}
          >
            {this.renderBook(dataItem, isSmallCard, itemWidth)}
          </View>;
        })
      }
    </View>;
  };

  /** 书籍Item的layout */
  private onBookItemLayout = (event, dataItem, layoutIdx) => {
    const { bookIndex, resourceId } = dataItem;
    // 对于多行的情况，手动更新y值为相对于最外层卡片的y值
    if (layoutIdx > 0 && event) {
      // eslint-disable-next-line no-param-reassign
      event.layout = {
        ...event.layout,
        y: layoutIdx * (bookPicHeight + rowSpacing),
      };
    }
    this.props.onBookItemLayout?.(event, bookIndex, {
      // TODO: 新协议完全迁移完毕之后可以删掉 sBookId
      sBookId: resourceId,

      // 兼容新旧协议，新协议 resourceId，旧协议用 sBookId
      resourceId,
      fromInsertCard: true });
  };

  /** 书籍渲染 */
  private renderBook = (dataItem, isSmallCard, itemWidth) => {
    const {
      resourceName = '', picUrl = '', score = '', category = '', status = '', resourceId = '', tags,
    } = dataItem || {};
    const leftTagStyle = FeedsUtils.getLeftTagStyle(tags, SmallBookCoverLeftTagStyle);
    return <View
      style={[styles.bookCard, { width: itemWidth }]}
      onClick={() => this.clickBook(dataItem)}
    >
      <BookCover
        height={bookPicHeight}
        width={48}
        url={picUrl}
        bookID={resourceId}
        radius={BookCoverRadiusStyle.BIG}
        sourceFrom={resourceId}
        leftTag={leftTagStyle}
      />
      <View style={styles.txtWrapper}>
        <Text
          style={[styles.bookTitle, isSmallCard ? { lineHeight: 20 } : { height: 20, lineHeight: 20 }]}
          numberOfLines={isSmallCard ? 2 : 1}
        >{resourceName}</Text>
        {
          isSmallCard ? null : (
            <View style={styles.descInfo}>
              <Text style={styles.descTxt}>{category}</Text>
              <View style={styles.verticalLine} />
              <Text style={styles.descTxt}>{status}</Text>
            </View>
          )
        }
        <Text style={styles.bookScore}>{`${score}分`}</Text>
      </View>
    </View>;
  };

  /** 书籍卡片点击 */
  private clickBook = (dataItem) => {
    const { cardData } = this.props;
    const { resourceId, jumpUrl } = dataItem || {};
    if (resourceId && jumpUrl) {
      reportUDS(BusiKey.CLICK__CARD_BOOK, {}, {
        ...cardData?.reportInfo,
        bigdata_contentid: '',
        book_id: resourceId,
      });
      FeedsUtils.doLoadUrl(jumpUrl, `${this.props.curTabId}`);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    flexDirection: 'column',
  },
  lineWrap: {
    width: contentWidth,
    height: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  leftLine: {
    width: (bigImageWidth / 2) - 2,
    borderStyle: 'solid',
    borderWidth: 1 / PixelRatio.get(),
    borderColors: FeedsTheme.SkinColor.N1_6,
  },
  arrowWrap: {
    width: 4,
    height: 4,
  },
  upArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColors: FeedsTheme.SkinColor.N1,
    opacity: 0.1,
    position: 'absolute',
    zIndex: 10,
    top: 0,
    left: 0,
  },
  upArrowInner: {
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColors: FeedsTheme.SkinColor.D2_1,
    position: 'absolute',
    zIndex: 11,
    top: 1,
    left: 1,
  },
  rightLine: {
    width: contentWidth - (bigImageWidth / 2) - 4,
    borderStyle: 'solid',
    borderWidth: 1 / PixelRatio.get(),
    borderColors: FeedsTheme.SkinColor.N1_6,
    marginLeft: 3,
  },
  line: {
    borderStyle: 'solid',
    borderWidth: 1 / PixelRatio.get(),
    borderColors: FeedsTheme.SkinColor.N1_6,
  },
  topTitleWrap: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTitleIcon: {
    width: 20,
    height: 20,
  },
  topTitleTxt: {
    marginLeft: 6,
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1,
  },
  bookCard: {
    flexDirection: 'row',
    jusifyContent: 'flex-start',
  },
  bookTitle: {
    fontSize: 14,
    colors: FeedsTheme.SkinColor.N1,
  },
  bookScore: {
    fontWeight: 'bold',
    fontSize: 12,
    colors: FeedsTheme.SkinColor.N3,
    marginTop: 4,
    height: 16,
    lineHeight: 16,
  },
  txtWrapper: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  descInfo: {
    flexDirection: 'row',
    marginTop: 4,
    alignItems: 'center',
    height: 16,
    lineHeight: 16,
  },
  descTxt: {
    fontSize: 12,
    colors: FeedsTheme.SkinColor.N1_4,
  },
  verticalLine: {
    width: 1 / PixelRatio.get(),
    height: 10,
    opacity: 0.2,
    backgroundColors: FeedsTheme.SkinColor.N1,
    marginHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
});
