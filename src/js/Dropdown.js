const rootSelector = '[data-js-dropdown-item]'

class Dropdown {
  selectors = {
    root: rootSelector,
    dropdown: '[data-js-dropdown-list]',
    button: '[data-js-dropdown-button]',
    header: '[data-js-header]',
  }

  stateClasses = {
    isOpen: 'is-open',
  }

  ariaAttributes = {
    ariaExpanded: 'aria-expanded',
  }


  constructor(rootElement) {
    this.rootElement = rootElement;
    this.dropdownElement = this.rootElement.querySelector(this.selectors.dropdown);
    this.buttonElement = this.rootElement.querySelector(this.selectors.button);
    this.headerElement = this.rootElement.closest(this.selectors.header) || document;
    this.bindEvent();
  }


  get isOpen() {
    return this.dropdownElement.classList.contains(this.stateClasses.isOpen);
  }

  onKeyDown = (e) => {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  onDocumentClick = (e) => {
    const isClickInside = this.rootElement.contains(e.target);

    if (!isClickInside) {
      this.close();
    }
  }

  onOtherDropdownOpen = (e) => {
    if (e.detail.rootElement !== this.rootElement) {
      this.close();
    }
  }

  toggleExternalListeners(shouldAdd) {
    const method = shouldAdd ? 'addEventListener' : 'removeEventListener';

    document[method]('keydown', this.onKeyDown);
    document[method]('click', this.onDocumentClick);
  }

  onButtonClick = (e) => {
    e.preventDefault();
    this.toggle();
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    if (this.isOpen) return;

    this.dropdownElement.classList.add(this.stateClasses.isOpen);
    this.buttonElement.setAttribute(this.ariaAttributes.ariaExpanded, 'true');
    this.toggleExternalListeners(true);

    const event = new CustomEvent('dropdown:open', {
      detail: { rootElement: this.rootElement }
    });
    this.headerElement.dispatchEvent(event);
  }

  close() {
    if (!this.isOpen) return;

    this.dropdownElement.classList.remove(this.stateClasses.isOpen);
    this.buttonElement.setAttribute(this.ariaAttributes.ariaExpanded, 'false');
    this.toggleExternalListeners(false);
  }

  destroy() {
    this.toggleExternalListeners(false);
    this.buttonElement.removeEventListener('click', this.onButtonClick);
    this.headerElement.removeEventListener('dropdown:open', this.onOtherDropdownOpen);

    this.rootElement = null;
    this.buttonElement = null;
    this.dropdownElement = null;
    this.headerElement = null;
  }

  bindEvent() {
    this.buttonElement.addEventListener('click', this.onButtonClick);
    this.headerElement.addEventListener('dropdown:open', this.onOtherDropdownOpen);
  }
}

export class DropdownCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll(rootSelector);
    this.instances = Array.from(elements).map(el => new Dropdown(el));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}




