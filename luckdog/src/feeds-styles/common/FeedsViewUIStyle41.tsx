/* eslint-disable quote-props */
// 入口
import React from 'react';
import { View, Text, Image, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsViewItem from '../FeedsViewItem';
import FeedsTheme from '../../framework/FeedsTheme';
import { CommonCardStyle, FeedsUIStyle } from '../../framework/FeedsConst';
import FeedsSpliter from '../../components/FeedsSpliter';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsUtils from '../../framework/FeedsUtils';
import { CommonProps } from '../../entity';

const { width } = FeedsUtils.getScreen();
const iconWidth = (64 * width) / 750;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    marginTop: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item_column: {
    flexDirection: 'column',
  },
  item_row: {
    flexDirection: 'row',
  },
  icon: {
    height: iconWidth,
    width: iconWidth,
  },
  title_row: {
    marginLeft: 6,
    fontSize: FeedsUIStyle.T2,
  },
  title_column: {
    marginLeft: 0,
    fontSize: FeedsUIStyle.T1,
    lineHeight: 16,
    marginTop: 4,
  },
});

const ENTRANCE_TYPES = {
  '分类': 'CATE',
  '分类标签': 'CATE',
  '排行': 'RANK',
  '完本': 'ENDBOOK',
  '搜索': 'SEARCH',
  '精品': 'FINEWORK',
  '付费': 'FINEWORK',
  '福利': 'WELFARE',
};

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle41 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 41;
  }
  public duration = 10000;

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle41');
  }

  public _onClick = (url, title) => {
    reportUDS(BusiKey[`CLICK__ENTRANCE_${ENTRANCE_TYPES[title]}`], this.props);

    this.loadUrl(url);
    return false;
  };

  public onLayout = (event) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle41');
    const { itemBean, globalConf = {}, index = 0, parent } = this.props;
    if (!itemBean) return null;
    const { parsedObject } = itemBean;
    if (!parsedObject) {
      return null;
    }
    const sites = parsedObject.vSiteData.val || parsedObject.vSiteData.value;
    const sitesLength = sites.length;
    const showType = sitesLength > 3 ? 'column' : 'row';
    // iOS和Android在处理tintColors方式有些不同，这里要注意 at 19/04/26
    const siteViewList = sites.map((site, index) => {
      const viewStyle = [styles.item, styles[`item_${showType}`]];
      const iconStyle = [styles.icon];
      const txtStyle = [{ colors: FeedsTheme.SkinColor.N1 }, styles[`title_${showType}`]];

      return (
        <View
          style={viewStyle}
          key={`rowEntry_${index}`}
          onClick={() => {
            this._onClick(site.sUrl, site.sTitle);
          }}
        >
          <Image
            style={iconStyle}
            source={{ uri: site.sIconImg }}
            reportData={{ sourceFrom: (itemBean || {}).item_id }}
          />
          <Text style={txtStyle} numberOfLines={1}>
            {site.sTitle}
          </Text>
        </View>
      );
    });

    return (
      <View
        style={[
          CommonCardStyle,
          { backgroundColors: parent.useBottomStyle?.()
            ? FeedsTheme.SkinColor.N9 : FeedsTheme.SkinColor.D5 },
        ]}
        onLayout={this.onLayout}
      >
        <FeedsSpliter style={globalConf.style} lineStyle={itemBean.bottomLineStyle} />
        <View
          style={[
            styles.container,
            index === 0 ? { marginTop: FeedsUIStyle.T3 } : null,
          ]}
        >
          {siteViewList}
        </View>
      </View>
    );
  }
}
