/**
 * @typedef {import('./types.js').InputSliderObservedAttributes} InputSliderObservedAttributes
 */

/**
 * InputSlider - Component providing a slider input interface
 * Communicates with InputRoot through internal events
 */
export class InputSlider extends HTMLElement {
  #min = 0;
  #max = 100;
  #step = 1;
  #value = 0;
  #isInteracting = false;
  #trackElement = null;
  #thumbElement = null;
  #isConnected = false;

  /**
   * Attributes observed by this component
   * Combines InputSlider specific attributes and inherited attributes from InputRoot
   * @returns {string[]}
   */
  static get observedAttributes() {
    // InputSlider specific attributes
    const sliderAttributes = ['min', 'max', 'step'];
    // Inherited attributes from InputRoot that affect this component
    const inheritedAttributes = ['value', 'disabled', 'readonly', 'required'];
    
    return [...sliderAttributes, ...inheritedAttributes];
  }

  constructor() {
    super();
    this.#isConnected = false;
  }

  connectedCallback() {
    // Find track and thumb elements
    this.#trackElement = this.querySelector('input-slider-track');
    this.#thumbElement = this.querySelector('input-slider-thumb');
    
    // If track or thumb is missing, create them
    if (!this.#trackElement) {
      this.#trackElement = document.createElement('input-slider-track');
      this.appendChild(this.#trackElement);
    }
    
    if (!this.#thumbElement) {
      this.#thumbElement = document.createElement('input-slider-thumb');
      this.appendChild(this.#thumbElement);
    }
    
    // Initialize values from attributes
    this.#min = Number(this.getAttribute('min') || 0);
    this.#max = Number(this.getAttribute('max') || 100);
    this.#step = Number(this.getAttribute('step') || 1);
    this.#value = Number(this.getAttribute('value') || this.#min);
    
    // Ensure value is within min/max range
    this.#value = Math.max(this.#min, Math.min(this.#max, this.#value));
    
    // Set up event listeners
    this.addEventListener('mousedown', this.#handleMouseDown.bind(this));
    this.addEventListener('touchstart', this.#handleTouchStart.bind(this), { passive: false });
    window.addEventListener('mousemove', this.#handleMouseMove.bind(this));
    window.addEventListener('touchmove', this.#handleTouchMove.bind(this), { passive: false });
    window.addEventListener('mouseup', this.#handleInteractionEnd.bind(this));
    window.addEventListener('touchend', this.#handleInteractionEnd.bind(this));
    
    // Set up keyboard navigation
    this.addEventListener('keydown', this.#handleKeyDown.bind(this));
    
    // Set accessibility attributes
    this.setAttribute('role', 'slider');
    
    // Make component focusable
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '0');
    }
    
    this.setAttribute('aria-valuemin', String(this.#min));
    this.setAttribute('aria-valuemax', String(this.#max));
    this.setAttribute('aria-valuenow', String(this.#value));
    
    // Handle focus events
    this.addEventListener('focus', this.#handleFocus.bind(this));
    this.addEventListener('blur', this.#handleBlur.bind(this));
    
    // Mark as connected
    this.#isConnected = true;
    
    // Update the visual representation
    this.#updatePosition();
    
    // Use a short delay to ensure the DOM is fully ready and styles are applied
    setTimeout(() => {
      this.#updatePosition();
    }, 0);
  }

  disconnectedCallback() {
    // Remove global event listeners
    window.removeEventListener('mousemove', this.#handleMouseMove.bind(this));
    window.removeEventListener('touchmove', this.#handleTouchMove.bind(this));
    window.removeEventListener('mouseup', this.#handleInteractionEnd.bind(this));
    window.removeEventListener('touchend', this.#handleInteractionEnd.bind(this));
    
    this.#isConnected = false;
  }

  /**
   * @param {string} name - The name of the attribute that changed
   * @param {string} oldValue - The previous value of the attribute
   * @param {string} newValue - The new value of the attribute
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'min':
        this.#min = Number(newValue || 0);
        this.setAttribute('aria-valuemin', String(this.#min));
        break;
      case 'max':
        this.#max = Number(newValue || 100);
        this.setAttribute('aria-valuemax', String(this.#max));
        break;
      case 'step':
        this.#step = Number(newValue || 1);
        break;
      case 'value':
        this.#value = Number(newValue || this.#min);
        this.#value = Math.max(this.#min, Math.min(this.#max, this.#value));
        this.setAttribute('aria-valuenow', String(this.#value));
        // Update position if connected
        if (this.#isConnected) {
          // Use setTimeout to ensure consistent rendering
          setTimeout(() => {
            this.#updatePosition();
          }, 0);
        }
        break;
      case 'disabled':
        this.toggleAttribute('aria-disabled', this.hasAttribute('disabled'));
        break;
      case 'readonly':
        this.toggleAttribute('aria-readonly', this.hasAttribute('readonly'));
        break;
      case 'required':
        // Required has no direct ARIA equivalent for sliders
        break;
    }
  }

  // Public getters and setters
  get value() {
    return this.#value;
  }

  set value(newValue) {
    const numValue = Number(newValue);
    const normalizedValue = Math.max(this.#min, Math.min(this.#max, numValue));
    this.setAttribute('value', String(normalizedValue));
  }

  get min() {
    return this.#min;
  }

  set min(value) {
    this.setAttribute('min', String(value));
  }

  get max() {
    return this.#max;
  }

  set max(value) {
    this.setAttribute('max', String(value));
  }

  get step() {
    return this.#step;
  }

  set step(value) {
    this.setAttribute('step', String(value));
  }

  /**
   * Updates the visual position of the slider thumb based on the current value
   */
  #updatePosition() {
    if (!this.#thumbElement || !this.#isConnected) return;

    const percentage = ((this.#value - this.#min) / (this.#max - this.#min)) * 100;
    this.#thumbElement.style.left = `${percentage}%`;
    
    if (this.#trackElement) {
      this.#trackElement.style.setProperty('--filled-percentage', `${percentage}%`);
    }
  }

  /**
   * Handles mouse down events on the slider
   * @param {MouseEvent} event - The mouse event
   */
  #handleMouseDown(event) {
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) return;
    
    this.#isInteracting = true;
    this.#updateValueFromPosition(event.clientX);
    event.preventDefault();
  }

  /**
   * Handles touch start events on the slider
   * @param {TouchEvent} event - The touch event
   */
  #handleTouchStart(event) {
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) return;
    
    this.#isInteracting = true;
    this.#updateValueFromPosition(event.touches[0].clientX);
    event.preventDefault();
  }

  /**
   * Handles mouse move events during slider interaction
   * @param {MouseEvent} event - The mouse event
   */
  #handleMouseMove(event) {
    if (!this.#isInteracting) return;
    
    this.#updateValueFromPosition(event.clientX);
    event.preventDefault();
  }

  /**
   * Handles touch move events during slider interaction
   * @param {TouchEvent} event - The touch event
   */
  #handleTouchMove(event) {
    if (!this.#isInteracting) return;
    
    this.#updateValueFromPosition(event.touches[0].clientX);
    event.preventDefault();
  }

  /**
   * Handles the end of interaction (mouse up or touch end)
   * @param {Event} event - The event
   */
  #handleInteractionEnd(event) {
    if (!this.#isInteracting) return;
    
    this.#isInteracting = false;
    
    // Dispatch change event when interaction ends
    this.dispatchEvent(new CustomEvent('_input-internal-blur', {
      bubbles: true,
      composed: true,
      detail: { target: this }
    }));
  }

  /**
   * Handles keyboard navigation for the slider
   * @param {KeyboardEvent} event - The keyboard event
   */
  #handleKeyDown(event) {
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) return;
    
    let newValue = this.#value;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newValue = Math.min(this.#max, this.#value + this.#step);
        event.preventDefault();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        newValue = Math.max(this.#min, this.#value - this.#step);
        event.preventDefault();
        break;
      case 'Home':
        newValue = this.#min;
        event.preventDefault();
        break;
      case 'End':
        newValue = this.#max;
        event.preventDefault();
        break;
      case 'PageUp':
        newValue = Math.min(this.#max, this.#value + this.#step * 10);
        event.preventDefault();
        break;
      case 'PageDown':
        newValue = Math.max(this.#min, this.#value - this.#step * 10);
        event.preventDefault();
        break;
    }
    
    if (newValue !== this.#value) {
      this.#value = newValue;
      this.setAttribute('value', String(this.#value));
      this.setAttribute('aria-valuenow', String(this.#value));
      this.#updatePosition();
      
      // Dispatch internal change event
      this.dispatchEvent(new CustomEvent('_input-internal-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.#value.toString() }
      }));
    }
  }

  /**
   * Updates the slider value based on the pointer position
   * @param {number} clientX - The client X coordinate of the pointer
   */
  #updateValueFromPosition(clientX) {
    const rect = this.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    
    // Calculate the value based on percentage, min, max, and step
    let rawValue = this.#min + percentage * (this.#max - this.#min);
    
    // Round to the nearest step
    const steps = Math.round((rawValue - this.#min) / this.#step);
    const steppedValue = this.#min + steps * this.#step;
    
    // Ensure value is within min/max range
    this.#value = Math.max(this.#min, Math.min(this.#max, steppedValue));
    
    // Update attributes and position
    this.setAttribute('value', String(this.#value));
    this.setAttribute('aria-valuenow', String(this.#value));
    this.#updatePosition();
    
    // Dispatch internal change event
    this.dispatchEvent(new CustomEvent('_input-internal-change', {
      bubbles: true,
      composed: true,
      detail: { value: this.#value.toString() }
    }));
  }

  /**
   * Handle focus event
   * @param {FocusEvent} event
   */
  #handleFocus(event) {
    if (!this.hasAttribute('disabled')) {
      this.dispatchEvent(new CustomEvent('_input-internal-focus', {
        bubbles: true,
        composed: true,
        detail: { target: this }
      }));
    }
  }

  /**
   * Handle blur event
   * @param {FocusEvent} event
   */
  #handleBlur(event) {
    this.dispatchEvent(new CustomEvent('_input-internal-blur', {
      bubbles: true,
      composed: true,
      detail: { target: this }
    }));
  }
}

customElements.define('input-slider', InputSlider); 