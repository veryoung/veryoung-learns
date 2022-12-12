import React from 'react';
import { ScrollView, View, Text, StyleSheet } from '@tencent/hippy-react-qb';

import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsTheme from '../../framework/FeedsTheme';
import { BusiKey, reportUDS, strictExposeReporter } from '@/luckdog';
import { emitter, events } from '../../utils/emitter';
import FeedsUtils from '../../framework/FeedsUtils';
import { TagsBgColors } from '../../framework/FeedsConst';
import { FeedsViewUIStyle437Props } from './__tests__/mocks/ui-style-437';

/** 新协议结构类型 */
type UICard437Type = typeof FeedsViewUIStyle437Props;
type Classify = typeof FeedsViewUIStyle437Props.classifyList[0];

interface CompProps {
  /** 第几刷数据 */
  index: number;
  /** 当前tabid */
  selectTabID: number;
  /** 卡片后台数据 */
  itemBean: {
    parsedObject?: {
      sData: UICard437Type; // 新协议结构
    }
  };
}

/**
 * 新分类导航卡片（不带书籍）
 * 设计稿: https://codesign.woa.com/s/na4Jd0NeeK9AMkb
 */
@FeedsProtect.protect
export default class FeedsViewUIStyle437 extends React.Component<CompProps> {
  private navScrollView: any = null;

  public componentDidMount() {
    emitter.on(events.REFRESH_COMPLETE, this.onTabRefresh);
  }

  public componentWillUnmount() {
    emitter.off(events.REFRESH_COMPLETE, this.onTabRefresh);
  }

  public shouldComponentUpdate(nextProps: CompProps) {
    const { classifyList = [] } = this.props.itemBean.parsedObject?.sData || {};
    const { classifyList: nextClassifyList = [] } = nextProps.itemBean.parsedObject?.sData || {};
    const classifyIds = classifyList.map(item => item?.id).join(',');
    const nextClassifyIds = nextClassifyList.map(item => item?.id).join(',');
    return classifyIds !== nextClassifyIds;
  }

  public render() {
    const { itemBean } = this.props;
    const { classifyList = [] } = itemBean.parsedObject?.sData || {};
    const baseBgIdx = Math.floor(Math.random() * TagsBgColors.length);
    return <ScrollView
      ref={(ref) => {
        this.navScrollView = ref;
      }}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={10}
      contentContainerStyle={styles.navWrapper}
      onLayout={this.onLayout}
    >
      {classifyList.map((item, index) => this.renderNavView(item, index, baseBgIdx))}
    </ScrollView>;
  }

  /** 刷新当前tab */
  private onTabRefresh = () => {
    this.navScrollView?.scrollTo({ x: 0, y: 0, animated: true });
  };

  /** 渲染单个导航 */
  private renderNavView = (item: Classify, index: number, baseBgIdx: number) => {
    const { name, jumpUrl } = item;
    return <View
      key={`${name}_${index}`}
      style={[
        styles.navView,
        {
          backgroundColors: TagsBgColors[(baseBgIdx + index) % 5],
          marginLeft: index === 0 ? 0 : 12,
        },
      ]}
      onClick={() => this.jumpClassifyPage(jumpUrl, index)}>
      <Text style={styles.navName}>{name}</Text>
    </View>;
  };

  /** 卡片layout，准备卡片的精准曝光 */
  private onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  /** 点击分类跳转 */
  private jumpClassifyPage = (jumpUrl: string, index: number) => {
    const { selectTabID, itemBean } = this.props;
    const { reportInfo } = itemBean.parsedObject?.sData || {};
    reportUDS(BusiKey.CLICK__CARD_TAB, {}, {
      ...reportInfo,
      ext_data1: `${index}`,
    }); // 点击上报
    FeedsUtils.doLoadUrl(jumpUrl, `${selectTabID}`);
  };
}

const styles = StyleSheet.create({
  navWrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  navView: {
    height: 28,
    backgroundColors: FeedsTheme.SkinColor.A8,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navName: {
    fontSize: 14,
    colors: FeedsTheme.SkinColor.A1,
    textAlign: 'center',
  },
});
