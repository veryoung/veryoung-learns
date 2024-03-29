/**
 * Created by piovachen on 2017/5/4.
 */
import { SkinModelType } from '../entity';
import { Platform } from '@tencent/hippy-react-qb';

const DefColors = {
  Normal: {
    A1: '#242424',
    A2: '#666666',
    A3: '#8f8f8f',
    A4: '#aaaaaa',
    A5: 'white',
    A6: '#666666',
    A8: '#ffffff',
    B1: '#4c9afa',
    B2: '#f55318',
    B3: '#FF682D',
    NEW_B3: '#00DD6E',
    B4: '#63c3ff',
    B5: '#FF6E4C',
    B5_1: 'rgba(255,110,76, 0.2)',
    B6: '#0ca64e',
    B7: '#FFA200',
    B8: '#FF5E62',
    B9: '#136CE9',
    B10: '#EEBF8A',
    D1: '#fafafa',
    D1_1: '#F0F0F0',
    D2: '#e5e5e5',
    D2_1: '#ffffffff',
    D2_2: '#ffffff66',
    D3: '#eeeeee',
    D4: '#d5d5d5',
    D5: 'white',
    D5_1: '#ebebeb',
    D5_2: 'white',
    D6: '#fafafa',
    D7: '#f5f5f5',
    I1: '#4d4d4d',
    N1: '#000000',
    N1_1: 'rgba(0, 0, 0, 0.3)',
    N1_2: 'rgba(0, 0, 0, 0.04)',
    N1_3: '#000000',
    N1_4: 'rgba(0, 0, 0, 0.4)',
    N1_5: 'rgba(0, 0, 0, 0.7)',
    N1_6: 'rgba(0, 0, 0, 0.1)',
    N1_7: 'rgba(0, 0, 0, 0.5)',
    N1_8: 'rgba(0, 0, 0, 0.2)',
    N1_9: 'rgba(0, 0, 0, 0.5)',
    N1_85: 'rgba(0, 0, 0, 0.85)',
    N1_10: 'rgba(0, 0, 0, 0.4)',
    N2: '#EFBF8A',
    N2_1: 'rgba(239, 191, 138, 0.1)',
    N2_2: 'rgba(239, 191, 138, 0.2)',
    N3: '#FF796E',
    N3_1: 'rgba(255, 121, 110, 0.1)',
    N4: '#23B787',
    N5: '#4CB2FF',
    N5_1: 'rgba(76, 178, 255, 0.1)',
    N6: '#8BCECE',
    N6_1: 'rgba(139, 206, 206, 0.1)',
    N7: '#7882CD',
    N7_1: 'rgba(120, 130, 205, 0.1)',
    N8: '#F5F7F9',
    N9: '#F5F7F9',
    N9_1: '#8B91A3',
    N10: '#FFFFFFB2',
    BTN_CLICK_STATE: '#4c9afa44',
    NORMAL_BG: '#00000000',
    PRESSED_BG: '#0000001f',
    REFRESH_BG: '#fffffff2',
    VOTE_BG1: '#fe7168',
    VOTE_BG2: '#48a9ed',
    VOTE_TXT1: '#ff4f44',
    VOTE_TXT2: '#1c95ea',
    PRIZE_TEXT: '#F44837',
    SEPARATOR_COLOR: '#ebebeb',
    VIDEO_MASK_COLOR: '#242424',
    IMG_MASK_COLOR: '#0000004D',
    IMG_TAG_BG: '#0000008C',
    CIRCLE_COMMENT_BG: '#F8F8F8',
    CIRCLE_THEME_COLOR: '#FFA200',
    NRE_TAB_TIP_BG: '#F34A46',
    NEW_D1: '#f8f8f8',
    hobbitGreenBG: '#3dd05d',
    hobbitRedBG: '#fe5b8d',
    hobbitYellowBG: '#ffaa0d',
    NEW_A5: 'white',
    ARROW_ICON_COLOR: '#D0D0D0',
    COMMENT_ICON_COLOR: '#9f9f9f',
    NEW_A4: '#aaaaaa',
    PERSONAL_BG: '#cfcfcf',
    WRAP_BACKGROUND: '#FAFAFA',
    STATIC_PANEL: Platform.OS === 'android' ? 'white' : '#FAFAFA',
    STATIC_PANEL_WORD: Platform.OS === 'android' ? '#F2F2F2' : '#EDEDED',
    TAB_BLOCK: 'rgba(0, 0, 0, .04)',
    COLUMN_LINE_COLOR: '#979797',
    BTN_DEFAULT_COLOR: '#aaaaaa33',
    BTN_DEFAULT_TEXT_COLOR: '#66666655',
    BOTTOM_BANNER_BOOK_NAME_COLOR: '#FFFFFF',
    RANK_MORE_ARROW: '#999999',
    BOTTOM_BANNER_BG_COLOR: '#8f8f8f',
  },
  Night: {
    A1: '#686d74',
    A2: '#50555c',
    A3: '#42464d',
    A4: '#34383e',
    A5: '#7f8386',
    A6: '#50555c',
    A8: '#A6A9B0',
    B1: '#395c86',
    B2: '#74322d',
    B3: '#79591d',
    NEW_B3: '#05B551',
    B4: '#3b637d',
    B5: '#794136',
    B5_1: 'rgba(121,65,54, 0.2)',
    B6: '#376924',
    B7: '#795617',
    B8: '#793b3e',
    B9: '#163A6C',
    B10: '#795617',
    D1: '#202327',
    D1_1: '#202327',
    D2: '#31363b',
    D2_1: '#31363bff',
    D2_2: '#31363b66',
    D3: '#1e2125',
    D3_1: '#24292F',
    D4: '#31363b',
    D5: '#23282d',
    D5_1: '#202327ff',
    D5_2: '#23282d',
    D6: '#202328',
    D7: '#23282d',
    E1: '#E5E5E5',
    E2: '#FF8132', // 品牌色
    E3: '#4C98F5',
    I1: '#686d74',
    N1: '#686D74',
    N1_1: 'rgba(104, 109, 116, 0.3)',
    N1_2: 'rgba(104, 109, 116, 0.04)',
    N1_3: '#000000',
    N1_4: 'rgba(104, 109, 116, 0.4)',
    N1_5: 'rgba(104, 109, 116, 0.8)',
    N1_6: 'rgba(104, 109, 116, 0.1)',
    N1_7: 'rgba(104, 109, 116, 0.5)',
    N1_8: 'rgba(104, 109, 116, 0.2)',
    N1_85: 'rgba(104, 109, 116, 0.25)',
    N1_9: '#635647',
    N1_10: 'rgba(0, 0, 0, 0.55)',
    N2: '#B0906C',
    N2_1: 'rgba(176, 144, 108, 0.1)',
    N2_2: 'rgba(176, 144, 108, 0.2)',
    N3: '#794543',
    N3_1: 'rgba(121, 69, 67, 0.1)',
    N4: '#215E4D',
    N5: '#315C7D',
    N5_1: 'rgba(49, 92, 125, 0.1)',
    N6: '#4B6769',
    N6_1: 'rgba(75, 103, 105, 0.1)',
    N7: '#434969',
    N7_1: 'rgba(67, 73, 105, 0.1)',
    N8: '#202327',
    N9: '#202327',
    N9_1: '#4B4F58',
    N10: '#A6A9B0B2',
    BTN_CLICK_STATE: '#395c8644',
    NORMAL_BG: '#00000000',
    PRESSED_BG: '#0000001f',
    REFRESH_BG: '#23282df2',
    VOTE_BG1: '#794241',
    VOTE_BG2: '#305976',
    VOTE_TXT1: 'white',
    VOTE_TXT2: 'white',
    PRIZE_TEXT: '#943734',
    SEPARATOR_COLOR: '#1e2125',
    VIDEO_MASK_COLOR: 'black',
    IMG_MASK_COLOR: '#0000004D',
    IMG_TAG_BG: '#0000008C',
    CIRCLE_COMMENT_BG: '#4B4E5133',
    CIRCLE_THEME_COLOR: '#795617',
    NEW_D1: '#4b4e51',
    hobbitGreenBG: '#2d683a',
    hobbitRedBG: '#7b394d',
    hobbitYellowBG: '#79591d',
    NEW_A5: '#7f8386',
    ARROW_ICON_COLOR: '#50555c',
    COMMENT_ICON_COLOR: '#50555c',
    NEW_A4: '#42464d',
    PERSONAL_BG: '#cfcfcf',
    NRE_TAB_TIP_BG: '#803030',
    WRAP_BACKGROUND: '#23282D',
    STATIC_PANEL: '#222429',
    STATIC_PANEL_WORD: '#202227',
    TAB_BLOCK: '#31363B',
    COLUMN_LINE_COLOR: '#979797',
    BTN_DEFAULT_COLOR: '#34383e33',
    BTN_DEFAULT_TEXT_COLOR: '#50555c55',
    BOTTOM_BANNER_BOOK_NAME_COLOR: '#A6A9B0',
    RANK_MORE_ARROW: '#3D4145',
    BOTTOM_BANNER_BG_COLOR: '#42464d',
  },
  Light: {
    A1: '#242424',
    A2: '#24242480',
    A3: '#24242460',
    A4: '#24242440',
    A5: '#ffffff20',
    A6: '#24242480',
    A8: '#ffffff',
    B1: '#4c9afa',
    B2: '#f55318',
    B3: '#FF682D',
    NEW_B3: '#00DD6E',
    B4: '#63c3ff',
    B5: '#FF6E4C',
    B5_1: 'rgba(255,110,76, 0.2)',
    B6: '#0ca64e',
    B7: '#FFA200',
    B8: '#FF5E62',
    B9: '#136CE9',
    B10: '#FFA200',
    D1: '#ffffff10',
    D1_1: '#F0F0F0',
    D2: '#00000010',
    D2_1: '#ffffffff',
    D2_2: '#ffffff66',
    D3: '#00000005',
    D4: '#00000020',
    D5: '#ffffff20',
    D5_1: '#ebebeb',
    D5_2: 'white',
    D6: '#fafafa',
    D7: '#f5f5f54d',
    I1: '#4d4d4d',
    N1: '#000000',
    N1_1: 'rgba(0, 0, 0, 0.3)',
    N1_2: 'rgba(0, 0, 0, 0.04)',
    N1_3: '#000000',
    N1_4: 'rgba(0, 0, 0, 0.4)',
    N1_5: 'rgba(0, 0, 0, 0.7)',
    N1_6: 'rgba(0, 0, 0, 0.1)',
    N1_7: 'rgba(0, 0, 0, 0.5)',
    N1_8: 'rgba(0, 0, 0, 0.2)',
    N1_9: 'rgba(0, 0, 0, 0.5)',
    N1_85: 'rgba(0, 0, 0, 0.85)',
    N1_10: 'rgba(0, 0, 0, 0.55)',
    N2: '#EFBF8A',
    N2_1: '#FDF8F3',
    N3: '#FF796E',
    N3_1: 'rgba(255, 121, 110, 0.1)',
    N4: '#23B787',
    N5: '#4CB2FF',
    N5_1: 'rgba(76, 178, 255, 0.1)',
    N6: '#8BCECE',
    N6_1: 'rgba(139, 206, 206, 0.1)',
    N7: '#7882CD',
    N7_1: 'rgba(120, 130, 205, 0.1)',
    N8: '#F5F7F9',
    N9: 'transparent',
    N9_1: '#8B91A3',
    N10: '#FFFFFFB2',
    BTN_CLICK_STATE: '#4c9afa44',
    NORMAL_BG: '#00000000',
    PRESSED_BG: '#0000001f',
    REFRESH_BG: '#0000000d',
    VOTE_BG1: '#fe7168',
    VOTE_BG2: '#48a9ed',
    VOTE_TXT1: '#ff4f44',
    VOTE_TXT2: '#1c95ea',
    PRIZE_TEXT: '#F44837',
    SEPARATOR_COLOR: '#ebebeb',
    VIDEO_MASK_COLOR: '#242424',
    IMG_MASK_COLOR: '#0000004D',
    IMG_TAG_BG: '#0000008C',
    CIRCLE_COMMENT_BG: '#F8F8F833',
    CIRCLE_THEME_COLOR: '#FFA200',
    NEW_D1: '#f8f8f888',
    hobbitGreenBG: '#3dd05d',
    hobbitRedBG: '#fe5b8d',
    hobbitYellowBG: '#ffaa0d',
    NEW_A5: 'white',
    ARROW_ICON_COLOR: '#24242480',
    COMMENT_ICON_COLOR: '#BBBBBB80',
    NEW_A4: '#24242440',
    PERSONAL_BG: '#cfcfcf',
    NRE_TAB_TIP_BG: '#F34A46',
    WRAP_BACKGROUND: '#FAFAFA',
    STATIC_PANEL: Platform.OS === 'android' ? 'white' : '#FAFAFA',
    STATIC_PANEL_WORD: Platform.OS === 'android' ? '#F2F2F2' : '#EDEDED',
    TAB_BLOCK: 'rgba(0, 0, 0, .04)',
    COLUMN_LINE_COLOR: '#979797',
    BTN_DEFAULT_COLOR: '#24242433',
    BTN_DEFAULT_TEXT_COLOR: '#24242455',
    BOTTOM_BANNER_BOOK_NAME_COLOR: '#FFFFFF',
    RANK_MORE_ARROW: '#999999',
    BOTTOM_BANNER_BG_COLOR: '#8f8f8f',
  },
  Dark: {
    A1: 'white',
    A2: '#ffffff80',
    A3: '#ffffff60',
    A4: '#ffffff40',
    A5: 'white',
    A6: '#ffffff80',
    A8: '#A6A9B0',
    B1: '#395c86',
    B2: '#74322d',
    B3: '#79591d',
    NEW_B3: '#00DD6E',
    B4: '#3d637d',
    B5: '#794136',
    B5_1: 'rgba(121,65,54, 0.2)',
    B6: '#376924',
    B7: '#795617',
    B8: '#793b3e',
    B9: '#163A6C',
    B10: '#795617',
    D1: '#00000020',
    D1_1: '#00000020',
    D2: '#ffffff10',
    D2_1: '#31363bff',
    D2_2: '#31363b66',
    D3: '#00000005',
    D4: '#ffffff20',
    D5: '#00000010',
    D5_1: '#202327ff',
    D5_2: 'rgba(0, 0, 0, 0.8)',
    D6: '#202328',
    D7: '#ffffff19',
    I1: '#686d74',
    N1: '#ffffff',
    N1_1: '#ffffff',
    N1_2: '#ffffff',
    N1_3: '#000000',
    N1_4: 'rgba(255, 255, 255, 0.55)',
    N1_5: 'rgba(104, 109, 116, 0.8)',
    N1_6: 'rgba(104, 109, 116, 0.1)',
    N1_7: 'rgba(104, 109, 116, 0.5)',
    N1_8: 'rgba(104, 109, 116, 0.2)',
    N1_85: 'rgba(104, 109, 116, 0.25)',
    N1_9: '#635647',
    N1_10: 'rgba(0, 0, 0, 0.55)',
    N2: '#B0906C',
    N2_1: '#343231',
    N3: '#794543',
    N3_1: 'rgba(121, 69, 67, 0.1)',
    N4: '#215E4D',
    N5: '#315C7D',
    N5_1: 'rgba(49, 92, 125, 0.1)',
    N6: '#4B6769',
    N6_1: 'rgba(75, 103, 105, 0.1)',
    N7: '#434969',
    N7_1: 'rgba(67, 73, 105, 0.1)',
    N8: '#202327',
    N9: 'transparent',
    N9_1: '#4B4F58',
    N10: '#A6A9B0B2',
    BTN_CLICK_STATE: '#395c8644',
    NORMAL_BG: '#00000000',
    PRESSED_BG: '#0000001f',
    REFRESH_BG: '#0000000d',
    VOTE_BG1: '#fe7168',
    VOTE_BG2: '#48a9ed',
    VOTE_TXT1: 'white',
    VOTE_TXT2: 'white',
    PRIZE_TEXT: '#943734',
    SEPARATOR_COLOR: '#1e2125',
    VIDEO_MASK_COLOR: 'black',
    IMG_MASK_COLOR: '#0000004D',
    IMG_TAG_BG: '#0000008C',
    CIRCLE_COMMENT_BG: '#4B4E5133',
    NEW_D1: '#4b4e5188',
    hobbitGreenBG: '#2d683a',
    hobbitRedBG: '#7b394d',
    hobbitYellowBG: '#79591d',
    NEW_A5: '#7F8386',
    ARROW_ICON_COLOR: '#ffffff80',
    COMMENT_ICON_COLOR: '#ffffff80',
    NEW_A4: '#ffffff40',
    PERSONAL_BG: '#cfcfcf',
    STATIC_PANEL: '#222429',
    STATIC_PANEL_WORD: '#202227',
    CIRCLE_THEME_COLOR: '#795617',
    NRE_TAB_TIP_BG: '#F34A46',
    WRAP_BACKGROUND: '#FAFAFA',
    TAB_BLOCK: '#31363B',
    COLUMN_LINE_COLOR: '#979797',
    BTN_DEFAULT_COLOR: '#ffffff33',
    BTN_DEFAULT_TEXT_COLOR: '#ffffff55',
    BOTTOM_BANNER_BOOK_NAME_COLOR: '#A6A9B0',
    RANK_MORE_ARROW: '#3D4145',
    BOTTOM_BANNER_BG_COLOR: '#42464d',
  },
};

export default class FeedsTheme {
  public static FeedsColors = {
    GRAY: 0,
    RED: 1,
    BLUE: 2,
    BLACK: 3,
    WX_GREEN: 6,
  };
  public static skinMode = SkinModelType.NORMAL; // 日间：0 夜间：1 浅色：2 深色：3;
  public static Normal = DefColors.Normal; // 不支持切换皮肤
  public static Simplify = DefColors.Normal; // 仅支持切换夜间皮肤 在图片上的字需要用这套 (已废弃)
  public static Color = DefColors.Normal; // 支持切换4种皮肤 (已废弃)
  public static LiteColor = {
    // 仅支持切换夜间皮肤 在图片上的字需要用这套
    A1: [DefColors.Normal.A1, DefColors.Night.A1],
    A2: [DefColors.Normal.A2, DefColors.Night.A2],
    A3: [DefColors.Normal.A3, DefColors.Night.A3],
    A4: [DefColors.Normal.A4, DefColors.Night.A4],
    A5: [DefColors.Normal.A5, DefColors.Night.A5],
    A6: [DefColors.Normal.A6, DefColors.Night.A6],
    B1: [DefColors.Normal.B1, DefColors.Night.B1],
    B2: [DefColors.Normal.B2, DefColors.Night.B2],
    B3: [DefColors.Normal.B3, DefColors.Night.B3],
    NEW_B3: [DefColors.Normal.NEW_B3, DefColors.Night.NEW_B3],
    B4: [DefColors.Normal.B4, DefColors.Night.B4],
    B5: [DefColors.Normal.B5, DefColors.Night.B5],
    B6: [DefColors.Normal.B6, DefColors.Night.B6],
    B7: [DefColors.Normal.B7, DefColors.Night.B7],
    B8: [DefColors.Normal.B8, DefColors.Night.B8],
    B9: [DefColors.Normal.B9, DefColors.Night.B9],
    B10: [DefColors.Normal.B10, DefColors.Night.B10],
    D1: [DefColors.Normal.D1, DefColors.Night.D1],
    D2: [DefColors.Normal.D2, DefColors.Night.D2],
    D2_1: [DefColors.Normal.D2_1, DefColors.Night.D2_1],
    D2_2: [DefColors.Normal.D2_2, DefColors.Night.D2_2],
    D3: [DefColors.Normal.D3, DefColors.Night.D3],
    D4: [DefColors.Normal.D4, DefColors.Night.D4],
    D5: [DefColors.Normal.D5, DefColors.Night.D5],
    N9_1: [DefColors.Normal.N9_1, DefColors.Night.N9_1, DefColors.Light.N9_1, DefColors.Dark.N9_1],
    D5_1: [DefColors.Normal.D5_1, DefColors.Night.D5_1],
    D5_2: [DefColors.Normal.D5_2, DefColors.Night.D5_2],
    I1: [DefColors.Normal.I1, DefColors.Night.I1],
    TAB_BLOCK: [DefColors.Normal.TAB_BLOCK, DefColors.Night.TAB_BLOCK],
  };
  public static REFRESH_THEME = {
    textHideColor: '#4A4A4A',
    textColor: 'white',
    // light: ['#1572FD', '#4ABFF9'],
    light: ['#0565FF', '#0565FF'],
    dark: ['#395c86', '#395c86'],
  };
  public static SkinColor = {
    A1: [DefColors.Normal.A1, DefColors.Night.A1, DefColors.Light.A1, DefColors.Dark.A1],
    A2: [DefColors.Normal.A2, DefColors.Night.A2, DefColors.Light.A2, DefColors.Dark.A2],
    A3: [DefColors.Normal.A3, DefColors.Night.A3, DefColors.Light.A3, DefColors.Dark.A3],
    A4: [DefColors.Normal.A4, DefColors.Night.A4, DefColors.Light.A4, DefColors.Dark.A4],
    A5: [DefColors.Normal.A5, DefColors.Night.A5, DefColors.Light.A5, DefColors.Dark.A5],
    A6: [DefColors.Normal.A6, DefColors.Night.A6, DefColors.Light.A6, DefColors.Dark.A6],
    A7: [DefColors.Normal.A5, DefColors.Night.A5, DefColors.Night.A1, DefColors.Dark.A5],
    A8: [DefColors.Normal.A8, DefColors.Night.A8, DefColors.Night.A8, DefColors.Dark.A8],
    B1: [DefColors.Normal.B1, DefColors.Night.B1, DefColors.Light.B1, DefColors.Dark.B1],
    B1_1: [DefColors.Normal.B1, DefColors.Night.B1, DefColors.Light.B1, DefColors.Dark.B1],
    B2: [DefColors.Normal.B2, DefColors.Night.B2, DefColors.Light.B2, DefColors.Dark.B2],
    B3: [DefColors.Normal.B3, DefColors.Night.B3, DefColors.Light.B3, DefColors.Dark.B3],
    NEW_B3: [DefColors.Normal.NEW_B3, DefColors.Night.NEW_B3, DefColors.Light.NEW_B3, DefColors.Dark.NEW_B3],
    B4: [DefColors.Normal.B4, DefColors.Night.B4, DefColors.Light.B4, DefColors.Dark.B4],
    B5: [DefColors.Normal.B5, DefColors.Night.B5, DefColors.Light.B5, DefColors.Dark.B5],
    B5_1: [DefColors.Normal.B5_1, DefColors.Night.B5_1, DefColors.Light.B5_1, DefColors.Dark.B5_1],
    B6: [DefColors.Normal.B6, DefColors.Night.B6, DefColors.Light.B6, DefColors.Dark.B6],
    B7: [DefColors.Normal.B7, DefColors.Night.B7, DefColors.Light.B7, DefColors.Dark.B7],
    B8: [DefColors.Normal.B8, DefColors.Night.B8, DefColors.Light.B8, DefColors.Dark.B8],
    B9: [DefColors.Normal.B9, DefColors.Night.B9, DefColors.Light.B9, DefColors.Dark.B9],
    B10: [DefColors.Normal.B10, DefColors.Night.B10, DefColors.Light.B10, DefColors.Dark.B10],
    D1: [DefColors.Normal.D1, DefColors.Night.D1, DefColors.Light.D1, DefColors.Dark.D1],
    D1_1: [DefColors.Normal.D1_1, DefColors.Night.D1_1, DefColors.Light.D1_1, DefColors.Dark.D1_1],
    D2: [DefColors.Normal.D2, DefColors.Night.D2, DefColors.Light.D2, DefColors.Dark.D2],
    D2_1: [DefColors.Normal.D2_1, DefColors.Night.D2_1, DefColors.Light.D2_1, DefColors.Dark.D2_1],
    D2_2: [DefColors.Normal.D2_2, DefColors.Night.D2_2, DefColors.Light.D2_2, DefColors.Dark.D2_2],
    D3: [DefColors.Normal.D3, DefColors.Night.D3, DefColors.Light.D3, DefColors.Dark.D3],
    D4: [DefColors.Normal.D4, DefColors.Night.D4, DefColors.Light.D4, DefColors.Dark.D4],
    D5: [DefColors.Normal.D5, DefColors.Night.D5, DefColors.Light.D5, DefColors.Dark.D5],
    D5_1: [DefColors.Normal.D5_1, DefColors.Night.D5_1, DefColors.Light.D5_1, DefColors.Dark.D5_1],
    D5_2: [DefColors.Normal.D5_2, DefColors.Night.D5_2, DefColors.Light.D5_2, DefColors.Dark.D5_2],
    D5_3: [DefColors.Normal.D5, DefColors.Night.D5, DefColors.Normal.D5, DefColors.Normal.D5],
    D6: [DefColors.Normal.D6, DefColors.Night.D6, DefColors.Light.D6, DefColors.Dark.D6],
    D7: [DefColors.Normal.D7, DefColors.Night.D7, DefColors.Light.D7, DefColors.Dark.D7],
    I1: [DefColors.Normal.I1, DefColors.Night.I1, DefColors.Light.I1, DefColors.Dark.I1],
    N1: [DefColors.Normal.N1, DefColors.Night.N1, DefColors.Light.N1, DefColors.Dark.N1],
    N1_1: [DefColors.Normal.N1_1, DefColors.Night.N1_1, DefColors.Light.N1_1, DefColors.Dark.N1_1],
    N1_2: [DefColors.Normal.N1_2, DefColors.Night.N1_2, DefColors.Light.N1_2, DefColors.Dark.N1_2],
    N1_3: [DefColors.Normal.N1_3, DefColors.Night.N1_3, DefColors.Light.N1_3, DefColors.Dark.N1_3],
    N1_4: [DefColors.Normal.N1_4, DefColors.Night.N1_4, DefColors.Light.N1_4, DefColors.Dark.N1_4],
    N1_5: [DefColors.Normal.N1_5, DefColors.Night.N1_5, DefColors.Light.N1_5, DefColors.Dark.N1_5],
    N1_6: [DefColors.Normal.N1_6, DefColors.Night.N1_6, DefColors.Light.N1_6, DefColors.Dark.N1_6],
    N1_7: [DefColors.Normal.N1_7, DefColors.Night.N1_7, DefColors.Light.N1_7, DefColors.Dark.N1_7],
    N1_8: [DefColors.Normal.N1_8, DefColors.Night.N1_8, DefColors.Light.N1_8, DefColors.Dark.N1_8],
    N1_85: [DefColors.Normal.N1_85, DefColors.Night.N1_85, DefColors.Light.N1_85, DefColors.Dark.N1_85],
    N1_10: [DefColors.Normal.N1_10, DefColors.Night.N1_10, DefColors.Light.N1_10, DefColors.Dark.N1_10],
    N1_9: [DefColors.Normal.N1_9, DefColors.Night.N1_9, DefColors.Light.N1_9, DefColors.Dark.N1_9],
    N2: [DefColors.Normal.N2, DefColors.Night.N2, DefColors.Light.N2, DefColors.Dark.N2],
    N2_1: [DefColors.Normal.N2_1, DefColors.Night.N2_1, DefColors.Light.N2_1, DefColors.Dark.N2_1],
    N2_2: [DefColors.Normal.N2_2, DefColors.Night.N2_2, DefColors.Light.N2_1, DefColors.Dark.N2_1],
    N3: [DefColors.Normal.N3, DefColors.Night.N3, DefColors.Light.N3, DefColors.Dark.N3],
    N3_1: [DefColors.Normal.N3_1, DefColors.Night.N3_1, DefColors.Light.N3_1, DefColors.Dark.N3_1],
    N4: [DefColors.Normal.N4, DefColors.Night.N4, DefColors.Light.N4, DefColors.Dark.N4],
    N5: [DefColors.Normal.N5, DefColors.Night.N5, DefColors.Light.N5, DefColors.Dark.N5],
    N5_1: [DefColors.Normal.N5_1, DefColors.Night.N5_1, DefColors.Light.N5_1, DefColors.Dark.N5_1],
    N6: [DefColors.Normal.N6, DefColors.Night.N6, DefColors.Light.N6, DefColors.Dark.N6],
    N6_1: [DefColors.Normal.N6_1, DefColors.Night.N6_1, DefColors.Light.N6_1, DefColors.Dark.N6_1],
    N7: [DefColors.Normal.N7, DefColors.Night.N7, DefColors.Light.N7, DefColors.Dark.N7],
    N7_1: [DefColors.Normal.N7_1, DefColors.Night.N7_1, DefColors.Light.N7_1, DefColors.Dark.N7_1],
    N8: [DefColors.Normal.N8, DefColors.Night.N8, DefColors.Light.N8, DefColors.Dark.N8],
    N9: [DefColors.Normal.N9, DefColors.Night.N9, DefColors.Light.N9, DefColors.Dark.N9],
    N9_1: [DefColors.Normal.N9_1, DefColors.Night.N9_1, DefColors.Light.N9_1, DefColors.Dark.N9_1],
    N10: [DefColors.Normal.N10, DefColors.Night.N10, DefColors.Light.N10, DefColors.Dark.N10],
    NORMAL_BG: [
      DefColors.Normal.NORMAL_BG,
      DefColors.Night.NORMAL_BG,
      DefColors.Light.NORMAL_BG,
      DefColors.Dark.NORMAL_BG,
    ],
    PRESSED_BG: [
      DefColors.Normal.PRESSED_BG,
      DefColors.Night.PRESSED_BG,
      DefColors.Light.PRESSED_BG,
      DefColors.Dark.PRESSED_BG,
    ],
    REFRESH_BG: [
      DefColors.Normal.REFRESH_BG,
      DefColors.Night.REFRESH_BG,
      DefColors.Light.REFRESH_BG,
      DefColors.Dark.REFRESH_BG,
    ],
    VOTE_BG1: [DefColors.Normal.VOTE_BG1, DefColors.Night.VOTE_BG1, DefColors.Light.VOTE_BG1, DefColors.Dark.VOTE_BG1],
    VOTE_BG2: [DefColors.Normal.VOTE_BG2, DefColors.Night.VOTE_BG2, DefColors.Light.VOTE_BG2, DefColors.Dark.VOTE_BG2],
    VOTE_TXT1: [
      DefColors.Normal.VOTE_TXT1,
      DefColors.Night.VOTE_TXT1,
      DefColors.Light.VOTE_TXT1,
      DefColors.Dark.VOTE_TXT1,
    ],
    VOTE_TXT2: [
      DefColors.Normal.VOTE_TXT2,
      DefColors.Night.VOTE_TXT2,
      DefColors.Light.VOTE_TXT2,
      DefColors.Dark.VOTE_TXT2,
    ],
    PRIZE_TEXT: [
      DefColors.Normal.PRIZE_TEXT,
      DefColors.Night.PRIZE_TEXT,
      DefColors.Light.PRIZE_TEXT,
      DefColors.Dark.PRIZE_TEXT,
    ],
    SEPARATOR_COLOR: [
      DefColors.Normal.SEPARATOR_COLOR,
      DefColors.Night.SEPARATOR_COLOR,
      DefColors.Light.SEPARATOR_COLOR,
      DefColors.Dark.SEPARATOR_COLOR,
    ],
    VIDEO_MASK_COLOR: [
      DefColors.Normal.VIDEO_MASK_COLOR,
      DefColors.Night.VIDEO_MASK_COLOR,
      DefColors.Light.VIDEO_MASK_COLOR,
      DefColors.Dark.VIDEO_MASK_COLOR,
    ],
    IMG_MASK_COLOR: [
      DefColors.Normal.IMG_MASK_COLOR,
      DefColors.Night.IMG_MASK_COLOR,
      DefColors.Light.IMG_MASK_COLOR,
      DefColors.Dark.IMG_MASK_COLOR,
    ],
    IMG_TAG_BG: [
      DefColors.Normal.IMG_TAG_BG,
      DefColors.Night.IMG_TAG_BG,
      DefColors.Light.IMG_TAG_BG,
      DefColors.Dark.IMG_TAG_BG,
    ],
    CIRCLE_COMMENT_BG: [
      DefColors.Normal.CIRCLE_COMMENT_BG,
      DefColors.Night.CIRCLE_COMMENT_BG,
      DefColors.Light.CIRCLE_COMMENT_BG,
      DefColors.Dark.CIRCLE_COMMENT_BG,
    ],
    CIRCLE_THEME_COLOR: [
      DefColors.Normal.CIRCLE_THEME_COLOR,
      DefColors.Night.CIRCLE_THEME_COLOR,
      DefColors.Light.CIRCLE_THEME_COLOR,
      DefColors.Dark.CIRCLE_THEME_COLOR,
    ],
    LOGIN_SUB_TITLE: [DefColors.Normal.A2, DefColors.Normal.A2, DefColors.Normal.A2, DefColors.Normal.A2],
    NEW_D1: [DefColors.Normal.NEW_D1, DefColors.Night.NEW_D1, DefColors.Light.NEW_D1, DefColors.Dark.NEW_D1],
    hobbitGreenBG: [
      DefColors.Normal.hobbitGreenBG,
      DefColors.Night.hobbitGreenBG,
      DefColors.Light.hobbitGreenBG,
      DefColors.Dark.hobbitGreenBG,
    ],
    hobbitRedBG: [
      DefColors.Normal.hobbitRedBG,
      DefColors.Night.hobbitRedBG,
      DefColors.Light.hobbitRedBG,
      DefColors.Dark.hobbitRedBG,
    ],
    hobbitYellowBG: [
      DefColors.Normal.hobbitYellowBG,
      DefColors.Night.hobbitYellowBG,
      DefColors.Light.hobbitYellowBG,
      DefColors.Dark.hobbitYellowBG,
    ],
    NEW_A5: [DefColors.Normal.NEW_A5, DefColors.Night.NEW_A5, DefColors.Light.NEW_A5, DefColors.Dark.NEW_A5],
    PERSONAL_BG: [
      DefColors.Normal.PERSONAL_BG,
      DefColors.Night.PERSONAL_BG,
      DefColors.Light.PERSONAL_BG,
      DefColors.Dark.PERSONAL_BG,
    ],
    STATIC_PANEL: [
      DefColors.Normal.STATIC_PANEL,
      DefColors.Night.STATIC_PANEL,
      DefColors.Light.STATIC_PANEL,
      DefColors.Dark.STATIC_PANEL,
    ],
    STATIC_PANEL_WORD: [
      DefColors.Normal.STATIC_PANEL_WORD,
      DefColors.Night.STATIC_PANEL_WORD,
      DefColors.Light.STATIC_PANEL_WORD,
      DefColors.Dark.STATIC_PANEL_WORD,
    ],
    ARROW_ICON_COLOR: [
      DefColors.Normal.ARROW_ICON_COLOR,
      DefColors.Night.ARROW_ICON_COLOR,
      DefColors.Light.ARROW_ICON_COLOR,
      DefColors.Dark.ARROW_ICON_COLOR,
    ],
    COMMENT_ICON_COLOR: [
      DefColors.Normal.COMMENT_ICON_COLOR,
      DefColors.Night.COMMENT_ICON_COLOR,
      DefColors.Light.COMMENT_ICON_COLOR,
      DefColors.Dark.COMMENT_ICON_COLOR,
    ],
    NRE_TAB_TIP_BG: [
      DefColors.Normal.NRE_TAB_TIP_BG,
      DefColors.Night.NRE_TAB_TIP_BG,
      DefColors.Light.NRE_TAB_TIP_BG,
      DefColors.Dark.NRE_TAB_TIP_BG,
    ],
    WRAP_BACKGROUND: [
      DefColors.Normal.WRAP_BACKGROUND,
      DefColors.Night.WRAP_BACKGROUND,
      DefColors.Light.WRAP_BACKGROUND,
      DefColors.Dark.WRAP_BACKGROUND,
    ],
    TAB_BLOCK: [
      DefColors.Normal.TAB_BLOCK,
      DefColors.Night.TAB_BLOCK,
      DefColors.Light.TAB_BLOCK,
      DefColors.Dark.TAB_BLOCK,
    ],
    NEW_A4: [DefColors.Normal.NEW_A4, DefColors.Night.NEW_A4, DefColors.Light.NEW_A4, DefColors.Dark.NEW_A4],
    COLUMN_LINE_COLOR: [
      DefColors.Normal.COLUMN_LINE_COLOR,
      DefColors.Night.COLUMN_LINE_COLOR,
      DefColors.Light.COLUMN_LINE_COLOR,
      DefColors.Dark.COLUMN_LINE_COLOR,
    ],
    BTN_CLICK_STATE: [
      DefColors.Normal.BTN_CLICK_STATE,
      DefColors.Night.BTN_CLICK_STATE,
      DefColors.Light.BTN_CLICK_STATE,
      DefColors.Dark.BTN_CLICK_STATE,
    ],
    BTN_DEFAULT_COLOR: [
      DefColors.Normal.BTN_DEFAULT_COLOR,
      DefColors.Night.BTN_DEFAULT_COLOR,
      DefColors.Light.BTN_DEFAULT_COLOR,
      DefColors.Dark.BTN_DEFAULT_COLOR,
    ],
    BTN_DEFAULT_TEXT_COLOR: [
      DefColors.Normal.BTN_DEFAULT_TEXT_COLOR,
      DefColors.Night.BTN_DEFAULT_TEXT_COLOR,
      DefColors.Light.BTN_DEFAULT_TEXT_COLOR,
      DefColors.Dark.BTN_DEFAULT_TEXT_COLOR,
    ],
    LIVE_HOME: [DefColors.Normal.D5, DefColors.Night.D5, DefColors.Light.D5, DefColors.Dark.D5],
    BOTTOM_BANNER_BOOK_NAME_COLOR: [
      DefColors.Normal.BOTTOM_BANNER_BOOK_NAME_COLOR,
      DefColors.Night.BOTTOM_BANNER_BOOK_NAME_COLOR,
      DefColors.Light.BOTTOM_BANNER_BOOK_NAME_COLOR,
      DefColors.Dark.BOTTOM_BANNER_BOOK_NAME_COLOR,
    ],
    RANK_MORE_ARROW: [
      DefColors.Normal.RANK_MORE_ARROW,
      DefColors.Night.RANK_MORE_ARROW,
      DefColors.Light.RANK_MORE_ARROW,
      DefColors.Dark.RANK_MORE_ARROW,
    ],
    BOTTOM_BANNER_BG_COLOR: [
      DefColors.Normal.BOTTOM_BANNER_BG_COLOR,
      DefColors.Night.BOTTOM_BANNER_BG_COLOR,
      DefColors.Light.BOTTOM_BANNER_BG_COLOR,
      DefColors.Dark.BOTTOM_BANNER_BG_COLOR,
    ],
  };
  public static returnSkinId = (): SkinModelType => FeedsTheme.skinMode;
  public static changeSkinMode = function (skinMode: SkinModelType): void {
    FeedsTheme.skinMode = skinMode;
    switch (FeedsTheme.skinMode) {
      default:
        FeedsTheme.Color = DefColors.Normal;
        FeedsTheme.Simplify = DefColors.Normal;
        break;
      case SkinModelType.NIGHT:
        FeedsTheme.Color = DefColors.Night;
        FeedsTheme.Simplify = DefColors.Night;
        break;
      case SkinModelType.LIGHT:
        FeedsTheme.Color = DefColors.Light as any;
        FeedsTheme.Simplify = DefColors.Normal;
        break;
      case SkinModelType.DARK:
        FeedsTheme.Color = DefColors.Dark as any;
        FeedsTheme.Simplify = DefColors.Normal;
        break;
    }
  };
  public static getFeedsColor(feedsColor) {
    switch (feedsColor) {
      case FeedsTheme.FeedsColors.BLACK:
        return FeedsTheme.SkinColor.A1;
      case FeedsTheme.FeedsColors.RED:
        return FeedsTheme.SkinColor.B2;
      case FeedsTheme.FeedsColors.BLUE:
        return FeedsTheme.SkinColor.B1;
      case FeedsTheme.FeedsColors.WX_GREEN:
        return ['#1AAD19', DefColors.Night.B6, '#1AAD19', DefColors.Dark.B6];
      default:
        return FeedsTheme.SkinColor.A3;
    }
  }
  public static isNightMode = (): boolean => [SkinModelType.NIGHT, SkinModelType.DARK].includes(FeedsTheme.skinMode);
}
