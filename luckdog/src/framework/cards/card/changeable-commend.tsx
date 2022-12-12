/* eslint-disable @typescript-eslint/prefer-for-of */
import React from 'react';
import { View, Text, StyleSheet } from '@tencent/hippy-react-qb';
import { CommonProps } from '../../../entity';
import { BeaconReportProps, reportUDS, BusiKey, strictExposeReporter } from '@/luckdog';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { FeedsLineHeight, FeedsTheme, FeedsUIStyle } from '../../../feeds-styles/tab-22/components/utils';
import { scale } from '../../../components/animationStyle';
import { CommonCardStyle, SmallBookCoverLeftTagStyle } from '../../FeedsConst';
import { Title } from '../components/title';
import { RefreshCard, CardLayout } from '../../protocol/card';
import { shouldComponentUpdate } from '@/luckbox';
import FeedsUtils from '../../FeedsUtils';
import { BookCoverRadiusStyle } from '../../../types/card';
import { BookCover } from '../../../components/book-font-cover';
import { BaseBook, UIType } from '../../protocol';

interface Props extends BeaconReportProps, CommonProps {
  index: number;
  key: string;
  globalConf: any;
  totalLength: number;
  curTabId: number;
  data: RefreshCard;
}
// 默认一屏展示的书籍数
// const DEFAULT_PER_NUMBER = 8;

const { width } = FeedsUtils.getScreen();
const IMAGE_WIDTH = (width - (12 * 2) - (16 * 2) - (26 * 3)) / 4;
const IMAGE_HEIGHT = (IMAGE_WIDTH * 81) / 60;

interface State {
  /** 页面所在位置 */
  position: number;
  /** 当前页书籍内容 */
  books: [];
}

/** 支持可换一换多行推荐卡 */
@FeedsProtect.protect
export class ChangeableComment extends React.Component<Props> {
  public static getRowType() {
    return UIType.CHANGEABLE_COMMEND;
  }
  /** 点击动画效果 */
  public scaleAnim = scale(200, 1.015);
  /** 当前页面状态 */
  public state: State = {
    position: 0,
    books: [],
  };

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'changeableCommend');
  }

  /** 计算布局 */
  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.height);
  };

  /**
   * 切换猜你想看 换一换
   */
  public switchNovel = () => {
    const { position } = this.state;
    const { data } = this.props;
    const { pageList } = data;
    const pageIndex = pageList?.length - 1 || 0;
    let newPosition = position;
    if (pageIndex > 0) {
      newPosition = newPosition >= pageIndex ? 0 : newPosition += 1;
    }
    this.setState({
      position: newPosition,
    });

    this.reportUDS(BusiKey.CLICK__CARD_CHANGE);
  };

  public onBookItemLayout = (event, tabIndex, bookIndex, bookId, rowIndex) => {
    const { height } = event.layout;
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      tabIndex,
      bookIndex,
      bookId,
      rect: {
        ...event.layout,
        y: (height + styles.item.marginBottom) * rowIndex,
      },
    });
  };

  /**
   * 点击书籍
   * @param {*} book 书籍
   * @param {*} index 书籍下标
   */
  public handleClick = (book) => {
    const { resourceId = '', jumpUrl } = book || {};
    FeedsUtils.doLoadUrl(jumpUrl, `${this.props.curTabId}`);
    this.reportUDS(BusiKey.CLICK__CARD_BOOK, { book_id: resourceId });
  };

  /** 按照页码渲染页面内容 */
  public renderPage = () => {
    const view: any[] = [];
    const { data, index: cardIndex } = this.props;
    const { pageList, isRow } = data;
    const { position } = this.state;
    const currentPage = pageList[position] || [];

    const bookIds = currentPage.reduce((acc: string[], page): string[] => {
      const ids = page.dataList.map(({ resourceId }) => resourceId);
      return [...acc, ...ids];
    }, []);
    strictExposeReporter.updateBookIds(cardIndex, 0, bookIds);

    for (let i = 0; i < currentPage.length; i++) {
      const cardLayout = currentPage[i];
      const bookIndexBase = (currentPage[i - 1]?.dataList?.length || 0) * i;
      view.push(<View
        key={`${position}_${i}`}
      >
        {
          this.renderBook(cardLayout, bookIndexBase, i)
        }
      </View>);
    }

    return <View
      style={{
        flexDirection: isRow ? 'row' : 'column',
      }}
    >
      {view}
    </View>;
  };

  /** 渲染具体页面内容 */
  public renderBook = (cardLayout: CardLayout<BaseBook>, bookIndexBase: number, rowIndex: number) => {
    const { dataList, isRow } = cardLayout;
    const view: any[] = [];
    for (let i = 0; i < dataList.length; i++) {
      const book = dataList[i];
      const { resourceId, score, picUrl = '', tag, resourceName } = book;
      let leftTag: any = undefined;
      if (tag) {
        leftTag = FeedsUtils.getBookTagStyle(tag, SmallBookCoverLeftTagStyle);
      }
      view.push(<View
        style={styles.item}
        key={resourceId}
        onLayout={e => this.onBookItemLayout(e, 0, bookIndexBase + i, resourceId, rowIndex)}
        onClick={strictExposeReporter.triggerExpoCheck(() => this.handleClick(book))}
      >
        <View>
          <BookCover
            height={IMAGE_HEIGHT}
            width={IMAGE_WIDTH}
            url={picUrl}
            bookID={resourceId}
            radius={BookCoverRadiusStyle.SMALL}
            sourceFrom={resourceId}
            leftTag={leftTag}
          />
          <Text style={styles.bookName} numberOfLines={2}>
            {resourceName}
          </Text>
        </View>
        {
          score ? <View style={styles.textScoreBlock}>
            <Text style={styles.textScore}>{score}</Text>
          </View> : null
        }
      </View>);
    }
    return <View
      style={{
        flexDirection: isRow ? 'row' : 'column',
      }}
    >
      {view}
    </View>;
  };


  public render() {
    const { data } = this.props;
    const { title, pageList } = data;
    if (!pageList || pageList.length === 0) return null;

    return (
      <View style={[{ ...CommonCardStyle }, { transform: [{ scale: this.scaleAnim }] }]}>
        <View collapsable={false}>
          <Title
            title={title}
            onLayout={this.onTitleLayout}
            changeable={true}
            switchNovel={this.switchNovel}
            parent={this}
          />
        </View>
        <View style={styles.wrap}>
          {
            this.renderPage()
          }
        </View>
      </View>
    );
  }

  private reportUDS = (eventKey: BusiKey, moreData = {}) => {
    const { reportInfo, uiType } = this.props.data || {};
    reportUDS(eventKey, {}, { ...reportInfo, bigdata_contentid: '', ui_type: uiType, ...moreData });
  };
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 3,
    paddingRight: 3,
  },

  item: {
    marginLeft: 13,
    marginRight: 13,
    width: IMAGE_WIDTH,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  textScoreBlock: {
    flexDirection: 'row',
  },
  textScore: {
    fontFamily: 'PingFangSC-Semibold',
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N3,
    fontWeight: 'bold',
    lineHeight: FeedsLineHeight.T1,
  },
  bookName: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
    marginBottom: 2,
    marginTop: 4,
  },
});


