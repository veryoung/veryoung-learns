// 选择阅读喜好
import React from 'react';
import { View, Text, Image, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsViewItem from '../FeedsViewItem';
import FeedsViewContainer from '../common/FeedsViewContainer';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedIcon from '../../framework/FeedsIcon';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { FeedsUIStyle } from '../../framework/FeedsConst';
import { FeedsTheme } from './components/utils';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { CommonProps } from '../../entity';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 0,
    marginTop: FeedsUIStyle.FEEDS_CARD_MARGIN_VERTICAL,
    height: 52,
    borderRadius: 8,
    backgroundColors: FeedsTheme.SkinColor.N2_1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagTitle: {
    fontSize: FeedsUIStyle.T2,
    colors: FeedsTheme.SkinColor.N1,
    alignSelf: 'center',
    paddingVertical: 16,
  },
  iconView: {
    width: 12,
    height: 12,
    alignSelf: 'center',
  },
});

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle407 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 407;
  }

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle407');
  }

  public handleClick = (url) => {
    reportUDS(BusiKey.CLICK__CARD, this.props);
    super.onClick(url);
  };

  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle407');
    const { itemBean = {} } = this.props;
    const { title, url } = itemBean;
    if (!title || !url) return null;
    return (
      <FeedsViewContainer
        onLayout={this.onLayout}
        parentProps={this.props}
        noPressState
        noPadding
      >
        <View
          style={styles.container}
          onClick={() => this.handleClick(url)}
        >
          <Text style={styles.tagTitle}>{title}</Text>
          <Image
            style={styles.iconView}
            source={{ uri: FeedIcon.arrow }}
            noPicMode={{ enable: false }}
            tintColors={styles.tagTitle.colors}
            reportData={{ sourceFrom: itemBean.item_id }}
          />
        </View>
      </FeedsViewContainer>
    );
  }
}
