/**
 * @typedef {import('./types.js').InputRootObservedAttributes} InputRootObservedAttributes
 */

/**
 * InputRoot - Main component managing input state and value
 * Coordinates between the interface components and form behavior
 */
export class InputRoot extends HTMLElement {
  #value = '';
  #type = 'text';
  #form = null;
  #internals = null;
  #handleInternalChangeFunc = null;
  #handleInternalFocusFunc = null;
  #handleInternalBlurFunc = null;

  /**
   * Indicates this custom element can be associated with a form
   */
  static formAssociated = true;

  /** @type {InputRootObservedAttributes} */
  static get observedAttributes() {
    return ['value', 'disabled', 'readonly', 'required', 'type', 'name', 'form'];
  }

  constructor() {
    super();
    // Initialize form internals if supported
    if (window.ElementInternals && HTMLElement.prototype.attachInternals) {
      this.#internals = this.attachInternals();
    }

    // Bind event handlers
    this.#handleInternalChangeFunc = this.#handleInternalChange.bind(this);
    this.#handleInternalFocusFunc = this.#handleInternalFocus.bind(this);
    this.#handleInternalBlurFunc = this.#handleInternalBlur.bind(this);
  }

  connectedCallback() {
    // Add event listeners for internal events
    this.addEventListener('_input-internal-change', this.#handleInternalChangeFunc);
    this.addEventListener('_input-internal-focus', this.#handleInternalFocusFunc);
    this.addEventListener('_input-internal-blur', this.#handleInternalBlurFunc);

    // Set initial state based on attributes
    this.#type = this.getAttribute('type') || 'text';
    this.#value = this.getAttribute('value') || '';
    
    // Setup form association
    if (this.#internals && this.hasAttribute('form')) {
      const formId = this.getAttribute('form');
      this.#form = document.getElementById(formId);
    }

    // Set initial accessibility attributes
    this.setAttribute('role', 'group');
    this.#updateInterfaceState();
  }

  disconnectedCallback() {
    // Remove event listeners
    this.removeEventListener('_input-internal-change', this.#handleInternalChangeFunc);
    this.removeEventListener('_input-internal-focus', this.#handleInternalFocusFunc);
    this.removeEventListener('_input-internal-blur', this.#handleInternalBlurFunc);
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
        this.#value = newValue || '';
        this.#updateInterfaceState();
        break;
      case 'type':
        this.#type = newValue || 'text';
        break;
      case 'disabled':
      case 'readonly':
      case 'required':
        this.#updateInterfaceState();
        break;
      case 'form':
        if (this.#internals) {
          this.#form = newValue ? document.getElementById(newValue) : null;
        }
        break;
    }
  }

  // Public getters and setters
  get value() {
    return this.#value;
  }

  set value(newValue) {
    this.#value = String(newValue);
    this.setAttribute('value', this.#value);
    this.#updateInterfaceState();
  }

  get type() {
    return this.#type;
  }

  set type(newType) {
    this.#type = newType;
    this.setAttribute('type', newType);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(isDisabled) {
    this.toggleAttribute('disabled', isDisabled);
    this.#updateInterfaceState();
  }

  get readonly() {
    return this.hasAttribute('readonly');
  }

  set readonly(isReadonly) {
    this.toggleAttribute('readonly', isReadonly);
    this.#updateInterfaceState();
  }

  get required() {
    return this.hasAttribute('required');
  }

  set required(isRequired) {
    this.toggleAttribute('required', isRequired);
    this.#updateInterfaceState();
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  set name(newName) {
    if (newName) {
      this.setAttribute('name', newName);
    } else {
      this.removeAttribute('name');
    }
  }

  get form() {
    return this.#form;
  }

  /**
   * Handle internal change events from child components
   * @param {CustomEvent} event - The internal change event
   */
  #handleInternalChange(event) {
    event.stopPropagation();
    const newValue = event.detail.value;
    
    if (this.#value !== newValue) {
      this.#value = newValue;
      
      // Update the value attribute to reflect the new value
      this.setAttribute('value', newValue);
      
      // Dispatch standard input event
      this.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Update form internals if available
      if (this.#internals) {
        this.#internals.setFormValue(newValue);
      }
    }
  }

  /**
   * Handle internal focus events from child components
   * @param {CustomEvent} event - The internal focus event
   */
  #handleInternalFocus(event) {
    event.stopPropagation();
    this.dispatchEvent(new Event('focus', { bubbles: true }));
  }

  /**
   * Handle internal blur events from child components
   * @param {CustomEvent} event - The internal blur event
   */
  #handleInternalBlur(event) {
    event.stopPropagation();
    
    // Dispatch standard change event on blur
    this.dispatchEvent(new Event('change', { bubbles: true }));
    this.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /**
   * Update the state of all child interface components
   */
  #updateInterfaceState() {
    // Find all interface components
    const interfaceComponents = this.querySelectorAll('input-text, input-slider');
    
    // Update each interface component with the current state
    interfaceComponents.forEach(component => {
      // Set value
      if (component.getAttribute('value') !== this.#value) {
        component.setAttribute('value', this.#value);
        
        // For sliders, ensure value change is processed after element is fully initialized
        if (component.tagName.toLowerCase() === 'input-slider') {
          setTimeout(() => {
            // Trick to force a re-render
            const currentLeft = component.querySelector('input-slider-thumb')?.style.left;
            if (currentLeft === '0%' || !currentLeft) {
              // Force a recalculation if thumb is at 0% but value isn't minimum
              const value = Number(this.#value);
              const min = Number(component.getAttribute('min') || 0);
              if (value > min) {
                // Toggle attribute to force update
                component.removeAttribute('value');
                component.setAttribute('value', this.#value);
              }
            }
          }, 0);
        }
      }
      
      // Set disabled state
      component.toggleAttribute('disabled', this.disabled);
      
      // Set readonly state
      component.toggleAttribute('readonly', this.readonly);
      
      // Set required state
      component.toggleAttribute('required', this.required);
    });
  }
}

customElements.define('input-root', InputRoot); 