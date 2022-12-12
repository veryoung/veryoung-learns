/**
 * 快链
 * @Author: liquid
 * @Date:   2017-06-15T21:36:18+08:00
 * @Last modified by:   liquid
 * @Last modified time: 2017-06-20T18:47:19+08:00
 */

import React from 'react';
import { StyleSheet, View, Text } from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsTheme, vectorToArray } from './utils';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { MoreUrl } from '../../../entity/bean';

const styles = StyleSheet.create({
  blockView: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
  },
  lastRead: {
    colors: FeedsTheme.SkinColor.B1,
  },
  normalText: {
    fontSize: FeedsUIStyle.T1,
    textAlignVertical: 'center',
  },
  normalTextColor: {
    colors: FeedsTheme.SkinColor.A3,
  },
});

interface Props {
  stMoreUrl: MoreUrl;
  styleNormal?: Record<string, any>;
  globalConf?: any;
  style?: Record<string, any>;
  parent: any;
}

@FeedsProtect.protect
class LinkView extends React.Component<Props> {
  public static getData(stMoreUrl: MoreUrl) {
    return stMoreUrl.vText && vectorToArray(stMoreUrl.vText);
  }

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'LinkView');
  }

  public render() {
    countReRender(this, 'LinkView');
    const { stMoreUrl = {}, styleNormal, parent } = this.props || {};
    const stMore = LinkView.getData(stMoreUrl);
    return (
      <View style={[styles.blockView, this.props.style || null]}>
        {stMore?.map((o, i) => {
          if (o.sUrl) {
            return (
              <Text
                style={[styles.normalText, styles.lastRead]}
                key={`stMore${i}`}
                onClick={() => parent.loadUrl(o.sUrl)}
              >
                {o.sText}
              </Text>
            );
          }
          return (
            <Text key={i} style={[styles.normalText, styleNormal || styles.normalTextColor]}>
              {o.sText}
            </Text>
          );
        })}
      </View>
    );
  }
}

export default LinkView;
