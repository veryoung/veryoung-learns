/**
 * 书单文卡片，左图（2图）右文
 * Created by liquid @2019年10月21日21:35:31
 */
import React from 'react';
import FeedsViewItem from '../FeedsViewItem';
import { vectorToArray } from './components/utils';
import { PicPicText, TitleContainer } from './components';
import FeedsProtect from '../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { CommonProps } from '../../entity';

@FeedsProtect.protect
export default class FeedsViewUIStyle415 extends FeedsViewItem<CommonProps> {
  public static getRowType() {
    return 415;
  }

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle415');
  }

  public openUrl(item) {
    super.loadUrl(item.sUrl);
  }

  public render() {
    countReRender(this, 'FeedsViewUIStyle415');
    const { itemBean = {}, index } = this.props;
    const { parsedObject = {} } = itemBean;
    const vData = vectorToArray(parsedObject.vData);

    return (
      <TitleContainer parent={this}>
        {vData.map((item, idx) => (
          <PicPicText
            key={idx}
            cardIndex={index}
            {...item}
            style={{ marginTop: idx && 20 }}
            openUrl={() => this.openUrl(item)}
          />
        ))}
      </TitleContainer>
    );
  }
}
