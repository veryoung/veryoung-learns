import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, Text } from '@tencent/hippy-react-qb';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { ConstantUtils, FeedsLineHeight, FeedsUIStyle, FeedsUtils } from '../../feeds-styles/tab-22/components/utils';
import FeedsProtect from '../../mixins/FeedsProtect';
import { reportUDS, BusiKey } from '@/luckdog';
import { fetchUrlList } from '../../framework/FeedsConst';
import { DEFAULT_FEEDS_STYLE } from '../../framework/FeedsDefaultStyle';

const SCREEN_WIDTH = ConstantUtils.getScreenWidth();
const styles = DEFAULT_FEEDS_STYLE.data.tabList;

interface Props {
  bubbleInfo: any;
  onClose: () => void;
  onClick: (jumpUrl: string, clickLink: string) => void;
}

interface State {
  data: any;
}

@FeedsProtect.protect
export default class WCBubble extends Component<Props, State> {
  /**
   * @static
   * @memberof WCBubble
   * @propTypes
   * onClose 关闭方法
   * redPackInfo 红包具体信息
   * globalConf 全局配置
   */
  public static propTypes = {
    bubbleInfo: PropTypes.object,
    onClose: PropTypes.func,
    onClick: PropTypes.func,
  };

  public closeBubbleTimer;
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'RedPack');
    this.state = {
      data: {},
    };
  }

  public componentDidMount() {
    reportUDS(BusiKey.EXPOSE__WELFARE_BUBBLE_ICON);
    const { bubbleInfo, onClose } = this.props;
    const data = bubbleInfo.opInfo;
    const { exposeUrl } = data;
    // 需要曝光一次
    if (exposeUrl) {
      const [exposeLink] = exposeUrl;
      fetch(exposeLink);
    }
    // 开启定时器,过期就关闭
    if (this.closeBubbleTimer) clearTimeout(this.closeBubbleTimer);
    this.closeBubbleTimer = setTimeout(() => {
      onClose?.();
    }, data.showTime * 1000 || 6000);
    this.setState({ data });
  }


  public goWelareCenter = () => {
    const { jumpUrl = '', clickUrl = '' } = this.state.data;
    const { onClick } = this.props;
    const [clickLink] = clickUrl;
    onClick?.(jumpUrl, clickLink);
  };

  public render() {
    const { data } = this.state;
    countReRender(this, 'WelfareTips');
    const icon = FeedsUtils.getSkinData([fetchUrlList.bg.light, fetchUrlList.bg.dark]);

    return <View
      style={[{
        position: 'absolute',
        width: SCREEN_WIDTH,
        height: 70,
        zIndex: 99,
        top: 40,
        left: 0,
      }]}
      onClick={this.goWelareCenter}
    >
      <View
        style={[{
          height: 48,
          width: 150,
          paddingHorizontal: 11,
          paddingVertical: 8,
          borderRadius: 24,
          position: 'relative',
          flexDirection: 'row',
          zIndex: 999,
          top: 6,
          left: SCREEN_WIDTH - 152,
        }]
        }
      >
        <Image
          style={{
            width: 30,
            height: 30,
            marginRight: 4,
          }}
          source={{ uri: data.picUrl }}
          noPicMode={{ enable: false }}
        />
        <Text
          style={{
            flex: 1,
            fontSize: FeedsUIStyle.T1,
            lineHeight: FeedsLineHeight.T2,
            colors: ['#242424', '#686d74', '#242424', 'white'],
          }}
        >
          {data.wording}
        </Text>
      </View>
      <Image
        style={{
          position: 'absolute',
          top: 0,
          left: SCREEN_WIDTH - 162,
          height: 68,
          width: 165,
          zIndex: 99,
        }}
        source={{ uri: icon }}
        noPicMode={{ enable: false }}
      />
      <View style={[styles.triangle, {
        position: 'absolute',
        borderBottomColors: ['white', '#33373A', 'white', '#33373A'],
        top: 0,
        zIndex: 98,
        left: SCREEN_WIDTH - 42,
      }]}></View>
    </View>;
  }
}
