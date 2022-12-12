let isClicked = false;

/** 记录tab主动点击 */
export const recordTabClicked = (): void => {
  isClicked = true;
};

/** 是否发生过tab主动点击 */
export const isTabClicked = (): boolean => isClicked;
