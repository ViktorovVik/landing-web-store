const rootSelector = '[data-js-gallery]';

class Gallery {
  selectors = {
    root: rootSelector,
    item: '[data-js-gallery-item]',
    overlay: '[data-js-gallery-overlay]',
    image: '[data-js-gallery-image]',
    close: '[data-js-gallery-close]',
    prev: '[data-js-gallery-prev]',
    next: '[data-js-gallery-next]',
    counter: '[data-js-gallery-counter]'
  }

  stateClasses = {
    isOpen: 'is-open',
    isLoading: 'is-loading'
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.modal = null;
    this.ui = null;
    this.activeIndex = 0;
    this.items = this.collectItems();

    if (this.items.length > 0) {
      this.init();
    }
  }

  collectItems() {
    return Array.from(this.rootElement.querySelectorAll(this.selectors.item)).map(link => ({
      src: link.getAttribute('href'),
      alt: link.querySelector('img')?.getAttribute('alt') || ''
    }));
  }

  init() {
    this.createModal();
    this.bindEvents();
  }

  createModal() {
    const attr = (selector) => selector.replace(/[\[\]]/g, '');

    this.modal = document.createElement('div');
    this.modal.className = 'gallery-modal';
    this.modal.setAttribute(attr(this.selectors.overlay), '');

    this.modal.innerHTML = `
      <div class="gallery-modal__overlay"></div>
      <div class="gallery-modal__content">
        <button type="button" class="gallery-modal__close" ${attr(this.selectors.close)} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        
        <button type="button" class="gallery-modal__nav gallery-modal__nav--prev" ${attr(this.selectors.prev)} aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        <div class="gallery-modal__image-wrapper">
          <img class="gallery-modal__image" ${attr(this.selectors.image)} src="" alt="" />
        </div>
        
        <button type="button" class="gallery-modal__nav gallery-modal__nav--next" ${attr(this.selectors.next)} aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        
        <div class="gallery-modal__counter" ${attr(this.selectors.counter)}></div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.ui = {
      overlay: this.modal.querySelector('.gallery-modal__overlay'),
      image: this.modal.querySelector(this.selectors.image),
      counter: this.modal.querySelector(this.selectors.counter),
      close: this.modal.querySelector(this.selectors.close),
      prev: this.modal.querySelector(this.selectors.prev),
      next: this.modal.querySelector(this.selectors.next)
    };
  }

  bindEvents() {

    this.onItemClick = (e) => {
      const link = e.target.closest(this.selectors.item);
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        const index = this.items.findIndex(item => item.src === href);
        this.open(index);
      }
    };
    this.rootElement.addEventListener('click', this.onItemClick);


    this.ui.close.addEventListener('click', () => this.close());
    this.ui.prev.addEventListener('click', () => this.changeSlide(-1));
    this.ui.next.addEventListener('click', () => this.changeSlide(1));


    this.onOverlayClick = (e) => {
      if (e.target === this.ui.overlay) {
        this.close();
      }
    };
    this.modal.addEventListener('click', this.onOverlayClick);

    // Keyboard navigation
    this.onKeyDown = (e) => {
      if (!this.modal.classList.contains(this.stateClasses.isOpen)) return;

      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          this.changeSlide(-1);
          break;
        case 'ArrowRight':
          this.changeSlide(1);
          break;
      }
    };
    document.addEventListener('keydown', this.onKeyDown);
  }

  open(index) {
    if (index === -1) return;

    this.activeIndex = index;
    this.updateContent();
    this.modal.classList.add(this.stateClasses.isOpen);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.remove(this.stateClasses.isOpen);
    document.body.style.overflow = '';
  }

  changeSlide(direction) {
    this.activeIndex = (this.activeIndex + direction + this.items.length) % this.items.length;
    this.updateContent();
  }

  updateContent() {
    const { src, alt } = this.items[this.activeIndex];

    this.modal.classList.add(this.stateClasses.isLoading);

    const imgLoader = new Image();
    imgLoader.src = src;
    imgLoader.onload = () => {
      this.ui.image.src = src;
      this.ui.image.alt = alt;
      this.modal.classList.remove(this.stateClasses.isLoading);
    };

    this.ui.counter.textContent = `${this.activeIndex + 1} / ${this.items.length}`;
  }

  destroy() {

    if (this.onItemClick) {
      this.rootElement.removeEventListener('click', this.onItemClick);
    }
    if (this.onOverlayClick) {
      this.modal?.removeEventListener('click', this.onOverlayClick);
    }
    if (this.onKeyDown) {
      document.removeEventListener('keydown', this.onKeyDown);
    }

    // Remove modal from DOM
    if (this.modal?.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }

    // Clear references
    this.rootElement = null;
    this.modal = null;
    this.ui = null;
    this.items = [];
    this.onItemClick = null;
    this.onOverlayClick = null;
    this.onKeyDown = null;
  }
}

export class GalleryCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll(rootSelector);
    this.instances = [...elements].map(element => new Gallery(element));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}