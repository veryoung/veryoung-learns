import { getTitleRight, vectorToArray } from '../utils';
import { LinkTypeMoreProps, LinkTypeChangeProps, LinkTypeNoneProps, LinkTypeNullProps } from './mocks/utils';

describe('utils', () => {
  describe('getTitleRight', () => {
    it('getTitleRight NoneProp', () => {
      const title = getTitleRight(LinkTypeNoneProps);
      expect(title).toStrictEqual({});
    });
    it('getTitleRight MoreProp', () => {
      const title = getTitleRight(LinkTypeMoreProps);
      expect(title).toStrictEqual({
        sText: '查看更多',
        sUrl: '',
      });
    });
    it('getTitleRight NullProp', () => {
      const title = getTitleRight(LinkTypeNullProps);
      expect(title).toStrictEqual({
        sText: '设置阅读喜好',
        sUrl: '',
      });
    });
    it('getTitleRight ChangeProp', () => {
      const title = getTitleRight(LinkTypeChangeProps);
      expect(title).toStrictEqual({});
    });
    it('getTitleRight params is {}', () => {
      const title = getTitleRight({});
      expect(title).toStrictEqual({});
    });
  });

  describe('vectorToArray', () => {
    it('null should to be []', () => {
      expect(vectorToArray(null)).toStrictEqual([]);
    });

    it('have value should to be [value]', () => {
      expect(vectorToArray({
        value: {},
      })).toStrictEqual({});
    });

    it('value is [] should to be []', () => {
      expect(vectorToArray([])).toStrictEqual([]);
    });
  });
});
