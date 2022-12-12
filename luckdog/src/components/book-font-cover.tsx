import React from 'react';
import { View, Image, Text, Platform, StyleSheet } from '@tencent/hippy-react-qb';
import FeedsIcon from '../framework/FeedsIcon';
import FeedsTheme from '../framework/FeedsTheme';
import { Tag } from './tag';
import { colorDict, FeedsUIStyle } from '../framework/FeedsConst';

export interface BookFontCover {
  /** 宽度 */
  width: number,
  /** 长度 */
  height: number,
  /** 圆角 */
  radius?: number,
  /** 书封 */
  url: string,
  /** 左上角图标 */
  leftTag?: {
    /** 标签宽度 */
    width: number,
    /** 标签高度 */
    height: number,
    /** 标签类型 决定文案 */
    text: string,
    /** 距离边框y轴距离 */
    offsetY: number,
    /** 距离边框X轴距离 */
    offsetX: number,
    /** 是否可以支持老样式 */
    isOld?: boolean,
    /** 老样式类型 */
    type?: number
    /** 字体大小 */
    fontSize?: number,
  },
  /** bookId */
  bookID: number | string,
  /** 右上角图标 */
  rightTag?: {
    /** 标签类型 决定颜色 */
    type: number,
    /** 标签类型 决定文案 */
    text: string,
    /** 距离边框y轴距离 */
    offsetY: number,
    /** 距离边框X轴距离 */
    offsetX: number,
    /** 字体大小 */
    fontSize?: number,
  },

  /** 上报来源(推荐 tabId_uiType_bookId) */
  sourceFrom?: string,
  /** 是否支持阴影 */
  shadowEnable?: boolean,
  /** 阴影大小 */
  shadowSize?: number,
}

// todo: 目前只支持三类
const supportBadge = ['独家免费', '独家', '付费', '原创'];

/** 圆角样式 */
const RADIUS_BORDER = {
  borderColors: FeedsTheme.SkinColor.D2,
  borderWidth: 0.5,
};

/** 渲染书籍右上角标签 */
const renderRightTagView = (tag) => {
  const {  offsetX = 0, offsetY = 0, text,  type = 0 } = tag;
  if (!text) return null;
  return <View
    style={[styles.tag, {
      right: offsetX,
      top: offsetY,
    }]}
  >
    <Tag
      text={text}
      type={type}
    />
  </View>;
};

/** 绘制左上角 */
const renderLeftTag = (tag, radius) => {
  const { offsetX = 0,
    offsetY = 0,
    text,
    width,
    height,
    isOld = false,
    type = 0,
    url,
  } = tag;
  if (isOld) {
    return text
      ? <View style={[styles.picTagWarp, {
        backgroundColors: colorDict[type],
        borderTopLeftRadius: radius,
        borderBottomRightRadius: radius,
      }]}>
        <Text style={styles.picTagText}>{text}</Text>
      </View> : null;
  }
  // 只展示独家免费
  let source;
  if (supportBadge.includes(text)) {
    switch (text) {
      case '独家免费':
        source = FeedsIcon.bigOnlyFree;
        break;
      case '独家':
        source = FeedsIcon.bigOnlyFree;
        break;
      case '付费':
        source = FeedsIcon.cost;
        break;
      case '原创':
        source = FeedsIcon.bigOriginal;
        break;
      default:
        break;
    }
  }
  if (url) {
    source = url;
  }
  if (!source) {
    return null;
  }
  return <Image
    style={[styles.tag, {
      left: offsetX,
      top: offsetY,
      width,
      height,
    }]}
    source={{ uri: source }}
  />;
};


export const BookCover = (props: BookFontCover) => {
  const {
    width = 0,
    height = 0,
    radius = 0,
    shadowEnable = false,
    sourceFrom = '',
    url = '',
    rightTag,
    leftTag,
  } = props;
  if (shadowEnable) return null;
  let radiusStyle = {};
  /** 圆角样式 */
  if (radius > 0) {
    radiusStyle = RADIUS_BORDER;
  }

  /** 确定圆角样式 */
  return (
    <View
      style={[styles.container, {
        width,
        height,
      }]}
    >
      <Image
        style={[{
          width,
          height,
          borderRadius: radius,
        },
        radiusStyle,
        ]}
        reportData={{ sourceFrom }}
        source={{ uri: url || FeedsIcon.novel_default_cover }}
      />
      {
        rightTag && renderRightTagView(rightTag)
      }
      {
        leftTag && renderLeftTag(leftTag, radius)
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tag: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
  picTagWarp: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',

  },
  picTagText: {
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.SMALL,
    lineHeight: Platform.OS === 'ios' ? 14 : 16,
    paddingHorizontal: 3,
  },
});
