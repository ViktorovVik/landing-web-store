class SubscribeForm {
  selectors = {
    form: '[data-js-subscribe-form]',
    input: '[data-js-subscribe-input]',
    button: '[data-js-subscribe-button]',
    error: '[data-js-form-error]',
  }

  stateClasses = {
    isInvalid: 'is-invalid',
    isLoading: 'is-loading'
  }

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.inputElement = this.rootElement.querySelector(this.selectors.input);
    this.buttonElement = this.rootElement.querySelector(this.selectors.button);
    this.errorElement = this.rootElement.querySelector(this.selectors.error);
    this.bindEvents();
  }

  isValidEmail(email) {
    const emailRegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegExp.test(email);
  }

  showError(message) {
    this.errorElement.textContent = message;
    this.inputElement.classList.add(this.stateClasses.isInvalid);
  }


  clearError() {
    this.errorElement.textContent = '';
    this.inputElement.classList.remove(this.stateClasses.isInvalid);
  }

  showSuccessPopup(email) {
    const event = new CustomEvent('popup:show', {
      detail: {
        id: 'success-popup',
        type: 'success',
        title: 'Success!',
        message: `Thank you for subscribing! We've sent a confirmation to ${email}`,
      }
    });
    document.dispatchEvent(event);
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.clearError();

    const value = this.inputElement.value.trim();

    if (!value) {
      this.showError('Email is required');
      return;
    }

    if (!this.isValidEmail(value)) {
      this.showError('Please enter a valid email address');
      return;
    }

    this.setLoading(true);

    try {
      const response = await this.submitForm(value);

      if (response.success) {
        this.showSuccessPopup(value);
        this.rootElement.reset();
      }
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    if (isLoading) {
      this.buttonElement.disabled = true;
      this.buttonElement.classList.add(this.stateClasses.isLoading);
      this.inputElement.disabled = true;
    } else {
      this.buttonElement.disabled = false;
      this.buttonElement.classList.remove(this.stateClasses.isLoading);
      this.inputElement.disabled = false;
    }
  }

  async submitForm(email) {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({ success: true});
        } else {
          reject(new Error('Server error. Please try again later.'));
        }
      }, 1500);
    });
  }

  onInput = () => {
    if (this.inputElement.classList.contains(this.stateClasses.isInvalid)) {
      this.clearError();
    }
  }

  destroy() {
    this.setLoading(false);
    this.rootElement.removeEventListener('submit', this.onSubmit);
    this.inputElement.removeEventListener('input', this.onInput);

    this.rootElement = null;
    this.inputElement = null;
    this.buttonElement = null;
    this.errorElement = null;
  }

  bindEvents() {
    this.rootElement.addEventListener('submit', this.onSubmit);
    this.inputElement.addEventListener('input', this.onInput);
  }
}

export class SubscribeFormCollection {
  constructor() {
    this.instances = [];
    this.init();
  }

  init() {
    const elements = document.querySelectorAll('[data-js-subscribe-form]');
    this.instances = Array.from(elements).map(el => new SubscribeForm(el));
  }

  destroy() {
    this.instances.forEach(instance => instance.destroy());
    this.instances = [];
  }
}