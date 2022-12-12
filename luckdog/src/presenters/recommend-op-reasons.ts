/**
 * 每日推荐卡片运营语和推荐tag展示样式
 */
export enum StyleExperimentType {
  NULL = 0,
  /** 分类 + 书籍完结状态信息 + 1个推荐tag 展示在一行 */
  ONLY_ONE_LINE = 1,
  /** NLP推荐语 + 阅文NLP推荐语 展示在一行 */
  NLP_AND_YUEWEN_NLP = 2,
  /** 只展示阅文NLP推荐语 */
  ONLY_YUEWEN_NLP = 3,
  /** 只展示NLP推荐语 */
  ONLY_NLP = 4,
}

/**
 * 根据实验样式类型计算书籍简介下面展示的内容
 */
export const getOrderedReasons = ({
  styleExperimentType,
  recommendReasons,
  vOpReasons,
  type,
  status,
  defaultTags,
}: {
  styleExperimentType: StyleExperimentType | undefined;
  recommendReasons: string[];
  vOpReasons: string[];
  type: string;
  status: string;
  defaultTags: string[];
}): string[] => {
  // 未命中实验，返回原来的推荐tag
  // 如果没有推荐tag，则用作者、二级分类、热度替代
  if (!styleExperimentType) return checkReasonsAndTags(recommendReasons, defaultTags);

  // 运营语、推荐tag 内容都为空
  if (!vOpReasons?.length && !recommendReasons?.length) {
    return [];
  }

  switch (styleExperimentType) {
    case StyleExperimentType.ONLY_ONE_LINE:
      return [type, status, ...recommendReasons].filter((i) => !!i).slice(0, 3);

    case StyleExperimentType.NLP_AND_YUEWEN_NLP:
    case StyleExperimentType.ONLY_YUEWEN_NLP:
    case StyleExperimentType.ONLY_NLP:
      return [...vOpReasons, ...recommendReasons].slice(0, 3);

    default:
      return [];
  }
};

const checkReasonsAndTags = (reasons: string[], tags: string[]): string[] => {
  // 有推荐理由
  if (reasons?.length) return reasons;

  // 作者、二级分类、热度至少有一个不为空
  const isTagsValid = tags.some((tag) => !!tag);
  return isTagsValid ? tags : [];
};
