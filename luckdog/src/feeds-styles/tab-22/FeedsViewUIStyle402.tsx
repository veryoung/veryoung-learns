// 继续阅读
import React from 'react';
import { View } from '@tencent/hippy-react-qb';
import FeedsViewItem from '../FeedsViewItem';
import FeedsProtect from '../../mixins/FeedsProtect';
import FeedsViewContainer from '../common/FeedsViewContainer';
import { shouldComponentUpdate, countReRender } from '@tencent/luckbox-react-optimize';
import { PicTextBtn } from './components/PicTextBtn';
import { reportUDS, strictExposeReporter, BusiKey, logError } from '@/luckdog';
import FeedsAbilities from '../../framework/FeedsAbilities';
import { FeedsIcon } from './components/utils';
import { colorDict } from '../../framework/FeedsConst';
import { TabId, CommonProps } from '../../entity';

interface Props extends CommonProps {
  index: number;
}

@FeedsProtect.protect
export default class FeedsViewUIStyle402 extends FeedsViewItem<Props> {
  public static getRowType() {
    return 402;
  }
  public state = {
    book: {} as any,
  };
  public constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate(this, 'FeedsViewUIStyle402');

    this.loadLocalBook(props);
  }

  public doBeaconByClick = (data: Record<string, any>) => {
    reportUDS(BusiKey.CLICK__CARD_BOOK, this.props, {
      ...data,
      book_id: this.state?.book?.sResourceId || '',
    });
  };

  public UNSAFE_componentWillReceiveProps(nextProps) {
    this.loadLocalBook(nextProps);
  }

  public componentDidMount() {
    const { itemBean = {}, globalConf: { curTabId = TabId.BOTTOM_RECOMM2 }, index: cardIndex } = this.props;
    reportUDS(BusiKey.EXPOSE__CARD, { itemBean, tabId: curTabId }, { ext_data1: cardIndex + 1 });
  }
  public loadLocalBook = (props) => {
    const { itemBean = {} } = props;
    const { parsedObject = {} } = itemBean;
    const book = parsedObject;
    FeedsAbilities.loadNovelLocalBooks().then((res: any) => {
      const { bookInfos } = res;
      const normalInfos = (bookInfos || []).map(book => ({
        sPicUrl: book.epubcover || FeedsIcon.novel_default_cover, // 本地书的封面（epub的本地书会有封面）
        sResourceName: book.bookName,
        sResourceId: book.bookId,
        stTag: {
          iColor: 5,
          sText: (book.bookType || 'TXT').toUpperCase(),
          usIconId: 0,
        },
        sReadUrl: '',
        ...book,
      }));

      const list = (normalInfos || []).sort((a, b) => b.timeStamp - a.timeStamp);

      const bookTime = (list[0] || {}).timeStamp || 0;

      if (bookTime - book.iLastOpTime > 0) {
        this.setState({
          book: list[0],
        });
      } else {
        this.setState({
          book,
        });
      }
    })
      .catch((e) => {
        logError(e, 'FeedsViewUIStyle402.loadLocalBook');
      });
  };

  public onLayout = (event, bookId) => {
    strictExposeReporter.addExpoItem({
      cardIndex: this.props.index,
      bookId,
      rect: event.layout,
      forceCheckExpo: true,
    });
  };

  public render() {
    countReRender(this, 'FeedsViewUIStyle402');
    const { itemBean = {}, globalConf = {} } = this.props;
    if (!itemBean) return null;
    const { parsedObject } = itemBean;
    if (!parsedObject) return null;
    const { book } = this.state;
    if (!book || Object.keys(book).length === 0) return null;

    const { sResourceName = '', iReadSerialid = 0, sPicUrl = '', sReadUrl = '', sResourceId = '', stTag = {}, iLastSerialid = 0 } = book;
    let subTitle = '';
    let subReadTitle = '';

    if (iReadSerialid === 0) {
      subReadTitle = '未读';
    } else if (!iReadSerialid) {
      subReadTitle = '';
    } else {
      subReadTitle = `读至第${iReadSerialid}章`;
    }
    if (stTag && (stTag.sText === '网页' || stTag.sText === 'TXT')) {
      subReadTitle = '';
    }


    if (!subReadTitle || !iLastSerialid) {
      subTitle = subReadTitle;
    } else {
      subTitle = `${subReadTitle} / ${iLastSerialid}章`;
    }

    if (!sResourceId || !sResourceName) {
      return (<View style={{ marginTop: 16 }}></View>);
    }

    let tagText = '';
    if (stTag && stTag.sText === '独家免费') {
      tagText = '独家';
    } else if (stTag?.sText) {
      tagText = stTag.sText;
    }

    return (
      <FeedsViewContainer
        onLayout={event => this.onLayout(event, sResourceId)}
        parentProps={this.props}
        noPadding
      >
        <View style={{ marginBottom: 0 }}>
          <PicTextBtn
            picUrl={sPicUrl}
            picTag={tagText}
            tagColors={colorDict[stTag.iColor] || colorDict[4]}
            btnUrl={sReadUrl}
            text={sResourceName}
            subText={subTitle}
            btnText={'继续阅读'}
            showNewTag={stTag?.bIsNew}
            bookID={sResourceId}
            item_id={itemBean.item_id}
            hasSplit
            parents={this}
            globalConf={globalConf}
            doBeaconByClick={this.doBeaconByClick}
            sResourceId={sResourceId}
          />
        </View>
      </FeedsViewContainer>
    );
  }
}
