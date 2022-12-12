import React from 'react';
import { StyleSheet, View, Text, Image } from '@tencent/hippy-react-qb';
import { FeedsUIStyle, FeedsLineHeight, FeedsTheme } from './utils';
import LinkView from './Link';
import FeedsProtect from '../../../mixins/FeedsProtect';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import FeedsIcon from '../../../framework/FeedsIcon';


const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
    marginTop: 40,
  },
  emptyIcon: {
    height: 69,
    width: 55,
  },
  emptyMsgColor: {
    colors: FeedsTheme.SkinColor.A4,
  },
  emptyMsgView: {
    marginLeft: 12,
  },
  normalText: {
    fontSize: FeedsUIStyle.T1,
    lineHeight: FeedsLineHeight.T1,
  },
});

interface Props {
  parsedObject: any;
  parent: any;
}

@FeedsProtect.protect
export class BookShelfEmpty extends React.Component<Props> {
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'BookShelfEmpty');
  }

  public render() {
    countReRender(this, 'BookShelfEmpty');
    const { stMoreUrl } = this.props.parsedObject || {};
    return (
      <View style={styles.emptyContainer}>
        <Image source={{ uri: FeedsIcon.emptyIcon }} style={styles.emptyIcon} />
        <View style={styles.emptyMsgView}>
          <Text style={[styles.normalText, styles.emptyMsgColor]}>书架是空的噢</Text>
          <LinkView
            stMoreUrl={stMoreUrl}
            styleNormal={styles.emptyMsgColor}
            parent={this.props.parent}
          />
        </View>
      </View>
    );
  }
}
