declare module '@tencent/hippy-react-qb' {
  const Hippy: any;
  type Hippy = any;

  const ImageBackground: any;
  const ImageLoaderModule: any;
  const AnimationSet: any;
  const QBViewPager: any;
  type AnimationSet = any;

  const UIManagerModule: any;
  const PCGStatModule: any;
  const QBAccountModule: any;
  const QBActionSheetModule: any;
  const QBAlertModule: any;
  const QBAppMarketGuideModule: any;
  const QBAudioDownloadModule: any;
  const QBAudioPlayerModule: any;
  const QBAudioSession: any;
  const QBAudioStorageModule: any;
  const QBBrowserObserver: any;
  const QBBusinessADModule: any;
  const QBCircleModule: any;
  const QBDebugModule: any;
  const QBDeviceEventEmitter: any;
  const QBDeviceModule: any;
  const QBDoubleScrollView: any;
  const QBDownloadButton: any;
  const QBDownloadModule: any;
  const QBExploreZView: any;
  const QBFavoritesModule: any;
  const QBFileModule: any;
  const QBFooterView: any;
  const QBGallery: any;
  const QBGalleryNew: any;
  const QBGifImageView: any;
  const QBHistoryModule: any;
  const QBJsNativeCacheModule: any;
  const QBKeyboardAccessoryView: any;
  const QBListView: any;
  const QBListViewWrapper: any;
  const QBLocationModule: any;
  const QBLogsModule: any;
  const QBLoopScrollImage: any;
  const QBLottieView: any;
  const QBMapMarkerView: any;
  const QBMapView: any;
  const QBMessageBubbleModule: any;
  const QBNativeProxyModule: any;
  const QBNovelText: any;
  const QBNowLiveModule: any;
  const QBOfflineResourceModule: any;
  const QBPackageModule: any;
  const QBPhoneCallModule: any;
  const QBPickerView: any;
  const QBPictureModule: any;
  const QBProgressBarView: any;
  const QBQQMiniGameModule: any;
  const QBRechargeModule: any;
  const QBRefreshWebView: any;
  const QBRichEditView: any;
  const QBScoreStar: any;
  const QBShareModule: any;
  const QBSharedSettingModule: any;
  const QBSimpleAudioPlayer: any;
  const QBSimpleAudioRecorder: any;
  const QBStarView: any;
  const QBStatisticModule: any;
  const QBStatusBarModule: any;
  const QBStyledButton: any;
  const QBSuperBgView: any;
  const QBTabHost: any;
  const QBTextUtilsModule: any;
  const QBToastModule: any;
  const QBUserSettingModule: any;
  const QBVRImageView: any;
  const QBVideoAnimationView: any;
  const QBVideoView: any;
  const QBVideoViewForAms: any;
  const QBViewListPager: any;
  const QBWaterfallView: any;
  const QBWeAppModule: any;
  const QBWebView: any;
  const QBWelfareModule: any;
  const QBWifiModule: any;
  const QBWindowModule: any;
  const QBWupModule: any;
  const Taf: any;
  const TouchableFeedback: any;
  const TouchableOpacity: any;
  const TouchableWithoutFeedback: any;
  const Dimensions: any;
  const PixelRatio: any;
  const AsyncStorage: any;
  const colorParse: any;

  // Platform
  declare namespace Platform {
    const OS: 'ios' | 'android';
  }

  // callNativeWithPromise
  declare function callNativeWithPromise<T>(module: string, bridge: string, data: any): Promise<T>;

  // StyleSheet
  declare namespace StyleSheet {
    type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

    function create<T extends NamedStyles<T> | NamedStyles<any>>(
      styles: T | NamedStyles<T>
    ): T;
  }

  type Falsy = undefined | null | false;
  type RecursiveArray<T> = Array<T | RecursiveArray<T>>;
  type RegisteredStyle<T> = number & { __registeredStyleBrand: T };

  export type StyleProp<T> =
    | T
    | RegisteredStyle<T>
    | RecursiveArray<T | RegisteredStyle<T> | Falsy>
    | Falsy;

  type FlexAlignType =
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'baseline';

  type FlexAjustType =
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around';

  export interface FlexStyle {
    alignContent?: 'stretch' | FlexAjustType;
    alignItems?: FlexAlignType;
    alignSelf?: 'auto' | FlexAlignType;
    aspectRatio?: number;
    borderBottomWidth?: number;
    borderEndWidth?: number | string;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    borderStartWidth?: number | string;
    borderTopWidth?: number;
    borderWidth?: number;
    bottom?: number | string | AnimationType;
    display?: 'none' | 'flex' | 'block' | 'inline-block' | 'inline';
    end?: number | string;
    flex?: number;
    flexBasis?: number | string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
    height?: number | string | AnimationType;
    justifyContent?: 'space-evenly' | FlexAjustType;
    left?: number | string | AnimationType;
    margin?: number | string;
    marginBottom?: number | string;
    marginEnd?: number | string;
    marginHorizontal?: number | string;
    marginLeft?: number | string;
    marginRight?: number | string;
    marginStart?: number | string;
    marginTop?: number | string;
    marginVertical?: number | string;
    maxHeight?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    minWidth?: number | string;
    overflow?: 'visible' | 'hidden' | 'scroll';
    padding?: number | string;
    paddingBottom?: number | string;
    paddingEnd?: number | string;
    paddingHorizontal?: number | string;
    paddingLeft?: number | string;
    paddingRight?: number | string;
    paddingStart?: number | string;
    paddingTop?: number | string;
    paddingVertical?: number | string;
    position?: 'absolute' | 'relative' | 'fixed';
    right?: number | string | AnimationType;
    start?: number | string;
    top?: number | string | AnimationType;
    width?: number | string;
    zIndex?: number;
  }

  interface PerpectiveTransform {
    perspective: number | AnimationType;
  }

  interface RotateTransform {
    rotate: string | AnimationType;
  }

  interface RotateXTransform {
    rotateX: string | AnimationType;
  }

  interface RotateYTransform {
    rotateY: string | AnimationType;
  }

  interface RotateZTransform {
    rotateZ: string | AnimationType;
  }

  interface ScaleTransform {
    scale: number | AnimationType;
  }

  interface ScaleXTransform {
    scaleX: number | AnimationType;
  }

  interface ScaleYTransform {
    scaleY: number | AnimationType;
  }

  interface TranslateXTransform {
    translateX: number | AnimationType;
  }

  interface TranslateYTransform {
    translateY: number | AnimationType;
  }

  interface SkewXTransform {
    skewX: string | AnimationType;
  }

  interface SkewYTransform {
    skewY: string | AnimationType;
  }

  export interface TransformsStyle {
    transform?: ((
      | PerpectiveTransform
      | RotateTransform
      | RotateXTransform
      | RotateYTransform
      | RotateZTransform
      | ScaleTransform
      | ScaleXTransform
      | ScaleYTransform
      | TranslateXTransform
      | TranslateYTransform
      | SkewXTransform
      | SkewYTransform)[]) | string;
    transformMatrix?: Array<number>;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    translateX?: number;
    translateY?: number;
  }

  export interface ViewStyle extends FlexStyle, TransformsStyle {
    backfaceVisibility?: 'visible' | 'hidden';
    backgroundColor?: string;
    backgroundColors?: string[];
    borderBottomColor?: string;
    borderBottomColors?: string[];
    borderBottomEndRadius?: number;
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    borderBottomStartRadius?: number;
    borderBottomWidth?: number;
    borderColor?: string;
    borderColors?: string[];
    borderEndColor?: string;
    borderEndColors?: string[];
    borderLeftColor?: string;
    borderLeftColors?: string[];
    borderLeftWidth?: number;
    borderRadius?: number;
    borderRightColor?: string;
    borderRightColors?: string[];
    borderRightWidth?: number;
    borderStartColor?: string;
    borderStartColors?: string[];
    borderStyle?: 'solid' | 'dotted' | 'dashed';
    borderTopColor?: string;
    borderTopColors?: string[];
    borderTopEndRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderTopStartRadius?: number;
    borderTopWidth?: number;
    borderWidth?: number;
    opacity?: AnimationType | number;
    testID?: string;
    background?: string;
    colors?: string[];
    boxShadowRadius?: number;
    boxShadowColors?: string[];
    boxShadowOpacity?: number;
  }

  export interface ImageStyle extends FlexStyle, TransformsStyle {
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
    backfaceVisibility?: 'visible' | 'hidden';
    borderBottomLeftRadius?: number;
    borderBottomRightRadius?: number;
    backgroundColor?: string;
    backgroundColors?: string[];
    borderColor?: string;
    borderColors?: string[];
    borderWidth?: number;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    overflow?: 'visible' | 'hidden' | 'scroll';
    overlayColor?: string;
    tintColor?: string;
    tintColors?: string[];
    opacity?: number | Animation;
  }

  export interface TextStyle extends ViewStyle {
    color?: string;
    colors?: string[];
    fontFamily?: string;
    fontSize?: number;
    fontStyle?: 'normal' | 'italic';
    fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
    letterSpacing?: number;
    lineHeight?: number;
    textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    textDecorationLine?:
    | 'none'
    | 'underline'
    | 'line-through'
    | 'underline line-through';
    textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
    textDecorationColor?: string;
    textDecorationColos?: string[];
    textShadowColor?: string;
    textShadowColors?: string[];
    textShadowOffset?: { width: number; height: number };
    textShadowRadius?: number;
    testID?: string;
    textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  }

  // 点击事件和触发事件返回值，决定是否继续冒泡
  type TouchableReturn = void | boolean | Record<string, any>;

  export interface TouchableEvent<T> {
    name: T;
    id: number;
    page_x: number;
    page_y: number;
  }

  export interface Touchable {
    // 点击事件
    onClick?: () => TouchableReturn;
    onPressIn?: () => TouchableReturn;
    onPressOut?: () => TouchableReturn;
    onLongClick?: () => TouchableReturn;

    // 触模事件
    onTouchDown?: (event: TouchableEvent<'onTouchDown'>) => TouchableReturn;
    onTouchMove?: (event: TouchableEvent<'onTouchMove'>) => TouchableReturn;
    onTouchEnd?: (event: TouchableEvent<'onTouchEnd'>) => TouchableReturn;
    onTouchCancel?: (event: TouchableEvent<'onTouchCancel'>) => TouchableReturn;

    // h5触摸事件
    onResponderGrant?: (event: any) => void;
    onResponderMove?: (event: any) => void;
    onResponderRelease?: (event: any) => void;
    onResponderTerminate?: (event: any) => void;
  }

  // 通用hippy事件
  export interface HippyEvent<T> {
    nativeEvent: T;
  }

  export interface HippyBridgeEvent<T = any> {
    code: number;
    event: string;
    data: T
  }

  export interface LayoutChangeEvent {
    layout: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }

  export interface ScrollEvent {
    contentOffset: {
      x: number;
      y: number;
    }
  }

  export interface Layout {
    onLayout?: (event: LayoutChangeEvent) => void;

    onAttachedToWindow?: () => void;

    onDetachedFromWindow?: () => void;

    ref?: any;

    className?: string;
  }

  // View

  // Android特有属性
  export interface ViewPropsAndroid {
    collapsable?: boolean;
  }

  // 公共属性
  export interface ViewProps
    extends ViewPropsAndroid,
    Touchable,
    Layout {
    style?: StyleProp<ViewStyle>;

    className?: string;

    accessibilityLabel?: string;

    accessible?: boolean;

    opacity?: number;

    overflow?: 'visible' | 'hidden';

    pointerEvents?: string;

    // 大同上报属性
    dt_eid?: string;
    dt_params?: string;
    dt_pgid?: string;
    dt_pg_params?: string;
  }

  declare class ViewComponent extends React.Component<ViewProps> { }
  // 组件API
  export class View extends ViewComponent { }

  // Image
  type ResizeMode = 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  export interface ImageProps
    extends Touchable,
    Layout {
    style?: StyleProp<ImageStyle>;

    onLoad?: () => void;

    onLoadEnd?: () => void;

    onLoadStart?: () => void;

    resizeMode?: ResizeMode;

    source: {
      uri?: string;
    } | string;

    defaultSource?: string;

    onError?: (event: HippyEvent<{ error: string }>) => void;

    capInsets?: (option: {
      top: number;
      left: number;
      bottom: number;
      right: number;
    }) => void;

    onProgress?: (event: HippyEvent<{ loaded: number; total: number }>) => void;

    noPicMode?: {
      enable: boolean;
    };

    nightMode?: {
      enable: boolean;
    };

    reportData?: {
      sourceFrom?: string;
    }

    pointerEvents?: string;

    accessibilityLabel?: string;

    accessible?: boolean;

    tintColor?: string;

    tintColors?: string[];
  }

  declare class ImageComponent extends React.Component<ImageProps> { }
  export class Image extends ImageComponent {
    public static get resizeMode(): {
      [T in ResizeMode]: T;
    };

    public static getSize: (uri: string) => Promise<{width: number, height: number}>;

    public static prefetch: (url: string) => void;
  }

  // Text
  export interface TextProps
    extends Touchable,
    Layout {
    style?: StyleProp<TextStyle>;

    numberOfLines?: number;

    onPress?: () => void;

    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';

    opacity?: number;

    dangerouslySetInnerHTML?: { __html: string };
  }

  declare class TextComponent extends React.Component<TextProps> { }
  export class Text extends TextComponent { }

  // TextInput
  export interface TextInputPropsAndroid {
    underlineColorAndroid?: string;
  }

  export interface TextInputProps
    extends TextInputPropsAndroid,
    Touchable,
    Layout {
    style?: StyleProp<TextStyle>;

    autoFocus?: boolean;

    defaultValue?: string;

    editable?: boolean;

    keyboardType?: 'default' | 'numeric' | 'password' | 'email' | 'phone-pad';

    maxLength?: number;

    multiline?: boolean;

    numberOfLines?: boolean;

    onBlur?: () => void;

    onChangeText?: (value: string) => void;

    onKeyboardWillShow?: (event: { keyboardHeight: number }) => void;

    onEndEditing?: (event: {text: string}) => void;

    onSelectionChange?: (
      event: HippyEvent<{ selection: { start: number; end: number } }>
    ) => void;

    placeholder?: string;

    placeholderTextColor?: string;

    returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';

    value?: string;
  }

  declare class TextInputComponent extends React.Component<TextInputProps> { }
  export class TextInput extends TextInputComponent {
    public clear: () => void;

    public focus: () => void;

    public blur: () => void;
  }

  // ScrollView
  export interface ScrollViewProps
    extends Layout,
    Touchable {
    style?: StyleProp<ViewStyle>;

    contentContainerStyle?: StyleProp<ViewStyle>;

    onMomentumScrollBegin?: () => void;

    onMomentumScrollEnd?: (event: ScrollEvent) => void;

    onScroll?: (event: ScrollEvent) => void;

    onScrollBeginDrag?: (event: ScrollEvent) => void;

    onScrollEndDrag?: (event: ScrollEvent) => void;

    scrollEventThrottle?: number;

    scrollIndicatorInsets?: {
      top: number;
      left: number;
      bottom: number;
      right: number;
    };

    pagingEnabled?: boolean;

    scrollEnabled?: boolean;

    horizontal?: boolean;

    showsHorizontalScrollIndicator?: boolean;

    showsVerticalScrollIndicator?: boolean;

    bounces?: boolean;

    sendMomentumEvents?: boolean;

    contentInset?: number[];
  }

  declare class ScrollViewComponent extends React.Component<ScrollViewProps> { }
  export class ScrollView extends ScrollViewComponent {
    public scrollTo: (option: { x?: number; y?: number; animated: boolean }) => void;
  }

  // ListView
  export interface ListViewProps
    extends Touchable {
    style: StyleProp<ViewStyle>;

    dataSource: any;

    overflow?: 'scroll' | 'hidden';

    initialListSize?: number;

    onEndReachedThreshold?: number;

    numberOfRows: number;

    pageSize: number;

    // 此处rowData可能为数据也可能为序号，取决于是否传入dataSource属性
    renderRow: (
      rowData: any,
      unknown: null,
      index: number,
    ) => React.ReactElement;

    onEndReached?: () => void;

    getRowType?: (index: number) => number;

    getRowKey?: (index: number) => string | number;

    onMomentumScrollBegin?: () => void;

    onMomentumScrollEnd?: () => void;

    onScroll?: (event: ScrollEvent) => void;

    onScrollBeginDrag?: (event: ScrollEvent) => void;

    onScrollEndDrag?: (event: ScrollEvent) => void;

    scrollEventThrottle?: number;

    rowShouldSticky?: (index: number) => boolean;

    showScrollIndicator?: boolean;
  }

  declare class ListViewComponent extends React.Component<ListViewProps> { }
  export class ListView extends ListViewComponent {
    public scrollToIndex: (xIndex: number, yIndex: number, animated: boolean) => void;

    public scrollToContentOffset: (
      xOffset: number,
      yOffset: number,
      animated: boolean
    ) => void;
  }

  // TouchableOpacity
  export interface TouchableOpacityProps
    extends ViewProps {
    onPress?: (event: React.MouseEvent) => void;
  }

  declare class TouchableOpacityComponent extends React.Component<
  TouchableOpacityProps
  > { }
  export class TouchableOpacity extends TouchableOpacityComponent { }

  export interface AnimationOption {
    mode?: 'timing';
    delay?: number;
    startValue: number | Animation;
    toValue: number;
    valueType?: '' | 'rad' | 'deg';
    duration?: number;
    timingFunction?:
    | 'linear'
    | 'ease-in'
    | 'ease-out'
    | 'ease-in-out'
    | 'ease_bezier';
    repeatCount?: number | 'loop';
  }

  declare namespace AsyncStorage {
    const getItem: (key: string, callback?: (error: Error, result: string) => void) => Promise<any>;

    const setItem: (key: string, value: string, callback?: (error: Error) => void) => Promise<void>;

    const removeItem: (key: string, callback?: (error: Error) => void) => Promise<null>;

    const getAllKeys: (callback?: (error: Error, keys: string[]) => void) => Promise<string[]>;

    const multiGet: (keys: string[], callback?: (errors: Array<Error>, result: string[][]) => void) => Promise<any>;

    const multiSet: (keyValuePairs: string[][], callback?: (errors: Array<Error>) => void) => Promise<any>;

    const multiRemove: (keys: string[], callback?: (errors: Array<Error>) => void) => Promise<any>;
  }

  declare class Animation {
    public setRef: (containerRef: any) => void;

    public start: () => void;

    public destroy: () => void;

    public resume: () => void;

    public pause: () => void;

    public updateAnimation: (option: Partial<AnimationOption>) => void;

    public onHippyAnimationStart: (callback: () => void) => void;

    public onHippyAnimationEnd: (callback: () => void) => void;

    public onHippyAnimationCancel: (callback: () => void) => void;

    public onHippyAnimationRepeat: (callback: () => void) => void;

    public constructor(option: AnimationOption);
  }

  export interface AnimationSetChildren {
    animation: Animation;
    follow?: boolean;
  }

  export interface AnimationSetOption {
    children: AnimationSetChildren[];
    repeatCount?: number;
  }

  declare class AnimationSet extends Animation {
    public constructor(option: AnimationSetOption);
  }

  type AnimationType = Animation | AnimationSet;

  // ViewPager
  export interface ViewPagerProps extends Touchable, Layout {
    style?: StyleProp<ViewStyle>;

    initialPage?: number;

    scrollEnabled?: boolean;

    keyboardDismissMode?: string;

    onPageSelected?: (event: { position: number }) => void;

    onPageScroll?: (event: { position: number, offset: number }) => void;

    onPageScrollStateChanged?: (event: { pageScrollState: string }) => void;
  }

  declare class ViewPagerComponent extends React.Component<ViewPagerProps> { }
  export class ViewPager extends ViewPagerComponent {
    public setPage: (index: number) => void;

    public setPageWithoutAnimation: (index: number) => void;
  }

  // Navigator
  export interface Route {
    routeName: string;
    component: any;
    initProps: any;
  }

  export type NavigatorDireaction = 'left' | 'right' | 'top' | 'bottom';

  export interface NavigatorProps extends Touchable, Layout {
    style?: StyleProp<ViewStyle>;

    initialRoute: Partial<Route & { animated?: boolean }>;
  }

  declare class NavigatorComponent extends React.Component<NavigatorProps> { }
  export class Navigator extends NavigatorComponent {
    public clear: () => void;

    public getCurrentPage: () => Route;

    public pop: (option?: { toDirection?: NavigatorDireaction }) => void;

    public push: (route: Route & { fromDirection?: NavigatorDireaction, animated?: boolean }) => void;
  }

  // RefreshWrapper
  export interface RefreshWrapperProps extends Touchable, Layout {
    style?: StyleProp<ViewStyle>;

    onRefresh?: () => void;

    getRefresh?: () => any;

    bounceTime?: number;
  }

  declare class RefreshWrapperComponent extends React.Component<RefreshWrapperProps> { }
  export class RefreshWrapper extends RefreshWrapperComponent {
    public refreshComplected: () => void;

    public startRefresh: () => void;
  }

  // Modal
  export interface ModalPropsIOS {
    primaryKey?: string;

    onDismiss?: () => void;
  }

  export interface ModalProps extends ModalPropsIOS, Touchable, Layout {
    style?: StyleProp<ViewStyle>;

    animated?: boolean;

    animationType?: 'none' | 'slide' | 'fade' | 'slide_fade';

    supportedOrientations?: ('portrait' | 'portrait-upside-down' | 'landscape' | 'landscape-left' | 'landscape-right')[];

    immersionStatusBar?: boolean;

    darkStatusBarText?: boolean;

    onShow?: () => void;

    onOrientationChange?: () => void;

    onRequestClose?: () => void;

    transparent?: boolean;

    visible?: boolean;

    specialHost?: boolean;
  }

  declare class ModalComponent extends React.Component<ModalProps> { }
  export class Modal extends ModalComponent { }

  // BackAndroid
  declare namespace BackAndroid {
    const addListener: (callback: () => boolean) => { remove: () => void };

    const exitApp: () => void;

    const removeListener: (callback: () => boolean) => void;
  }

  // Clipboard
  declare namespace Clipboard {
    const getString: () => Promise<string>;

    const setString: (text: string) => void;
  }

  // NetworkModule
  declare namespace NetworkModule {
    const getCookies: (url: string) => Promise<string>;

    const setCookie: (url: string, keyValue: string, expires?: string) => Promise<void>;
  }

  // NetInfo
  declare namespace NetInfo {
    const addEventListener: (eventName: 'change', callback: (reachObj: any) => void | Promise<void>) => void;

    const fetch: () => any;   // TODO

    const removeEventListener: (eventName: 'change', callback: () => void) => void;
  }

  // PixelRatio
  declare namespace PixelRatio {
    const get: () => number;

    const set: (dims: number) => void;
  }
}
