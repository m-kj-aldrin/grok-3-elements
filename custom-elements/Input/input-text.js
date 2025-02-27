/**
 * @typedef {import('./types.js').InputTextObservedAttributes} InputTextObservedAttributes
 */

/**
 * InputText - Component providing a text input interface
 * Communicates with InputRoot through internal events
 */
export class InputText extends HTMLElement {
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
    // Set up the element itself for editing
    this.contentEditable = 'true';
    this.spellcheck = false;
    
    // Set up event listeners directly on the element
    this.addEventListener('input', this.#handleInput.bind(this));
    this.addEventListener('focus', this.#handleFocus.bind(this));
    this.addEventListener('blur', this.#handleBlur.bind(this));
    this.addEventListener('keydown', this.#handleKeyDown.bind(this));
  }

  connectedCallback() {
    // Set initial state
    this.#updateState();
    
    // Set accessibility attributes
    this.setAttribute('role', 'textbox');
    this.setAttribute('aria-multiline', 'false');
    
    // Make component focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
  }

  /**
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldValue - The previous value of the attribute
   * @param {string} newValue - The new value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'value':
        // Only update the text content if it's different from the current value
        // to prevent loops with the input event
        if (this.textContent !== newValue) {
          this.textContent = newValue || '';
        }
        break;
      case 'placeholder':
        if (newValue) {
          this.dataset.placeholder = newValue;
        } else {
          delete this.dataset.placeholder;
        }
        break;
      case 'maxlength':
        if (newValue) {
          this.dataset.maxlength = newValue;
          // If current content exceeds maxlength, truncate it
          if (this.textContent.length > parseInt(newValue, 10)) {
            this.textContent = this.textContent.substring(0, parseInt(newValue, 10));
            this.#setCursorAtEnd();
          }
        } else {
          delete this.dataset.maxlength;
        }
        break;
      case 'minlength':
        if (newValue) {
          this.dataset.minlength = newValue;
        } else {
          delete this.dataset.minlength;
        }
        break;
      case 'pattern':
        if (newValue) {
          this.dataset.pattern = newValue;
        } else {
          delete this.dataset.pattern;
        }
        break;
      case 'disabled':
      case 'readonly':
      case 'required':
        this.#updateState();
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
   * Updates the element state based on attributes
   */
  #updateState() {
    // Set editable state based on disabled and readonly attributes
    const isDisabled = this.hasAttribute('disabled');
    const isReadonly = this.hasAttribute('readonly');
    this.contentEditable = (!isDisabled && !isReadonly).toString();
    
    // Set placeholder via data attribute
    const placeholder = this.getAttribute('placeholder');
    if (placeholder) {
      this.dataset.placeholder = placeholder;
    } else {
      delete this.dataset.placeholder;
    }
    
    // Set value
    this.textContent = this.getAttribute('value') || '';
    
    // Update ARIA attributes
    this.setAttribute('aria-disabled', String(isDisabled));
    this.setAttribute('aria-readonly', String(isReadonly));
    this.setAttribute('aria-required', String(this.hasAttribute('required')));
  }
  
  /**
   * Handles input events and dispatches internal change events
   * @param {Event} event - The input event
   */
  #handleInput(event) {
    let value = this.textContent;
    
    // Implement maxlength constraint
    const maxlength = this.getAttribute('maxlength');
    if (maxlength && value.length > parseInt(maxlength, 10)) {
      // Truncate the content if it exceeds maxlength
      value = value.substring(0, parseInt(maxlength, 10));
      this.textContent = value;
      // Position cursor at the end
      this.#setCursorAtEnd();
    }
    
    // Don't update if the value is the same to prevent loops
    if (value === this.getAttribute('value')) {
      return;
    }
    
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
    if (this.hasAttribute('disabled')) {
      this.blur();
      return;
    }
    
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
    // Validate the content against pattern
    const pattern = this.getAttribute('pattern');
    if (pattern) {
      const regex = new RegExp(pattern);
      const value = this.textContent;
      if (value && !regex.test(value)) {
        // If validation fails, add an invalid attribute
        this.setAttribute('aria-invalid', 'true');
      } else {
        this.removeAttribute('aria-invalid');
      }
    }
    
    this.dispatchEvent(new CustomEvent('_input-internal-blur', {
      bubbles: true,
      composed: true,
      detail: { target: this }
    }));
  }
  
  /**
   * Handles keyboard events
   * @param {KeyboardEvent} event - The keyboard event
   */
  #handleKeyDown(event) {
    // If disabled or readonly, prevent input
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) {
      event.preventDefault();
      return;
    }
    
    // Handle Enter key (prevent default line break and dispatch event)
    if (event.key === 'Enter') {
      event.preventDefault();
      // Dispatch a special event to simulate form submission
      this.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true
      }));
      return;
    }
    
    // Check maxlength before allowing more input (except for delete/backspace/navigation keys)
    const maxlength = this.getAttribute('maxlength');
    if (maxlength && 
        this.textContent.length >= parseInt(maxlength, 10) && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) &&
        !event.ctrlKey && 
        !event.metaKey) {
      event.preventDefault();
    }
  }
  
  /**
   * Sets the cursor at the end of the text content
   */
  #setCursorAtEnd() {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(this);
    range.collapse(false); // false means collapse to end
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

customElements.define('input-text', InputText); 