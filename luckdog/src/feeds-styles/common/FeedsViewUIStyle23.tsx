/**
 * Created by damonruan on 2017/4/30.
 * Banner
 */
import React from 'react';

import { View, Image } from '@tencent/hippy-react-qb';

import FeedsViewItem from '../FeedsViewItem';
import FeedsViewContainer from './FeedsViewContainer';
import { ConstantUtils } from './utils';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, strictExposeReporter, BusiKey } from '@/luckdog';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { DEFAULT_FEEDS_STYLE } from '../../framework/FeedsDefaultStyle';
import { CommonProps } from '../../entity';

/** 设计图宽高比 */
const imageRatio = 702 / 392;

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle23 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 23;
  }
  public modalRef = null;

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle23');
  }

  public _onClick = () => {
    const { itemBean } = this.props;
    const { url = '' } = itemBean || {};
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
    countReRender(this, 'FeedsViewUIStyle23');
    const { itemBean } = this.props;
    if (!itemBean) return null;
    const {  parsedObject } = itemBean;
    if (!parsedObject) return null;
    const { sPicUrl, iWidth, iHeight } = parsedObject;
    if (sPicUrl === '' && iHeight === 0 && iWidth === 0) return null;
    const styles = DEFAULT_FEEDS_STYLE.data['23'];
    const aspectRatio = iWidth && iWidth > 0 && iHeight && iHeight > 0 ? iWidth / iHeight : imageRatio;
    const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
    const bookContainerStyle = styles.bookContainer;
    const { paddingLeft = 12, paddingRight = 12 } = bookContainerStyle;
    const containWidth = SCREEN_WIDTH - paddingLeft - paddingRight;
    const containerStyle = bookContainerStyle;
    const imgHeight = Math.floor(containWidth / aspectRatio);
    return (
      <FeedsViewContainer
        ref={itemBean.item_id}
        onLayout={this.onLayout}
        parentProps={this.props}
        onClick={this._onClick}
        noPadding={true}
        border={true}
        containerStyle={[containerStyle, { marginTop: 16 }]}
      >
        <View style={[styles.container, { overflow: 'hidden' }]}>
          <Image
            ref="image"
            style={[
              styles.image,
              {
                width: containWidth,
                height: imgHeight,
              },
              { marginTop: 0 },
            ]}
            source={{ uri: sPicUrl }}
            reportData={{ sourceFrom: (itemBean || {}).item_id }}
            onClick={() => {
              itemBean.item_id && (this.refs[itemBean.item_id] as any).loadUrl({ clickPos: 'pic' });
            }}
          />
        </View>
      </FeedsViewContainer>
    );
  }
}

