# Custom Elements Coding Standards

This document outlines the detailed coding standards and conventions for our custom elements library. It focuses on naming conventions, code organization, documentation practices, accessibility, and testing best practices.

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
- Boolean methods should use an "is" or "has" prefix

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
/**
 * @typedef {['open', 'disabled']} ObservedAttributes
 */

class SelectRoot extends HTMLElement {
  // 1. Static properties and methods
  /**
   * @type {ObservedAttributes}
   */
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
  
  /**
   * @param {ObservedAttributes[number]} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
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

### Attribute Typing

Always create TypeScript-like types using JSDoc for observed attributes:

```javascript
/**
 * @typedef {['open', 'disabled', 'readonly']} ObservedAttributes
 */

class MyElement extends HTMLElement {
  /**
   * @type {ObservedAttributes}
   */
  static get observedAttributes() {
    return ["open", "disabled", "readonly"];
  }
  
  /**
   * @param {ObservedAttributes[number]} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Implementation...
  }
}
```

### Event Handling

- Only bind event handlers to elements other than the custom element itself when necessary
- When binding to the custom element itself, there's no need to bind `this` as the handler is a method of the class
- Always remove event listeners in `disconnectedCallback`

```javascript
class SelectRoot extends HTMLElement {
  connectedCallback() {
    // Add listeners directly to the custom element - preferred approach
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeydown);
    
    // Only add listeners to other elements when necessary
    const button = this.querySelector("button");
    if (button) {
      // Store reference for cleanup
      this.#buttonClickHandler = this.#onButtonClick.bind(this);
      button.addEventListener("click", this.#buttonClickHandler);
    }
  }
  
  disconnectedCallback() {
    // Remove listeners from custom element
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeydown);
    
    // Clean up other element listeners
    const button = this.querySelector("button");
    if (button && this.#buttonClickHandler) {
      button.removeEventListener("click", this.#buttonClickHandler);
    }
  }
  
  #onClick(event) {
    // 'this' refers to the custom element, no binding needed
    this.toggle();
  }
}
```

### Custom Input Handling

When implementing custom elements that replace native input functionality:

- Never wrap or extend native `<input>` elements
- Build all input handling logic from scratch
- Implement keyboard navigation, focus management, and form integration
- Use appropriate ARIA attributes to communicate role and state

```javascript
// AVOID:
class CustomInput extends HTMLElement {
  connectedCallback() {
    // Bad: Wrapping a native input
    this.innerHTML = `<input type="text">`;
    this._input = this.querySelector("input");
  }
}

// RECOMMENDED:
class CustomInput extends HTMLElement {
  #value = "";
  
  connectedCallback() {
    // Good: Building custom input functionality
    this.setAttribute("role", "textbox");
    this.setAttribute("tabindex", "0");
    this.addEventListener("keydown", this.#onKeydown);
  }
  
  #onKeydown(event) {
    // Implement custom keyboard handling
    if (event.key.length === 1) {
      this.#value += event.key;
      this.textContent = this.#value;
      this.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (event.key === "Backspace") {
      this.#value = this.#value.slice(0, -1);
      this.textContent = this.#value;
      this.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
}
```

### Implementation Priorities

When building custom elements, follow this approach:

1. Focus on internal logic first:
   - Implement core functionality through attributes
   - Ensure the element works effectively when authored with HTML

2. Only after establishing a working custom element:
   - Add getter/setter properties
   - Develop public API methods

```javascript
// Phase 1: Focus on attribute-driven implementation
class ToggleButton extends HTMLElement {
  static get observedAttributes() {
    return ["pressed"];
  }
  
  connectedCallback() {
    this.setAttribute("role", "button");
    this.setAttribute("tabindex", "0");
    this.addEventListener("click", this.#onClick);
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "pressed") {
      this.#updateUI();
    }
  }
  
  #onClick() {
    const isPressed = this.hasAttribute("pressed");
    this.toggleAttribute("pressed", !isPressed);
  }
  
  #updateUI() {
    const isPressed = this.hasAttribute("pressed");
    this.setAttribute("aria-pressed", isPressed.toString());
  }
}

// Phase 2: Add public API only after attribute implementation works
class ToggleButton extends HTMLElement {
  // ... all the code from phase 1 ...
  
  // Add public API methods later
  toggle() {
    const isPressed = this.hasAttribute("pressed");
    this.toggleAttribute("pressed", !isPressed);
  }
  
  get pressed() {
    return this.hasAttribute("pressed");
  }
  
  set pressed(value) {
    this.toggleAttribute("pressed", Boolean(value));
  }
}
```

## Documentation Requirements

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

### Component README

Each component family should have a README.md with:

```markdown
# Select Components

Brief description of what this component family does and when to use it.

## Components

### SelectRoot

The main component that...

#### Attributes

- `attribute-one`: Controls X behavior
- `attribute-two`: Determines Y state

#### Properties

- `propertyOne`: Programmatic access to X
- `propertyTwo`: Programmatic access to Y

#### Events

- `custom-event`: Fired when Z occurs

#### Example

```html
<select-root attribute-one="value">
  <select-trigger></select-trigger>
  <select-option value="1">Option 1</select-option>
</select-root>
```
```

## Accessibility Requirements

All custom elements must:

- Use appropriate ARIA roles and attributes
- Support keyboard navigation
- Manage focus appropriately
- Be tested with screen readers

### Keyboard Navigation

- Ensure all interactive elements are focusable
- Implement standard keyboard shortcuts (e.g., arrow keys for navigation)
- Trap focus within modal components when appropriate
- Provide clear focus indicators

### ARIA Attributes

- Use ARIA attributes to communicate state and relationships
- Update ARIA attributes when component state changes
- Follow established patterns for common components (e.g., combobox, tabs)

## Testing Approach

### Unit Testing

- Test component initialization
- Test state transitions
- Test event handling
- Test accessibility features

### Integration Testing

- Test component interactions
- Test keyboard navigation
- Test screen reader compatibility

### Example Test Structure

```javascript
// select-root.test.js
import { SelectRoot } from "./select-root.js";

// Test initialization
const element = new SelectRoot();
console.assert(element instanceof HTMLElement, "Element should be an HTMLElement");

// Test attribute reflection
element.setAttribute("open", "");
console.assert(element.hasAttribute("open"), "open attribute should be set");

// Test state management
element.open();
console.assert(element.isOpen === true, "isOpen should be true after open()");

// Test event dispatching
let eventFired = false;
element.addEventListener("change", () => { eventFired = true; });
element.value = "new-value";
console.assert(eventFired, "change event should fire when value changes");
```

## Related Documentation

- [Custom Elements Overview and Philosophy](1-custom-elements-overview.md) - For high-level concepts
- [Custom Elements Implementation Guide](2-custom-elements-implementation.md) - For practical implementation details 