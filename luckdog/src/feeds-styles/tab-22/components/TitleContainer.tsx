/**
 * 包含Title的卡片
 * Created by liquid @2019年10月16日19:26:38
 */
import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import { Title } from '.';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';

interface Props {
  parent: any;
}

@FeedsProtect.protect
export class TitleContainer extends React.Component<Props> {
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'TitleContainer');
  }

  public render() {
    countReRender(this, 'TitleContainer');
    const { props } = this;
    const { parent = {} } = props;
    const { itemBean = {} } = parent.props || {};
    const { title } = itemBean;
    return (
      <View style={{ marginTop: 8 }}>
        {title && <Title title={title} parent={parent} />}
        <View
          style={{
            marginHorizontal: 12,
          }}
        >
          {props.children}
        </View>
      </View>
    );
  }
}
