/* eslint-disable no-loop-func */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from '@tencent/hippy-react-qb';
import { FeedsTheme } from './utils';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { CommonProps } from '../../../entity';
import { TagsBgColors } from '../../../framework/FeedsConst';

const tagsMargin = 8;
const tagsBottom = 8;

const styles = StyleSheet.create({
  imageContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  tagsWarp: {
    flexDirection: 'column',
  },
  tagWarp: {
    flexDirection: 'row',
  },
  tag: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    colors: FeedsTheme.SkinColor.N1,
  },
});

interface Props extends CommonProps {
  tags: string[];
  line: number;
  cardIndex: number;
}

@FeedsProtect.protect
export class Tags extends React.Component<Props> {
  public BookShelfScrollView: any;

  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'Tags');
  }

  public onScrollEndDrag = (e) => {
    const index = Math.floor(e.contentOffset.x / 160);
    this.props.doBeaconBySlide?.({ ext_data1: index });
  };

  public spliceGroup = (array, line) => {
    const length = Math.ceil(array.length / line);
    const newArray: any[] = [];
    for (let i = 1; i <= line; i++) {
      if (i !== line) {
        newArray.push(array.splice(0, length));
      } else {
        newArray.push(array.splice(0, array.length));
      }
    }
    return newArray;
  };

  public clickHandle = (tag, start) => {
    const {
      parent,
      doBeaconByClick,
    } = this.props || {};
    doBeaconByClick?.({ ext_data1: start - 1, ext_data2: tag.sTitle });
    parent.loadUrl(tag.sUrl);
  };

  public render() {
    countReRender(this, 'Tags');
    const {
      tags = [],
      line = 2,
    } = this.props || {};
    if (tags.length <= 0) {
      return null;
    }
    const tagsArray = this.spliceGroup(tags, line);
    const tagsView: any[] = [];
    const bgColorBaseIndex = Math.floor(Math.random() * 5);
    for (let i = 0; i < tagsArray.length; i++) {
      const tagView: any[] = [];
      tagsArray[i].forEach((e, j) => {
        const bgColorIndex = (bgColorBaseIndex + i + j) % 5;
        const index = i > 0 ? (i * tagsArray[i - 1].length) + j + 1 : j + 1;
        tagView.push(<View
          collapsable={false}
          style={[
            styles.tag,
            { marginRight: j === tagsArray[i].length - 1 ? 0 : tagsMargin },
            { backgroundColors: TagsBgColors[bgColorIndex] },
          ]}
          key={`${e.sTitle}-${index}`}
          onClick={() => this.clickHandle(e, index || 1)}
        >
          <Text style={styles.tagText}>{e.sTitle}</Text>
        </View>);
      });
      tagsView.push(<View
        collapsable={false}
        style={[
          styles.tagWarp,
          { marginBottom: i === tagsArray.length - 1 ? 0 : tagsBottom },
        ]}
        key={`${i}`}
      >
        {tagView}
      </View>);
    }

    return (
      <ScrollView
        contentContainerStyle={styles.imageContainer}
        horizontal
        showsHorizontalScrollIndicator={false}
        sendMomentumEvents
        ref={(ref) => {
          this.BookShelfScrollView = ref;
        }}
        onScrollEndDrag={this.onScrollEndDrag}
        scrollEventThrottle={100}
      >
        <View
          collapsable={false}
          style={styles.tagsWarp}
        >
          {tagsView}
        </View>
      </ScrollView>
    );
  }
}

