/** 左图（2图）右文
 * @Author: liquid
 * @Date:   2019年10月15日21:01:50
 *
 */

import React from 'react';
import { View, Image, Text, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsTheme from '../../../framework/FeedsTheme';
import { vectorToArray } from './utils';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { strictExposeReporter } from '@/luckdog';
import { CommonProps } from '../../../entity';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageView: {
    height: 68,
    width: 71,
  },
  imageMain: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  imageMainSize: {
    width: 40,
    height: 52.5,
  },
  imageBorder: {
    borderColors: FeedsTheme.SkinColor.D2,
    borderWidth: 0.5,
    borderStyle: 'solid',
    borderRadius: 2,
  },
  imageRight: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 51,
    height: 68,
  },
  imageTag: {
    backgroundColor: '#242424dd',
    borderRadius: 2,
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 50,
    alignItems: 'center',
  },
  imageTagText: {
    fontSize: 12,
    colors: FeedsTheme.SkinColor.A5,
    lineHeight: 20,
  },
  textView: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: 12,
  },
  textMain: {
    fontSize: 16,
    colors: FeedsTheme.SkinColor.A1,
    lineHeight: 24,
    textAlign: 'justify',
  },
  tagSplit: {
    width: 0.5,
    height: 7,
    marginHorizontal: 6,
    marginTop: 4,
    backgroundColors: FeedsTheme.SkinColor.A4,
  },
  tegText: {
    fontSize: 12,
    colors: FeedsTheme.SkinColor.A3,
    lineHeight: 16,
    marginTop: 4,
  },
});

interface Props extends CommonProps {
  cardIndex: number;
  sBookId: string;
  vTag: any;
  style: any;
  sImage: string;
  sSubImage: string;
  sSubText: string;
  sMainText: string;
  openUrl: () => void;
}

@FeedsProtect.protect
export class PicPicText extends React.Component<Props> {
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'TextPic');
  }

  public onLayout = (event, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.cardIndex,
      bookId,
      rect: event.layout,
    });
  };

  public render() {
    countReRender(this, 'TextPic');
    const { props } = this;
    const { itemBean = {}, sBookId } = this.props;
    const vTag = vectorToArray(props.vTag);
    return (
      <View
        style={[styles.container, this.props.style]}
        onClick={strictExposeReporter.triggerExpoCheck(props.openUrl)}
        onLayout={event => this.onLayout(event, sBookId)}
      >
        <View style={styles.imageView}>
          <View style={styles.imageMain}>
            <Image
              style={[styles.imageMainSize, styles.imageBorder]}
              source={{ uri: props.sImage }}
              resizeMode='cover'
              reportData={{ sourceFrom: itemBean.item_id }}
            />
          </View>

          <Image
            style={[styles.imageRight, styles.imageBorder]}
            source={{ uri: props.sSubImage }}
            resizeMode='cover'
            reportData={{ sourceFrom: itemBean.item_id }}
          />
          <View style={styles.imageTag}>
            <Text style={styles.imageTagText}>{props.sSubText}</Text>
          </View>
        </View>
        <View style={styles.textView}>
          <View>
            <Text style={styles.textMain} numberOfLines={2}>
              {props.sMainText}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {vTag.map((item, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {idx && <View style={styles.tagSplit} />}
                <Text style={styles.tegText} numberOfLines={1}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }
}
