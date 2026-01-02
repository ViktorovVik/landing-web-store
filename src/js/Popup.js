const rootSelector = '[data-js-popup]';

class Popup {
  selectors = {
    root: rootSelector,
    overlay: '[data-js-popup-overlay]',
    close: '[data-js-popup-close]',
    title: '[data-js-popup-title]',
    message: '[data-js-popup-message]'
  }

  stateClasses = {
    isOpen: 'is-open',
    isSuccess: 'is-success',
    isError: 'is-error'
  }

  stateAttributes = {
    hidden: 'hidden'
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.overlayElement = this.rootElement.querySelector(this.selectors.overlay);
    this.closeElement = this.rootElement.querySelector(this.selectors.close);
    this.titleElement = this.rootElement.querySelector(this.selectors.title);
    this.messageElement = this.rootElement.querySelector(this.selectors.message);
    this.bindEvents();
  }

  show(data) {
    const { type = 'success', title = '', message = '' } = data;

    if (this.titleElement) this.titleElement.textContent = title;
    if (this.messageElement) this.messageElement.textContent = message;

    this.rootElement.classList.remove(this.stateClasses.isSuccess, this.stateClasses.isError);
    if (type === 'success') {
      this.rootElement.classList.add(this.stateClasses.isSuccess);
    } else if (type === 'error') {
      this.rootElement.classList.add(this.stateClasses.isError);
    }

    this.rootElement.removeAttribute(this.stateAttributes.hidden);
    this.closeElement.focus();

    this.rootElement.classList.add(this.stateClasses.isOpen);
    document.body.style.overflow = 'hidden';

    this.autoCloseTimeout = setTimeout(() => {
      this.close();
    }, 5000);
  }

  close = () => {
    this.rootElement.classList.remove(this.stateClasses.isOpen);
    document.body.style.overflow = '';

    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    this.rootElement.setAttribute(this.stateAttributes.hidden, '');
  }

  onKeyDown = (e) => {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  onOverlayClick = (e) => {
    if (e.target === this.overlayElement) {
      this.close();
    }
  }

  onPopupShow = (e) => {
    if (e.detail.id === this.rootElement.id) {
      this.show(e.detail);
    }
  }


  bindEvents() {
    this.closeElement.addEventListener('click', this.close);
    this.overlayElement.addEventListener('click', this.onOverlayClick);

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('popup:show', this.onPopupShow);
  }

  destroy() {
    if (this.closeElement) {
      this.closeElement.removeEventListener('click', this.close);
    }

    if (this.overlayElement) {
      this.overlayElement.removeEventListener('click', this.onOverlayClick);
    }

    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('popup:show', this.onPopupShow);

    if (this.autoCloseTimeout) {
      clearTimeout(this.autoCloseTimeout);
    }

    this.rootElement = null;
    this.overlayElement = null;
    this.closeElement = null;
    this.titleElement = null;
    this.messageElement = null;
  }
}


export class PopupCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll(rootSelector);
    this.instances = Array.from(elements).map(el => new Popup(el));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}