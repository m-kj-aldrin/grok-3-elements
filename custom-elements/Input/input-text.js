/**
 * @typedef {import('./types.js').InputTextObservedAttributes} InputTextObservedAttributes
 */

/**
 * InputText - Component providing a text input interface
 * Communicates with InputRoot through internal events
 */
export class InputText extends HTMLElement {
  #inputElement = null;

  /**
   * Attributes observed by this component 
   * Combines InputText specific attributes and inherited attributes from InputRoot
   * @returns {string[]}
   */
  static get observedAttributes() {
    // InputText specific attributes
    const textAttributes = ['placeholder', 'maxlength', 'minlength', 'pattern'];
    // Inherited attributes from InputRoot that affect this component
    const inheritedAttributes = ['value', 'disabled', 'readonly', 'required'];
    
    return [...textAttributes, ...inheritedAttributes];
  }

  constructor() {
    super();
    this.#createInputElement();
  }

  connectedCallback() {
    // Append the input element if not already in the DOM
    if (!this.contains(this.#inputElement)) {
      this.appendChild(this.#inputElement);
    }

    // Set initial state
    this.#updateInputState();
    
    // Set accessibility attributes
    this.setAttribute('role', 'textbox');
    
    // Make component focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    
    // Forward focus to the input element
    this.addEventListener('focus', () => {
      if (this.#inputElement && !this.hasAttribute('disabled')) {
        this.#inputElement.focus();
      }
    });
  }

  /**
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldValue - The previous value of the attribute
   * @param {string} newValue - The new value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#inputElement) return;

    switch (name) {
      case 'value':
        if (this.#inputElement.value !== newValue) {
          this.#inputElement.value = newValue || '';
        }
        break;
      case 'placeholder':
        this.#inputElement.placeholder = newValue || '';
        break;
      case 'maxlength':
        if (newValue) {
          this.#inputElement.maxLength = newValue;
        } else {
          this.#inputElement.removeAttribute('maxlength');
        }
        break;
      case 'minlength':
        if (newValue) {
          this.#inputElement.minLength = newValue;
        } else {
          this.#inputElement.removeAttribute('minlength');
        }
        break;
      case 'pattern':
        if (newValue) {
          this.#inputElement.pattern = newValue;
        } else {
          this.#inputElement.removeAttribute('pattern');
        }
        break;
      case 'disabled':
      case 'readonly':
      case 'required':
        this.#updateInputState();
        break;
    }
  }

  // Public getters and setters
  get value() {
    return this.getAttribute('value') || '';
  }

  set value(newValue) {
    this.setAttribute('value', newValue);
  }

  get placeholder() {
    return this.getAttribute('placeholder') || '';
  }

  set placeholder(newPlaceholder) {
    this.setAttribute('placeholder', newPlaceholder);
  }

  /**
   * Creates the internal input element and sets up event listeners
   */
  #createInputElement() {
    this.#inputElement = document.createElement('input');
    this.#inputElement.type = 'text';
    
    // Add event listeners for input value changes
    this.#inputElement.addEventListener('input', this.#handleInput.bind(this));
    this.#inputElement.addEventListener('focus', this.#handleFocus.bind(this));
    this.#inputElement.addEventListener('blur', this.#handleBlur.bind(this));
    
    // Forward key events to the parent
    this.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === 'Tab') {
        this.#inputElement.dispatchEvent(new KeyboardEvent('keydown', event));
      }
    });
  }

  /**
   * Updates the input element state based on attributes
   */
  #updateInputState() {
    if (!this.#inputElement) return;

    // Set disabled state
    this.#inputElement.disabled = this.hasAttribute('disabled');
    
    // Set readonly state
    this.#inputElement.readOnly = this.hasAttribute('readonly');
    
    // Set required state
    this.#inputElement.required = this.hasAttribute('required');
    
    // Set value
    this.#inputElement.value = this.getAttribute('value') || '';
    
    // Set placeholder
    this.#inputElement.placeholder = this.getAttribute('placeholder') || '';
    
    // Set maxlength
    const maxlength = this.getAttribute('maxlength');
    if (maxlength) {
      this.#inputElement.maxLength = maxlength;
    }
    
    // Set minlength
    const minlength = this.getAttribute('minlength');
    if (minlength) {
      this.#inputElement.minLength = minlength;
    }
    
    // Set pattern
    const pattern = this.getAttribute('pattern');
    if (pattern) {
      this.#inputElement.pattern = pattern;
    }
  }

  /**
   * Handles input events and dispatches internal change events
   * @param {Event} event - The input event
   */
  #handleInput(event) {
    const value = this.#inputElement.value;
    
    // Update the value attribute
    this.setAttribute('value', value);
    
    // Dispatch internal change event to be handled by InputRoot
    this.dispatchEvent(new CustomEvent('_input-internal-change', {
      bubbles: true,
      composed: true,
      detail: { value }
    }));
  }

  /**
   * Handles focus events and dispatches internal focus events
   * @param {FocusEvent} event - The focus event
   */
  #handleFocus(event) {
    this.dispatchEvent(new CustomEvent('_input-internal-focus', {
      bubbles: true,
      composed: true,
      detail: { target: this }
    }));
  }

  /**
   * Handles blur events and dispatches internal blur events
   * @param {FocusEvent} event - The blur event
   */
  #handleBlur(event) {
    this.dispatchEvent(new CustomEvent('_input-internal-blur', {
      bubbles: true,
      composed: true,
      detail: { target: this }
    }));
  }
}

customElements.define('input-text', InputText); 