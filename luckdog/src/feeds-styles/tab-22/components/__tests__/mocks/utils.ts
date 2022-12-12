import { CardLinkType } from '../../../../../entity/card';

export const LinkTypeNoneProps = {
  itemBean: {
    parsedObject: {
      linkType: CardLinkType.NONE,
    },
  },
};

export const LinkTypeMoreProps = {
  itemBean: {
    parsedObject: {
      linkType: CardLinkType.MORE,
      linkName: '查看更多',
      moreLink: '',
    },
  },
};

export const LinkTypeNullProps = {
  itemBean: {
    parsedObject: {
      linkType: null,
      vTextLink: {
        value: [{
          sText: '设置阅读喜好',
          sUrl: '',
        }],
      },
    },
  },
};

export const LinkTypeChangeProps = {
  itemBean: {
    parsedObject: {
      linkType: CardLinkType.CHANGE,
    },
  },
};
