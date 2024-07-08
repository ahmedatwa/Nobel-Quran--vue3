export const scrollToElement = async (
  elID: string,
  timeout: number = 100,
  options: ScrollIntoViewOptions = SMOOTH_SCROLL_TO_CENTER,
  overLayHeight?: number
) => {
  const el = document.querySelector(elID);
  if (el) {
    await delay(timeout);
    if (overLayHeight) {
      el.setAttribute("style", `scroll-margin-height:${overLayHeight}px`);
    } else {
      el.scrollIntoView(options);
    }
  }
};

export const SMOOTH_SCROLL_TO_CENTER = {
  block: "center", // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
  behavior:"smooth"
} as ScrollIntoViewOptions;

export const SMOOTH_SCROLL_TO_TOP = {
  block: "start",
  behavior: "smooth",
} as ScrollIntoViewOptions;

export const SCROLL_TO_NEAREST_ELEMENT = {
  block: "nearest",
} as ScrollIntoViewOptions;

export const isElementVisibleInViewport = (
  el: HTMLElement,
  partiallyVisible = false
) => {
  const { top, left, bottom, right } = el.getBoundingClientRect();
  const { innerHeight, innerWidth } = window;
  return partiallyVisible
    ? ((top > 0 && top < innerHeight) ||
        (bottom > 0 && bottom < innerHeight)) &&
        ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
};

export const isInViewport = (element: HTMLElement) => {
  var rect = element.getBoundingClientRect();
  var html = document.documentElement;
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || html.clientHeight) &&
    rect.right <= (window.innerWidth || html.clientWidth)
  );
};

const delay = (length: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (length) {
        resolve();
      } else {
        reject();
      }
    }, length);
  });
};
