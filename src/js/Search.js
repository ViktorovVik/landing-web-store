const rootSelector = '[data-js-search]'

class Search {

  selectors = {
    root: rootSelector,
    button: '[data-js-search-toggle]',
    form: '[data-js-search-form]'
  }

  stateClasses = {
    isActive: 'is-active'
  }

  ariaAttributes = {
    ariaExpanded: 'aria-expanded'
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.buttonElement = this.rootElement.querySelector(this.selectors.button);
    this.formElement = this.rootElement.querySelector(this.selectors.form);
    this.bindEvents();
  }

  get isActive() {
    return this.formElement.classList.contains(this.stateClasses.isActive);
  }

  toggleClickButton = (e) => {
    e.preventDefault();

    this.isActive ? this.close() : this.open();
  }

  onDocumentClick = (e) => {
    const isClickInside = this.rootElement.contains(e.target);

    if (!isClickInside) {
      this.close()
    }
  }

  onKeyDown = (e) => {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  toggleExternalListeners(shouldAdd) {
    const method = shouldAdd ? 'addEventListener' : 'removeEventListener';
    document[method]('click', this.onDocumentClick);
    document[method]('keydown', this.onKeyDown);
  }

  open() {
    if (this.isActive) return;

    this.formElement.classList.add(this.stateClasses.isActive);
    this.buttonElement.setAttribute(this.ariaAttributes.ariaExpanded, 'true');
    this.toggleExternalListeners(true);
  }

  close() {
    if (!this.isActive) return;

    this.formElement.classList.remove(this.stateClasses.isActive);
    this.buttonElement.setAttribute(this.ariaAttributes.ariaExpanded, 'false');
    this.toggleExternalListeners(false);
  }

  destroy() {
    this.toggleExternalListeners(false);
    this.buttonElement?.removeEventListener('click', this.toggleClickButton);

    this.rootElement = null;
    this.buttonElement = null;
    this.formElement = null;
  }

  bindEvents() {
    this.buttonElement.addEventListener('click', this.toggleClickButton);
  }

}

export class SearchCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
   const elements = document.querySelectorAll(rootSelector);
    this.instances = [...elements].map(element => new Search(element));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}