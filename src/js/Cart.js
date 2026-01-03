import { StorageService } from './StorageService.js';

const rootSelector = '[data-js-cart]'

class Cart {
  selectors = {
    root: rootSelector,
    icon: '[data-js-cart-icon]',
    spanTag: '[data-js-cart-span-tag]',
    cartBody: '[data-js-cart-body]',
    list: '[data-js-cart-list]',
    delete: '[data-js-cart-button-delete]'
  }

  stateClasses = {
    tagCount: 'tag',
    isVisible: 'is-visible'
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.iconElement = this.rootElement.querySelector(this.selectors.icon);
    this.listElement = this.rootElement.querySelector(this.selectors.list);
    this.cartBodyElement = this.rootElement.querySelector(this.selectors.cartBody);
    this.items = StorageService.get('cartItem', []);
    this.renderCounter();
    this.renderList();
    this.autoCloseTimeout = null;
    this.bindEvents();
  }

  #normalizeId(id) {
    return String(id);
  }

  onProductAdd = (e) => {
    const { getProduct } = e.detail;
    if (!getProduct) return;

    const productId = this.#normalizeId(getProduct.id);
    const existingItem = this.items.find(item =>
      this.#normalizeId(item.id) === productId
    );

    if (existingItem) {
      existingItem.count++;
    } else {
      this.items.push({ ...getProduct, count: 1});
    }

    this.renderCounter();
    this.renderList();
    this.toggleAutoOpen();

    StorageService.set('cartItem', this.items);
  }

  onIconClick = (e) => {
    e.preventDefault();
    this.cartBodyElement.classList.toggle(this.stateClasses.isVisible);
  }

  onDocumentClick = (e) => {
    const isAddButtonClick = e.target.closest('[data-js-add-to-cart]');

    if (this.cartBodyElement.classList.contains(this.stateClasses.isVisible) &&
        !this.rootElement.contains(e.target) &&
        !isAddButtonClick
    ) {
      this.cartBodyElement.classList.remove(this.stateClasses.isVisible);
      clearTimeout(this.autoCloseTimeout);
    }
  }

  onRemoveClick = (e) => {
    const removeButton = e.target.closest(this.selectors.delete);
    if (!removeButton) return;

    const productItem = removeButton.closest('[data-product-id]');
    if (!productItem) return;
    const productId = productItem.dataset.productId;

    this.items = this.items.filter(item => this.#normalizeId(item.id) !== productId);

    this.renderCounter();
    this.renderList();

    StorageService.set('cartItem', this.items);
  }

  renderCounter() {
    const count = this.items.reduce((total, item) => {
     return total + item.count
    }, 0);

    let spanElement = this.iconElement.querySelector(`.${this.stateClasses.tagCount}`);

    if (count === 0) {
      if (spanElement) {
        spanElement.remove();
      }
      return;
    }

    if (!spanElement) {
      spanElement = document.createElement('span');
      spanElement.classList.add(this.stateClasses.tagCount);
      this.iconElement.appendChild(spanElement);
    }

    spanElement.textContent = count;
  }

  makeItemHtml({id, images, title, alt, count}) {
    return `
      <li class="cart-list__item" data-product-id="${this.#normalizeId(id)}">
               <a
                 class="cart-list__img"
                 href="/"
                     >
                      <img
                        src="img/products/${images}"
                        alt="${alt}"
                        width=""
                        height=""
                        loading="lazy"
                      />
                 </a>
              <div class="cart-list__body">
                  <a class="cart-list__title h4" href="#">${title}</a>
                  <span class="cart-list__quantity">Quantity: ${count}</span>
                  <button class="cart-list__delete" data-js-cart-button-delete>Delete</button>
             </div>
        </li>
    `
  }

  renderList() {
    this.listElement.innerHTML = '';

    if (this.items.length === 0) {
      this.listElement.innerHTML = 'Your cart is empty';
    } else {
      const html = this.items.map(item => {
        return this.makeItemHtml(item);
      }).join('');

      this.listElement.innerHTML = html;
    }
  }

  clearCart() {
    this.items = [];
    this.renderList();
    this.renderCounter();
    StorageService.remove('cartItem');
  }

  toggleAutoOpen() {
    this.cartBodyElement.classList.add(this.stateClasses.isVisible);

    clearTimeout(this.autoCloseTimeout);

    this.autoCloseTimeout = setTimeout(() => {
      this.cartBodyElement.classList.remove(this.stateClasses.isVisible);
    }, 1000);
  }

  bindEvents() {
    document.addEventListener('product:add', this.onProductAdd);
    document.addEventListener('click', this.onDocumentClick);
    this.iconElement.addEventListener('click', this.onIconClick);
    this.listElement.addEventListener('click', this.onRemoveClick);
  }
}

export class CartCollection  {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll(rootSelector);
    this.instances = [...elements].map(element => new Cart(element));
    }

    destroy() {
      this.instances.forEach(instance => instance.destroy());
      this.instances = [];
    }
}