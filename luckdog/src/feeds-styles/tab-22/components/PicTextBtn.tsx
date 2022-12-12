// 左图中文右按钮
import React from 'react';
import { View, Image, Text, StyleSheet, Platform } from '@tencent/hippy-react-qb';
import { FeedsLineHeight, CommonCardStyle } from '../../../framework/FeedsConst';
import { FeedsUIStyle, FeedsTheme, ConstantUtils } from './utils';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsIcon from '../../../framework/FeedsIcon';
import FeedsAbilities from '../../../framework/FeedsAbilities';
import { isTopTab } from '@/luckbox';
import { CommonProps } from '../../../entity';
import { BookCoverRadiusStyle } from '../../../types/card';
import { BookCover } from '../../../components/book-font-cover';

const SCREEN_WIDTH = ConstantUtils.getScreenWidth();

const defaultStyles = StyleSheet.create({
  transBlock: {
    backgroundColors: ['transparent', 'transparent', 'transparent', 'transparent'],
    marginBottom: 0,
  },
  wapperBlock: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftBlock: {
    height: 60,
    width: 45,
    marginRight: 10,
  },
  leftPic: {
    height: 60,
    width: 45,
    borderRadius: 2,
    zIndex: 1,
  },
  picTagText: {
    colors: FeedsTheme.LiteColor.A5,
    fontSize: FeedsUIStyle.SMALL,
    // height: Platform.OS === 'ios' ? 14 : 16,
    left: 0,
    lineHeight: Platform.OS === 'ios' ? 14 : 16,
    // paddingVertical: 1,
    paddingHorizontal: 3,
    borderTopLeftRadius: 2,
    borderBottomRightRadius: 2,
    position: 'absolute',
    top: 0,
    // backgroundColors: FeedsTheme.SkinColor.N2,
    zIndex: 3,
  },
  middleBlock: {
    flex: 1,
    height: 60,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  bookName: {
    colors: FeedsTheme.SkinColor.N1,
    fontSize: FeedsUIStyle.T3,
    lineHeight: FeedsLineHeight.T6,
    marginBottom: 2,
  },
  readSerial: {
    colors: FeedsTheme.SkinColor.N1_1,
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T0,
  },
  rightBlock: {
    width: 72,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readButton: {
    width: 72,
    height: 28,
    marginRight: 8,
    borderRadius: 14,
    backgroundColors: FeedsTheme.SkinColor.N2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  readButtonText: {
    fontSize: FeedsUIStyle.T1,
    colors: FeedsTheme.SkinColor.N1,
  },
  splitLine: {
    height: 3,
    borderRadius: 1.5,
    backgroundColors: FeedsTheme.SkinColor.D2_1,
    position: 'relative',
  },
  shadowBlock: {
    position: 'relative',
    top: -3,
    left: 0,
    width: SCREEN_WIDTH - 24,
  },
  shadowImg: {
    width: SCREEN_WIDTH - 24,
    height: 16,
  },
});

interface Props extends CommonProps {
  picUrl: string;
  text: string;
  subText: string;
  btnText: string;
  picStyle?: Record<string, any>;
  textStyle?: Record<string, any>;
  blockStyle?: Record<string, any>;
  style?: Record<string, any>;
  subTextStyle?: Record<string, any>;
  picTag?: string;
  sResourceId?: string;
  item_id?: string;
  btnUrl?: string;
  hasSplit?: boolean;
  tagColors?: any[];
  /** tag名字 */
  tags?: string,
  /** 是否展示新tag */
  showNewTag?: boolean;
  /** 书籍id */
  bookID?: string;
  onClick?: () => void;
}

@FeedsProtect.protect
export class PicTextBtn extends React.Component<Props> {
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'PicTextBtn');
  }

  public handleClickBtn = () => {
    const { btnUrl = '', parents = {}, sResourceId = 0, picTag = '' } = this.props;
    if (picTag === 'TXT') {
      FeedsAbilities.openNovelLocalBook(sResourceId);
    } else {
      this.props.doBeaconByClick?.();
      parents.loadUrl(btnUrl);
    }
  };

  public render() {
    countReRender(this, 'PicTextBtn');
    const {
      btnUrl = '',
      text = '',
      subText = '',
      btnText = '继续阅读',
      hasSplit = false,
      textStyle = {},
      subTextStyle = {},
      blockStyle = {},
      style = {},
      onClick } = this.props;

    return (
      <View
        style={{
          ...!isTopTab() && CommonCardStyle,
          ... defaultStyles.transBlock,
          ...style,
        }}
        onClick={onClick || this.handleClickBtn}>
        <View style={defaultStyles.wapperBlock}>
          <View style={defaultStyles.leftBlock}>
            {this.renderBookCover(this.props)}
          </View>
          { !text ? null : (
            <View style={[defaultStyles.middleBlock, blockStyle]}>
              <Text style={[defaultStyles.bookName, textStyle]} numberOfLines={1}>{text}</Text>
              {
                !subText
                  ? null
                  : (<Text style={[defaultStyles.readSerial, subTextStyle]} numberOfLines={1}>{subText}</Text>) }
            </View>
          )}
          {
            (!btnUrl && !btnText) ? null : (
              <View style={defaultStyles.rightBlock}>
                <View
                  style={defaultStyles.readButton}
                  onClick={onClick || this.handleClickBtn}
                >
                  <Text style={defaultStyles.readButtonText}>{btnText}</Text>
                </View>
              </View>
            )
          }
        </View>
        {
          hasSplit ? <View style={defaultStyles.splitLine}>
          </View> : null
        }
        {
          hasSplit
            ? (
              <View style={defaultStyles.shadowBlock}>
                <Image source={{ uri: FeedsIcon.shadowImg }} style={defaultStyles.shadowImg} />
              </View>
            ) : null
        }
      </View>
    );
  }

  /** 渲染书封 */
  private renderBookCover = (props) => {
    const { picUrl, item_id: itemId = '', picStyle, picTag, tagColors, showNewTag = false, bookID, tags } = props;
    if (showNewTag) {
      return <BookCover
        height={60}
        width ={45}
        url={picUrl}
        radius={BookCoverRadiusStyle.SMALL}
        bookID={bookID}
        sourceFrom={itemId}
        leftTag={{
          text: tags || picTag,
          offsetY: 0,
          offsetX: 6,
          width: 14,
          height: 24,
          type: 0,
        }}
      />;
    }
    return  <View>
      <Image
        source={{ uri: picUrl || FeedsIcon.novel_default_cover }}
        style={ [defaultStyles.leftPic, picStyle] }
        reportData={{ sourceFrom: itemId }}
      />
      { !picTag ? null : (
        <Text style={[defaultStyles.picTagText, { backgroundColors: tagColors }]}>
          {picTag}
        </Text>
      ) }
    </View>;
  };
}
