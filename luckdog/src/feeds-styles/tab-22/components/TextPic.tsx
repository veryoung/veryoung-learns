/** 左文右图
 * @Author: liquid
 * @Date:   2019年10月15日21:01:50
 *
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsProtect from '../../../mixins/FeedsProtect';
import FeedsTheme from '../../../framework/FeedsTheme';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textView: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    flex: 1,
  },
  textMain: {
    fontSize: 16,
    colors: FeedsTheme.SkinColor.A1,
    lineHeight: 24,
    textAlign: 'justify',
  },
  textSub: {
    fontSize: 12,
    colors: FeedsTheme.SkinColor.A3,
    lineHeight: 16,
    marginTop: 4,
  },
  image: {
    marginLeft: 12,
    width: 91,
    height: 68,
    borderRadius: 2,
  },
});

interface Props {
  itemBean: any;
  style: Record<string, any>;
  sMainText: string;
  sSubText: string;
  sImage: string;
  openUrl: (...args) => void;
}

@FeedsProtect.protect
export class TextPic extends React.Component<Props> {
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'TextPic');
  }

  // {
  //     sMainText: '新生婴儿投胎未饮孟婆汤，竟拥有了上一世的所有记忆。',
  //     sSubText: '选自《堕入星空的少女》',
  //     sImage: 'https://cdn.bookimg.html5.qq.com/pic?picurl=http%3A%2F%2Fwfqqreader.3g.qq.com%2Fcover%2F274%2F499274%2Ft3_499274.jpg&format=2&flag=2&bookid=1100499274',
  //     sUrl: 'https://bookshelfsz.sparta.html5.qq.com/?t=native#!/bookstore/tuijian/',
  // };
  public render() {
    countReRender(this, 'TextPic');
    const { props } = this;
    const { itemBean = {} } = this.props;
    return (
      <View style={[styles.container, this.props.style]} onClick={props.openUrl}>
        <View style={styles.textView}>
          <View>
            <Text style={styles.textMain} numberOfLines={2}>
              {props.sMainText}
            </Text>
          </View>
          <View>
            <Text style={styles.textSub} numberOfLines={1}>
              {props.sSubText}
            </Text>
          </View>
        </View>
        <View>
          <Image
            style={styles.image}
            source={{ uri: props.sImage }}
            resizeMode='cover'
            reportData={{ sourceFrom: itemBean.item_id }}
          />
        </View>
      </View>
    );
  }
}
