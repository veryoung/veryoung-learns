import { logError } from '@/luckdog';
import { Category } from './category';
import { ChangeableComment } from './changeable-commend';
import { GuessYouLike } from './guess-you-like';
import { Rank } from './rank';
import { BookList } from './book-list';
import { AuthorList } from './author-list';
import { CategoryKnowledge } from './category-knowledge';
import { UIType } from '../../protocol';
import { FullWidthImage } from './full-width-image';

const MAP = {
  [UIType.CATEGORY]: Category,
  [UIType.CHANGEABLE_COMMEND]: ChangeableComment,
  [UIType.GUESS_YOU_LIKE]: GuessYouLike,
  [UIType.RANK]: Rank,
  [UIType.BOOK_LIST]: BookList,
  [UIType.AUTHOR_LIST]: AuthorList,
  [UIType.CATEGORY_KNOWLEDGE]: CategoryKnowledge,
  [UIType.FULL_WIDTH_IMAGE]: FullWidthImage,
};

export const getCardView = (uiType: string) => {
  try {
    if (MAP[uiType]) {
      return MAP[uiType];
    }
    return null;
  } catch (e) {
    logError(e, 'uiRouter.getFeedsView');
  }

  return undefined;
};

