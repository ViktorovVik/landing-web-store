import Swiper from 'swiper';
import { Navigation, Pagination, Parallax } from 'swiper/modules';
const rootSelector = '[data-js-main-slider]';

class Slider {
  selectors = {
    root: rootSelector,
    slider: '[data-js-slider]',
    pagination: '[data-js-slider-pagination]',
    navigation: '[data-js-slider-navigation]',
    previousButton: '[data-js-slider-previous]',
    nextButton: '[data-js-slider-next]',
  }

  defaultOptions = {
    slidesPerView: 1,
    spaceBetween: 32,
    speed: 800,
    loop: true,
    watchSlidesProgress: false,
    parallax: true,
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.sliderElement = this.rootElement.querySelector(this.selectors.slider);
    this.paginationElement = this.rootElement.querySelector(this.selectors.pagination);
    this.nextButtonElement = this.rootElement.querySelector(this.selectors.nextButton);
    this.prevButtonElement = this.rootElement.querySelector(this.selectors.previousButton);
    if (!this.sliderElement) return;
    this.updateSlideNumbers();
    this.init();
  }

  getCustomOptions() {
    const configRaw = this.rootElement.dataset.sliderConfig;
    if (!configRaw) return {};

    try {
      return JSON.parse(configRaw);
    } catch (e) {
      console.warn("Slider: Error in format of JSON settings", e);
      return {};
    }
  }

  getModules(customOptions) {
    const modules = [];
    if (this.paginationElement) modules.push(Pagination);
    if (this.nextButtonElement || this.prevButtonElement) modules.push(Navigation);
    if (customOptions.parallax !== false && this.defaultOptions.parallax !== false) modules.push(Parallax);
    return modules;
  }

  updateSlideNumbers() {
    const realSlides = this.sliderElement.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');

    realSlides.forEach((slide, index) => {
      const numberElement = slide.querySelector('.label-slider__number');
      if (numberElement) {
        numberElement.textContent = String(index + 1).padStart(2, '0');
      }
    });
  }

  init() {
    const customOptions = this.getCustomOptions();
    const modules = this.getModules(customOptions);

    const swiperOptions = {
      modules,
        ...this.defaultOptions,
        ...customOptions,

      pagination: this.paginationElement ? {
            el: this.paginationElement,
            clickable: true,
            type: 'bullets',
            ...customOptions.pagination,
          } : undefined,

      navigation: (this.nextButtonElement || this.prevButtonElement) ? {
        nextEl: this.nextButtonElement,
        prevEl: this.prevButtonElement,
      } : undefined,


    }

    this.swiper = new Swiper(this.sliderElement, swiperOptions);

    this.updateSlideNumbers();
  }

  destroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }
}

export class SliderCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll(rootSelector);
    this.instances = [...elements].map(element => new Slider(element));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}