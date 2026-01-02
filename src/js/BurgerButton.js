export class BurgerButton {
  selectors = {
    root: '[data-js-header]',
    menu: '[data-js-header-menu]',
    burgerButton: '[data-js-header-burger-button]'
  }

  stateClasses = {
    isActive: 'is-active',
    isLock: 'is-lock'
  }

  constructor() {
    this.rootElement = document.querySelector(this.selectors.root);
    this.burgerButtonElement = this.rootElement.querySelector(this.selectors.burgerButton);
    this.menuElement = this.rootElement.querySelector(this.selectors.menu);
    this.bindEvents();
  }

  onBurgerButtonClick = () => {
    this.burgerButtonElement.classList.toggle(this.stateClasses.isActive);
    this.menuElement.classList.toggle(this.stateClasses.isActive);
    document.documentElement.classList.toggle(this.stateClasses.isLock);
  }

  bindEvents() {
    this.burgerButtonElement.addEventListener('click', this.onBurgerButtonClick);
  }
}

