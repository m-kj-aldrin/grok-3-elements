# Custom Elements Coding Standards

This document outlines the coding standards and conventions for our custom elements library.

## Naming Conventions

### Element Naming

Custom elements follow the pattern: `[ui-role]-[sub-role]`

Examples:
- `select-root` - The main select component
- `select-trigger` - The trigger button for the select
- `select-group` - The container for select options
- `select-option` - An individual option in the select

All custom element names must:
- Contain a hyphen (required by the Web Components standard)
- Use lowercase kebab-case for HTML usage
- Use PascalCase for JavaScript class names

```javascript
// Good
class SelectRoot extends HTMLElement { /* ... */ }
customElements.define("select-root", SelectRoot);

// Bad
class selectRoot extends HTMLElement { /* ... */ }
customElements.define("selectRoot", selectRoot);
```

### Method and Property Naming

- Private methods and fields must use the `#` prefix (not underscore)
- Event handlers should follow the pattern `#onEventName`
- Public methods should use camelCase
- Boolean methods should use "is" or "has" prefix

```javascript
class SelectRoot extends HTMLElement {
  // Private field
  #isOpen = false;
  
  // Public method
  toggle() { /* ... */ }
  
  // Private method
  #updateUI() { /* ... */ }
  
  // Event handler
  #onClick(event) { /* ... */ }
}
```

## Code Structure

### Class Organization

Methods and properties should be organized in the following order:

1. Static properties and methods
2. Private fields
3. Constructor
4. Lifecycle methods
   - `connectedCallback`
   - `disconnectedCallback`
   - `attributeChangedCallback`
   - `adoptedCallback`
5. Public API methods
6. Event handlers (prefixed with `#on`)
7. Private utility methods

Example:

```javascript
class SelectRoot extends HTMLElement {
  // 1. Static properties and methods
  static get observedAttributes() {
    return ["open", "disabled"];
  }
  
  // 2. Private fields
  #isOpen = false;
  #options = [];
  
  // 3. Constructor (if needed)
  constructor() {
    super();
  }
  
  // 4. Lifecycle methods
  connectedCallback() { /* ... */ }
  disconnectedCallback() { /* ... */ }
  attributeChangedCallback(name, oldValue, newValue) { /* ... */ }
  
  // 5. Public API methods
  open() { /* ... */ }
  close() { /* ... */ }
  
  // 6. Event handlers
  #onClick(event) { /* ... */ }
  #onKeydown(event) { /* ... */ }
  
  // 7. Private utility methods
  #updateUI() { /* ... */ }
  #setFocus() { /* ... */ }
}
```

### Event Handling

- Event handlers should be attached to the custom element itself when possible
- No need to bind `this` as the handler is a method of the class
- Always remove event listeners in `disconnectedCallback`

```javascript
class SelectRoot extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeydown);
  }
  
  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeydown);
  }
  
  #onClick(event) {
    // 'this' refers to the custom element, no binding needed
    this.toggle();
  }
}
```

## Documentation

### JSDoc Comments

All classes, public methods, and properties should have JSDoc comments:

```javascript
/**
 * Represents a custom select dropdown component.
 * @extends HTMLElement
 */
class SelectRoot extends HTMLElement {
  /**
   * Opens the select dropdown.
   * @fires SelectRoot#change - When the dropdown is opened
   * @returns {void}
   */
  open() {
    // Implementation
  }
  
  /**
   * @typedef {Object} OptionData
   * @property {string} value - The option value
   * @property {string} label - The option display text
   */
  
  /**
   * Adds a new option to the select.
   * @param {OptionData} option - The option to add
   * @returns {HTMLElement} The created option element
   */
  addOption(option) {
    // Implementation
  }
}
```

### Type Definitions

Use JSDoc for type definitions and leverage generics where possible:

```javascript
/**
 * Finds the first element matching the selector.
 * @template {HTMLElement} T
 * @param {string} selector - CSS selector
 * @returns {T|null} The found element or null
 */
function findElement(selector) {
  return document.querySelector(selector);
}
```

## Best Practices

### DOM Manipulation

- Custom elements should rarely create and attach new elements to the DOM
- The HTML structure should be authored in markup by developers
- DOM manipulation should be limited to:
  - Setting attributes/properties on existing elements
  - Toggling classes
  - Updating text content
  - Managing focus

### State Management

- Use private fields for internal state
- Reflect state changes to attributes when appropriate
- Dispatch custom events when state changes

```javascript
class SelectRoot extends HTMLElement {
  #isOpen = false;
  
  toggle() {
    this.#isOpen = !this.#isOpen;
    this.toggleAttribute("open", this.#isOpen);
    this.dispatchEvent(new CustomEvent("toggle", { 
      detail: { open: this.#isOpen },
      bubbles: true 
    }));
  }
}
```

### Accessibility

- Always set appropriate ARIA attributes
- Ensure keyboard navigation works
- Manage focus appropriately
- Test with screen readers

### Performance

- Minimize DOM operations
- Use event delegation
- Avoid expensive operations in frequently called methods
- Clean up resources in `disconnectedCallback` 