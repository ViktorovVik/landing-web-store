const rootSelector = '[data-js-products]';

class Products {
  #endpoint = 'https://6954e85b1cd5294d2c7dd661.mockapi.io/products';

  selectors = {
    root: rootSelector,
    list: '[data-js-products-list]',
    addToCart: '[data-js-add-to-cart]',
    showMore: "[data-js-products-button-show-more]"
  }

  stateClasses = {
    isLoading: 'is-loading'
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.listElement = this.rootElement.querySelector(this.selectors.list);
    this.showMoreElement = this.rootElement.querySelector(this.selectors.showMore);
    this.page = 1;
    this.limit = 4;
    this.isLoading = false;
    this.products = [];
    this.bindEvents();
    this.init();
  }

  async fetchProducts(url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async init() {
    this.showLoadingState();
    await this.fetchAndRender();
    this.hideLoadingState();
  }

  async fetchAndRender() {

    if (this.showMoreElement) {
      this.showMoreElement.classList.add(this.stateClasses.isLoading);
    }
    const params = new URLSearchParams({
      page: this.page,
      limit: this.limit,
    });

    const url = `${this.#endpoint}?${params.toString()}`;

    try {
      const products = await this.fetchProducts(url);
      this.products.push(...products);

      this.renderProducts(products);

      if (products.length < this.limit) {
        this.showMoreElement.remove();
        this.showMoreElement = null;
      }

      this.page++
    } catch (e) {
      this.showError('Failed to load products. Please try again.');
    } finally {
      if (this.showMoreElement) {
        this.showMoreElement.classList.remove(this.stateClasses.isLoading);
      }
    }
  }

  showLoadingState() {
    this.listElement.classList.add(this.stateClasses.isLoading);
  }

  hideLoadingState() {
    this.listElement.classList.remove(this.stateClasses.isLoading);
  }

  showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'products-error';
    errorEl.textContent = message;
    this.listElement.insertAdjacentElement('afterend', errorEl);

    setTimeout(() => errorEl.remove(), 5000);
  }

   onShowMoreClick = async (e) => {
    e.preventDefault();
     if (this.isLoading) return;
     this.isLoading = true;
     try {
       await this.fetchAndRender();
     } finally {
       this.isLoading = false;
     }
    }

  makeProductCard(product) {
    const activeLabel = product.labels.length > 0 ? product.labels[0] : null;

    const labelsHtml =
      activeLabel ?
      `<span class="article-product__label article-product__label--${this.sanitize(activeLabel.type)}">${this.sanitize(activeLabel.value)}</span>`
      : '';

    const priceOldHtml = product.priceOld
      ? `<del class="article-product__price article-product__price--old">Rp ${product.priceOld}</del>`
      : '';

    return `
              <li class="products__item">
                  <article data-pid="${this.sanitize(product.id)}" class="products__article article-product">
                     <div class="article-product__labels">
                        ${labelsHtml}
                     </div>
                     <a
                       class="article-product__img"
                       href="/"
                     >
                        <img
                          src="img/products/${this.sanitize(product.images)}"
                          alt="${this.sanitize(product.alt)}"
                          width="285"
                          height="301"
                          loading="lazy"
                        />
                     </a>
                     <div class="article-product__body">
                        <div class="article-product__content">
                           <h3 class="article-product__title h3">${this.sanitize(product.title)}</h3>
                           <p class="article-product__text">${this.sanitize(product.text)}</p>
                        </div>
                        <div class="article-product__prices">
                           <div class="article-product__price">Rp ${product.price.toLocaleString('id-ID')}</div>
                           ${priceOldHtml}
                        </div>
                        <div class="article-product__actions actions-product">
                           <div class="actions-product__body">
                              <a class="actions-product__button button button--white" data-js-add-to-cart href="/">Add to cart</a>
                              <a class="actions-product__link icon icon--share" href="${this.sanitize(product.shareUrl)}">Share</a>
                              <a class="actions-product__link icon icon--favorite" href="${this.sanitize(product.likeUrl)}">Like</a>
                           </div>
                        </div>
                     </div>
                  </article>
               </li>
              `
  }

  renderProducts(products) {
    const html = products.map(product => this.makeProductCard(product)).join('');
    this.listElement.insertAdjacentHTML('beforeend', html);
  }

  onAddToCartClick = (e) => {
    const addToCartElement = e.target.closest(this.selectors.addToCart);
    if (!addToCartElement) return;
    e.preventDefault();
    const productCard = addToCartElement.closest('[data-pid]');
    if (!productCard) return;
    const productId = productCard.dataset.pid;
    const getProduct = this.products.find(item => String(item.id) === String(productId));

    const event = new CustomEvent('product:add', {
      detail: {
        getProduct
      },
      bubbles: true
    })

    document.dispatchEvent(event);
  }

  bindEvents() {
    this.showMoreElement.addEventListener('click', this.onShowMoreClick);
    this.listElement.addEventListener('click', this.onAddToCartClick);
  }

  destroy() {
    if (this.showMoreElement) {
      this.showMoreElement.removeEventListener('click', this.onShowMoreClick);
    }

    if (this.listElement) {
      this.listElement.removeEventListener('click', this.onAddToCartClick);
    }

    this.rootElement = null;
    this.listElement = null;
    this.showMoreElement = null;
  }

  sanitize(value) {
    if (value == null) return '';
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }
}

export class ProductsCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
   const elements = document.querySelectorAll(rootSelector);
    this.instances = [...elements].map(element => new Products(element));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}