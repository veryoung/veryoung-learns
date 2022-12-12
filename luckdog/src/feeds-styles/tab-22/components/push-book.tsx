/* eslint-disable @typescript-eslint/member-ordering */
/**
 * @Author: veryoungwan
 * 追更书籍组件
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { CommonProps, Layout } from '../../../entity';
import FeedsTheme from '../../../framework/FeedsTheme';
import { FeedsUIStyle } from '../../../framework/FeedsConst';
import FeedsUtils from '../../../framework/FeedsUtils';
import { activeEventObserver, deActiveEventObserver } from '../../../utils/NativeEventAdapter';
import FeedsProtect from '../../../mixins/FeedsProtect';

/** 追更书籍内容 */
export interface PushBookItem {
  /** 书封 */
  sPicUrl: string;
  /** 书名 */
  sTitle: string;
  /** 跳转地址 */
  sUrl: string;
  /** 追更提示 */
  sContent: string;
  /** 书籍id */
  sBookId: string
}

interface PushBookProps extends CommonProps {
  /** 标题 */
  pushBooks: PushBookItem[];
  /** 容器宽度 */
  contentWidth?: number
  /** 滑动 */
  pushBookSlide?: (bookId: string) => void
  /** 点击 */
  pushBookClick?: (bookId: string, index: number) => void
}

@FeedsProtect.protect
export class PushBook extends React.Component {
  /** 滑动标识 */
  private scrollFlag = true;
  /** 当前滑动的索引 */
  private currentIndex = 0 ;
  /** 容器宽度 */
  private containerWidth;
  /** 滑动实例  */
  private scrollView;
  /** 轮播图的数量 */
  private multiPicsSize = 0;
  /** 轮播定时器 */
  private timer;
  /** 当前生命周期内已经上报过的书籍ID */
  private alreadyBookIds: string[] = [];

  public props!: PushBookProps;
  public state: {
    currentIndex: number;
  };


  public constructor(props: any) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PushBook');
    this.state = {
      currentIndex: 0,
    };
    this.containerWidth = props.contentWidth;
    activeEventObserver.addEventObserver(() => {
      // 触发页面显示状态
      this.startInterVal();
    });
    deActiveEventObserver.addEventObserver(() => {
      if (this.timer) clearInterval(this.timer);
    });
  }

  public componentDidMount() {
    // 默认第一次需要曝光
    this.slide();
    this.startInterVal();
  }

  public componentWillUnmount() {
    clearInterval(this.timer);
  }

  public startInterVal = () => {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.scrollFlag) return;

      this.currentIndex += 1;
      if (this.currentIndex >= this.multiPicsSize) {
        this.currentIndex = 0;
      }
      this.setState({
        currentIndex: this.currentIndex,
      }, () => {
        this.loopScroll();
      });
    }, 6000);
  };

  public clickBook = (bookId, index) => {
    const { pushBookClick } = this.props;
    pushBookClick?.(bookId, index);
  };

  public slide = () => {
    // 上报滑动事件
    const { pushBookSlide, pushBooks } = this.props;
    const currentBookId = pushBooks[this.currentIndex]?.sBookId;
    if (this.alreadyBookIds.includes(currentBookId)) return;
    this.alreadyBookIds.push(currentBookId);
    pushBookSlide?.(currentBookId);
  };

  public render() {
    countReRender(this, 'PushBook');
    const carousel = this.renderCarousel();
    const slideSpots = this.getSlideSpots();
    return (
      <View
        style={styles.box}
        onLayout={this.props.onLayout}
      >
        <ScrollView
          onLayout={(event) => {
            const { layout } = event;
            this.setScrollWidth(layout);
          }}
          onMomentumScrollBegin={() => {
            this.scrollFlag = false;
          }}
          onMomentumScrollEnd={() => {
            this.scrollFlag = true;
          }}
          onScrollEndDrag={e => this.onScrollEndDrag(e)}
          onTouchDown={() => {
            this.scrollFlag = false;
          }}
          onTouchEnd={() => {
            this.scrollFlag = true;
          }}
          ref={(ref) => {
            this.scrollView = ref;
          }}
          style={{ width: this.containerWidth }}
          horizontal
          pagingEnabled
          scrollEnabled={this.multiPicsSize > 1}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.carouselContainer}>{carousel}</View>
        </ScrollView>
        {this.multiPicsSize === 1 ? null : (
          <View
            style={styles.spotContainer}
            pointerEvents="none"
          >
            {slideSpots}
          </View>
        )}
      </View>
    );
  }

  /** 滑动行为结束处理事件 */
  public onScrollEndDrag = (e) => {
    const currentOffsetX = this.containerWidth * this.currentIndex;
    const offsetX = e.contentOffset.x - currentOffsetX;
    // 右滑大于0并且绝对距离小于宽度的5分之一
    // 左滑小于0并且绝对距离大于宽度的5分之一
    const isOverRightFlow = offsetX > 0 && offsetX < this.containerWidth / 5;
    const isOverLeftFlow = offsetX < 0 && offsetX > -this.containerWidth / 5;
    if (isOverRightFlow || isOverLeftFlow) {
      this.setState({
        currentIndex: this.currentIndex,
      }, () => {
        this.scrollFlag = true;
        this.startInterVal();
        this.scrollView?.scrollTo?.({ x: this.containerWidth * this.currentIndex, y: 0, animated: true });
      });
      return;
    }
    if (offsetX > 0) {
      this.currentIndex += 1;
      if (this.currentIndex === this.multiPicsSize) this.currentIndex = 0;
    } else {
      this.currentIndex -= 1;
      if (this.currentIndex < 0) this.currentIndex = 0;
    }
    this.setState({
      currentIndex: this.currentIndex,
    }, () => {
      this.scrollFlag = true;
      this.startInterVal();
      this.slide();
      this.scrollView?.scrollTo?.({ x: this.containerWidth * this.currentIndex, y: 0, animated: true });
    });
  };

  /** 去阅读 */
  private goRead = (bookId, url, index) => {
    const { itemBean } = this.props;
    clearInterval(this.timer);
    this.clickBook(bookId, index);
    FeedsUtils.doLoadUrl(url, itemBean?.tab_id, false, itemBean);
  };
  /** 渲染轮播内容  */
  private renderCarousel = () => {
    const { pushBooks } = this.props;
    this.multiPicsSize = pushBooks.length;

    return pushBooks.map((ele: PushBookItem, index: number) => {
      const { sTitle, sBookId, sContent, sPicUrl, sUrl } = ele;
      return <View
        key={`${sBookId}${index}`}
        style={[styles.item, {
          width: this.containerWidth,
        }]}
        onClick ={() => {
          this.goRead(sBookId, sUrl, index);
        }}
      >
        <View style={styles.tips}>
          <Text style={styles.tipsContext}>追</Text>
          <Text style={styles.tipsContext}>更</Text>
          <Text style={styles.tipsContext}>速</Text>
          <Text style={styles.tipsContext}>递</Text>
        </View>
        <View style={styles.content}>
          <Image
            key={sBookId}
            style={styles.pic}
            reportData={{ sourceFrom: '' }}
            source={{ uri: sPicUrl }}
          />
          <View style={styles.bookInfo}>
            <Text numberOfLines={1} style={styles.bookTitle}>{sTitle}</Text>
            <Text numberOfLines={1} style={styles.bookTips}>{sContent}</Text>
          </View>
          <View
            style={styles.btn}
          >
            <Text style={styles.btnText}>立即追更</Text>
          </View>
        </View>
      </View>;
    });
  };

  /** 渲染轮播点 */
  private getSlideSpots = () => {
    const slideSpots: any = [];
    for (let index = 0; index < this.multiPicsSize; index += 1) {
      if (index === this.state.currentIndex) {
        slideSpots.push(<View
          key={index}
          style={styles.slideSpotSelected}
        />);
      } else {
        slideSpots.push(<View key={index} style={styles.slideSpot} />);
      }
    }
    return slideSpots;
  };

  /** 循环播放 */
  private loopScroll() {
    this.scrollView?.scrollTo?.({ x: this.containerWidth * this.currentIndex, y: 0, animated: true });
  }

  /** 设置轮播的宽度 */
  private setScrollWidth = (layout: Layout) => {
    const { width } = layout;
    this.containerWidth = width;
  };
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColors: FeedsTheme.SkinColor.D2_1,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tips: {
    backgroundColors: FeedsTheme.SkinColor.B5_1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    flexDirection: 'column',
  },
  tipsContext: {
    marginVertical: 1,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.B5,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pic: {
    width: 36,
    height: 48,
    marginHorizontal: 8,
    borderRadius: 4,
  },
  bookInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 28,
    backgroundColors: FeedsTheme.SkinColor.N2,
    borderRadius: 14,
    marginHorizontal: 16,
  },
  btnText: {
    height: 28,
    lineHeight: 28,
    paddingHorizontal: 12,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1,
  },
  bookTitle: {
    lineHeight: 20,
    fontSize: FeedsUIStyle.T3,
    colors: FeedsTheme.SkinColor.N1,
  },
  bookTips: {
    lineHeight: 16,
    marginTop: 3,
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1_4,
  },
  spotContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideSpot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColors: ['transparent'],
    marginHorizontal: 3,
    borderWidth: 0.5,
    borderColors: FeedsTheme.SkinColor.N1_1,
  },
  slideSpotSelected: {
    width: 6,
    height: 6,
    borderRadius: 6,
    marginHorizontal: 3,
    backgroundColors: FeedsTheme.SkinColor.N1_1,
  },
});


