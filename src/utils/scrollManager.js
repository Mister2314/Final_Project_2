let scrollPositions = new Map();

export const scrollManager = {
  saveScrollPosition: (path) => {
    scrollPositions.set(path, window.scrollY);
  },

  getScrollPosition: (path) => {
    return scrollPositions.get(path) || 0;
  },

  clearScrollPosition: (path) => {
    scrollPositions.delete(path);
  },

  scrollToTop: () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },

  restoreScrollPosition: (path) => {
    const savedPosition = scrollPositions.get(path) || 0;
    window.scrollTo({
      top: savedPosition,
      behavior: 'instant'
    });
  },

  clearAllScrollPositions: () => {
    scrollPositions.clear();
  }
}; 