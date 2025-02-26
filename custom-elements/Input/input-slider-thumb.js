/**
 * InputSliderThumb - Component providing the draggable thumb for the slider
 */
export class InputSliderThumb extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // Set initial position
    this.style.left = '0%';
    
    // Set accessibility attributes
    this.setAttribute('role', 'presentation');
  }
}

customElements.define('input-slider-thumb', InputSliderThumb); 