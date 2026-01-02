const rootSelector = '[data-js-gallery-scroll]';

class GalleryScroll {
  selectors = {
    root: rootSelector,
    body: '[data-js-gallery-body]',
    items: '[data-js-gallery-scroll-items]',
    item: '[data-js-gallery-scroll-item]'
  };

  stateClasses = {
    isAnimating: 'is-animating'
  };

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.bodyElement = this.rootElement.querySelector(this.selectors.body);
    this.itemsElement = this.rootElement.querySelector(this.selectors.items);

    this.speed = parseFloat(this.bodyElement?.dataset.speed) || 0.05; // Немного уменьшил для плавности
    this.positionsX = 0;
    this.targetX = 0;
    this.animationId = null;

    if (this.bodyElement && this.itemsElement) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
  }

  calculatePosition = () => {
    const itemsWidth = this.itemsElement.scrollWidth;
    const bodyWidth = this.bodyElement.offsetWidth;

    const maxScroll = itemsWidth - bodyWidth;

    if (maxScroll <= 0) {
      this.itemsElement.style.transform = `translate3d(0, 0, 0)`;
      return;
    }

    const distX = this.targetX - this.positionsX;
    this.positionsX = this.positionsX + (distX * this.speed);

    let position = (maxScroll / 100) * this.positionsX;


    position = Math.max(0, Math.min(position, maxScroll));

    this.itemsElement.style.transform = `translate3d(${-position}px, 0, 0)`;

    if (Math.abs(distX) > 0.01) {
      this.animationId = requestAnimationFrame(this.calculatePosition);
    } else {
      this.bodyElement.classList.remove(this.stateClasses.isAnimating);
      this.animationId = null;
    }
  }

  onMouseMove = (e) => {
    const bodyRect = this.bodyElement.getBoundingClientRect();
    const x = e.clientX - bodyRect.left; // Позиция мыши внутри блока в PX

    this.targetX = (x / bodyRect.width) * 100;

    if (!this.animationId) {
      this.bodyElement.classList.add(this.stateClasses.isAnimating);
      this.animationId = requestAnimationFrame(this.calculatePosition);
    }
  }


  bindEvents() {
    this.bodyElement.addEventListener('mousemove', this.onMouseMove);
    this.bodyElement.addEventListener('mouseleave', this.onMouseLeave);
  }

  destroy() {
    this.bodyElement.removeEventListener('mousemove', this.onMouseMove);
    this.bodyElement.removeEventListener('mouseleave', this.onMouseLeave);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}

export class GalleryScrollCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll(rootSelector);
    this.instances = [...elements].map(element => new GalleryScroll(element));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}