import { bookListSort, localBooksMerge } from '../localBooksMerge';
import { bookList, localBooks, sortBooks, formatedLocalBooks } from './mock/localBooksMerge';

jest.mock('@/framework/FeedsAbilities', () => ({
  loadNovelLocalBooks: async () => localBooks,
  checkEnable: () => true,
}));

describe('func: localBooksMerge', () => {
  test('localBooksMerge must has return', async () => {
    try {
      const data = await localBooksMerge(bookList);
      expect(data).toEqual({
        booksList: bookList,
        localBookLength: 0,
      });
    } catch (e) {
      expect(e).toBe('do not support this ability, ability = loadNovelLocalBooks');
    }
  });

  test('bookListSort can sorted by local books and fetched books', () => {
    expect(bookListSort(bookList, formatedLocalBooks as any)).toEqual(sortBooks);
  });
});

