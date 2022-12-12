/**
 * @Author: rickiezheng
 * 2+4 卡片
 */

import React from 'react';
import { StyleSheet, View, Text, Image } from '@tencent/hippy-react-qb';

import FeedsViewItem from '../FeedsViewItem';
import FeedsTheme from '../../framework/FeedsTheme';
import FeedsUtils from '../../framework/FeedsUtils';
import FeedsViewContainer from '../common/FeedsViewContainer';
import { FeedsLineHeight, FeedsUIStyle } from '../../framework/FeedsConst';
import FeedsIcon from '../../framework/FeedsIcon';
import FeedsProtect from '../../mixins/FeedsProtect';
import { strictExposeReporter, reportUDS, BusiKey } from '@/luckdog';
import { CommonProps } from '../../entity';

const IMAGE_WIDTH = 72;
const IMAGE_HEIGHT = 96;

const styles = StyleSheet.create({
  author: {
    colors: FeedsTheme.SkinColor.A3,
    fontSize: 12,
    lineHeight: 16,
    marginRight: 8,
  },
  bookDesc: {
    colors: FeedsTheme.SkinColor.A3,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
  },
  bookIcon: {
    borderColors: FeedsTheme.SkinColor.D2,
    borderRadius: 2,
    borderWidth: 0.5,
    height: 96,
    marginRight: 12,
    width: 72,
  },
  bookName: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: 16,
    height: 20,
    lineHeight: 20,
    marginBottom: 8,
  },
  bookNameContainer: {
    flex: 1,
    height: 96,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  container: {
    marginHorizontal: 12,
  },
  description: {
    colors: FeedsTheme.SkinColor.A2,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
  },
  headerTitle: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: 16,
    fontWeight: 'bold',
    height: 20,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 20,
  },
  image: {
    borderColors: FeedsTheme.SkinColor.D4,
    borderRadius: 2,
    borderWidth: 0.5,
    height: IMAGE_HEIGHT,
    marginBottom: 8,
    width: IMAGE_WIDTH,
  },
  item: {
    width: IMAGE_WIDTH,
  },
  listContainer: {
    flexDirection: 'row',
    height: 96,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  smallBookName: {
    colors: FeedsTheme.SkinColor.A1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
    marginBottom: 4,
  },
  smallBookRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tag: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 16,
    justifyContent: 'center',
  },
  tagContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 16,
  },
  tagSeparator: {
    backgroundColors: FeedsTheme.SkinColor.A4,
    height: 7,
    width: 0.5,
  },
  tagTitle: {
    colors: FeedsTheme.SkinColor.A3,
    fontSize: 12,
    lineHeight: 16,
    marginHorizontal: 8,
  },
});

const firstRowHeight = styles.listContainer.height + styles.listContainer.marginBottom;

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle403 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 403;
  }
  public openFromUrl = (fromUrl, i, bookId, isSmall = false) => {
    const { itemBean } = this.props;
    if (fromUrl && fromUrl.length > 0) {
      FeedsUtils.doLoadUrl(fromUrl, itemBean?.tab_id);
    }
    // 上报点击事件
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, {
      ext_data1: isSmall ? i + 1 : i,
      book_id: bookId,
      bigdata_contentid: '',
    });
  };

  public onBookItemLayout = (event, bookIndex, bookId, secondRow = false) => {
    // 多层 View 嵌套，导致第二行的书籍获取到的 y 不是相对于卡片的，需要手动加上第一行的高度
    const y = secondRow ? event.layout.y + firstRowHeight : event.layout.y;
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookIndex,
      bookId,
      rect: {
        ...event.layout,
        y,
      },
    });
  };

  // 特殊情况，使用 View Container 的 y 作为 titleHeight
  public onTitleLayout = (event) => {
    strictExposeReporter.updateTitleHeight(this.props.index, event.layout.y);
  };

  public renderTitle(title) {
    if (!title || title.length === 0) return null;
    return (
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
    );
  }

  public renderTags(v, i) {
    const tags = v.vTags.value;
    if (!tags || tags.length === 0) return null;
    return tags.map((tag, tagIndex) => {
      if (tag && tag.length > 0) {
        return (
          <View style={styles.tag} key={`UI403-${i}-tag-${tagIndex}`}>
            <View style={styles.tagSeparator} />
            <Text style={styles.tagTitle} numberOfLines={1}>
              {tag}
            </Text>
          </View>
        );
      }
      return null;
    });
  }

  public renderSpecialTags(v, i) {
    if (!v || !v.vSpecialTags || !v.vSpecialTags.value) return null;
    const tags = v.vSpecialTags.value;
    if (!tags || tags.length === 0) return null;
    return tags.map((tag, tagIndex) => {
      if (tag && tag.length > 0) {
        return (
          <View style={styles.tag} key={`UI403-${i}-special-tag-${tagIndex}`}>
            <View style={styles.tagSeparator} />
            <Text style={styles.tagTitle} numberOfLines={1}>
              {tag}
            </Text>
          </View>
        );
      }
      return null;
    });
  }

  public renderTagContainer(v, i) {
    return (
      <View style={styles.tagContainer}>
        {this.renderTags(v, i)}
        {this.renderSpecialTags(v, i)}
      </View>
    );
  }
  public renderBookRow(v, i, lastFlag = false, titleExistFlag = true) {
    const { itemBean = {} } = this.props;
    // 最后一行的marginBottom只需要8pt即可
    // 如果没有标题的话，第一行403需要加上marginTop 12pt
    return (
      <View
        style={[
          styles.listContainer,
          lastFlag ? { marginBottom: 8 } : null,
          !titleExistFlag && i === 0 ? { marginTop: 12 } : null,
        ]}
        onClick={strictExposeReporter.triggerExpoCheck(() => this.openFromUrl(v.sRefer, i, v.sResourceId))}
        onLayout={event => this.onBookItemLayout(event, i, v.sResourceId)}
        key={`403-${i}`}
      >
        <Image
          source={{ uri: v.sPicUrl }}
          reportData={{ sourceFrom: itemBean.item_id }}
          style={styles.bookIcon}
          resizeMode='cover'
        />
        <View style={styles.bookNameContainer}>
          <Text style={styles.bookName} numberOfLines={1}>
            {v.sResourceName}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {v.sBrief}
          </Text>
          <View style={styles.footerContainer}>
            <Text style={styles.author} numberOfLines={1}>
              {v.sAuthor}
            </Text>
            {this.renderTagContainer(v, i)}
          </View>
        </View>
      </View>
    );
  }

  public renderSmallBooks(list) {
    const books = list.slice(1, 5);
    const { itemBean = {} } = this.props;
    return books.map((book, i) => {
      const tags = book.vSpecialTags.value;
      const specialTag = tags && tags.length > 0 ? tags[0] : '';
      return (
        <View
          key={`UI403-${i}`}
          style={styles.item}
          onLayout={event => this.onBookItemLayout(event, i + 1, book.sResourceId, true)}
          onClick={
            strictExposeReporter.triggerExpoCheck(() => this.openFromUrl(book.sRefer, i, book.sResourceId, true))
          }
        >
          <Image
            style={styles.image}
            reportData={{ sourceFrom: itemBean.item_id }}
            source={{
              uri: book.sPicUrl || FeedsIcon.novel_default_cover,
            }}
          />
          <Text style={styles.smallBookName} numberOfLines={2}>
            {book.sResourceName}
          </Text>
          <Text style={styles.bookDesc} numberOfLines={1}>
            {specialTag}
          </Text>
        </View>
      );
    });
  }

  public renderBookList(books, bHighlightFirst, titleExistFlag) {
    if (books?.value && books.value.length > 0) {
      const list = books.value;

      strictExposeReporter.updateBookIds(this.props.index, 0, list.map(book => book.sResourceId));

      if (!bHighlightFirst) {
        return list.map((v, i) => this.renderBookRow(v, i, i === list.length - 1, titleExistFlag));
      }
      return (
        <View onLayout={this.onTitleLayout}>
          {this.renderBookRow(list[0], 0)}
          <View style={styles.smallBookRowContainer}>{this.renderSmallBooks(list)}</View>
        </View>
      );
    }
    return null;
  }

  public render() {
    const { itemBean } = this.props;
    if (!itemBean) return null;
    const { parsedObject, title } = itemBean;
    if (!parsedObject) return null;
    const { vRes, bHighlightFirst = false } = parsedObject;
    const titleExistFlag = title && title.length > 0;
    return (
      <FeedsViewContainer
        parentProps={this.props}
        noPadding
      >
        <View style={styles.container}>
          {this.renderTitle(title)}
          {this.renderBookList(vRes, bHighlightFirst, titleExistFlag)}
        </View>
      </FeedsViewContainer>
    );
  }
}
