export const scrollToElement = async (
  elID: string,
  root?: HTMLElement,
  timeout?: number,
  overLayHeight?: number,
  options: ScrollIntoViewOptions = SMOOTH_SCROLL_TO_CENTER
) => {
  const el = document.querySelector(elID) as HTMLDivElement;
  const parent = root ? root : undefined;
  if (el && !isInViewport(el, parent)) {
    await delay(timeout || 100);
    if (overLayHeight) {
      if (!el.classList.contains(`scroll-margin-top:${overLayHeight || 300}px`)) {
      }
    }
    el.scrollIntoView(options);
  } else {
    return;
  }
};

export const SMOOTH_SCROLL_TO_CENTER = {
  block: "center", // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
  behavior: "smooth",
} as ScrollIntoViewOptions;

export const SMOOTH_SCROLL_TO_TOP = {
  block: "start",
  behavior: "smooth",
} as ScrollIntoViewOptions;

export const SCROLL_TO_NEAREST_ELEMENT = {
  block: "nearest",
} as ScrollIntoViewOptions;

const isInViewport = (element: HTMLElement, root?: HTMLElement) => {
  let rect = element.getBoundingClientRect();
  let html = root ? root : document.documentElement;
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
