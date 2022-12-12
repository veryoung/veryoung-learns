import { AuthorListCard } from './author-list';
import { BookListCardPos1, BookListCardPos4 } from './book-list';
import { CategoryKnowledgeProps } from './category-knowledge';
import { GuessYouLikeCard } from './guess-you-like';

/** 见识tab一刷的数据 */
export const KnowledgeTabData = {
  tabID: '191',
  cards:
    [BookListCardPos1, CategoryKnowledgeProps, BookListCardPos4, AuthorListCard, GuessYouLikeCard],
  pageEnd: false,
  pageNum: 1,
  abInfo:
  {
    append_card_in_infinity: 0,
    baseinfo_multiversion: 4,
    book_show_score: 1,
    classify_uri: 1,
    exclusive_origin_label: 0,
    feed_daily_recom_first_screen_up: 0,
    feed_first_screen_up: 6,
    feed_group_change_after_refresh: 1,
    feed_rank_list_finish: 1,
    feed_rank_list_hot: 0,
    feed_rank_list_increase: 0,
    feed_recommend_group: 1,
    recom_new_arch: 1,
    recom_new_arch_gender: 1,
    recom_new_arch_top: 1,
    recomm_user_gender: 1,
    tab_control: 0,
    ug_shallow_user_group_top: 0,
    unified_reason_vs_free_length: 1,
    update_channel_id_with_real_ch: 1,
  },
  currentDayPageNum: 1,
};
