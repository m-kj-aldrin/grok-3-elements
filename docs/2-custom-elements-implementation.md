# Custom Elements Implementation Guide

This document provides practical guidance for implementing custom elements, including repository structure, component architecture, and technical patterns. For detailed discussions on state management and event handling, please refer to the Coding Standards document.

## Repository Structure

### Directory Organization

```
src/
├── custom-elements/
│   └── [CustomElementName]/              # Directory named after the element (e.g., "Select")
│       ├── index.js                      # Re-exports all components in this family
│       ├── index.css                     # Imports all component CSS files
│       ├── types.js                      # Type definitions using JSDoc
│       ├── [customelementname]-root.js   # Root component implementation (e.g., "select-root.js")
│       ├── [customelementname]-root.css  # Styles for root component
│       ├── [customelementname]-[subtype].js    # Subcomponent implementation (e.g., "select-trigger.js")
│       ├── [customelementname]-[subtype].css   # Styles for subcomponent
│       ├── [customelementname]-[subtype].test.js # Simple test file
│       └── README.md                     # Documentation for this component family
└── utility/
    └── [utility-type]/
        ├── index.js                      # Exports utility functions
        └── [specific-utility].js         # Individual utility implementation
```

> **Note**: Every custom element will have a root component file (`[customelementname]-root.js`). The subtypes will vary depending on the specific element being implemented. For example, a Select element might have subtypes like trigger, option, and group, while a Tabs element might have subtypes like tab, panel, and list.

### File Structure Guidelines

#### index.js

The main entry point for a component family that re-exports all related components:

```javascript
export { SelectRoot } from "./select-root.js";
export { SelectTrigger } from "./select-trigger.js";
export { SelectOption } from "./select-option.js";
// Export other related components...
```

#### index.css

Imports all CSS files for the component family:

```css
@import "./select-root.css";
@import "./select-trigger.css";
@import "./select-option.css";
/* Import other related component styles... */
```

#### types.js

Contains JSDoc type definitions for the component family:

```javascript
/**
 * @typedef {Object} SelectOptions
 * @property {string} [option1] - Description of option1
 * @property {number} [option2=defaultValue] - Description of option2 with default
 */

/**
 * @typedef {'open'|'closed'|'disabled'} SelectState
 */

// Additional type definitions...
```

## Component Architecture Pattern

This guide emphasizes a state-driven architecture without repeating details on state management itself. Key points:

1. Define clear component states and transitions (see Coding Standards for detailed patterns).
2. Map state changes to DOM updates and attribute reflection.
3. Use minimal DOM manipulation and leverage custom events for communication.
4. Always create types for valid observed attribute values.
5. For input-related components, build custom implementations rather than wrapping native inputs.
6. Only bind event handlers to elements other than the custom element itself when necessary.

Example structure:

```javascript
/**
 * @typedef {['open', 'disabled']} ObservedAttributes
 */

class CustomComponent extends HTMLElement {
  // Private fields for internal state
  #state = null;
  
  /**
   * @type {ObservedAttributes[number]}
   */
  static get observedAttributes() {
    return ["open", "disabled"];
  }
  
  /**
   * @param {ObservedAttributes[number]} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    // Update internal state and reflect changes
    if (name === "open") {
      this.#updateUI();
    }
  }
  
  // Lifecycle methods
  connectedCallback() {
    // Setup event listeners and initialize state
    this.addEventListener("click", this.#onClick);
  }
  
  disconnectedCallback() {
    // Cleanup event listeners
    this.removeEventListener("click", this.#onClick);
  }
  
  // Public API methods
  publicMethod() {
    // External API - add these after component is working with attributes
  }
  
  // Private methods and event handlers
  #onClick(event) {
    // Event handler logic
  }
  
  #privateMethod() {
    // Internal functionality
  }
}
```

## Development Workflow

When implementing a new custom element, follow this approach:

1. **Define Internal Logic First**
   - Focus on core functionality and attribute-based state management
   - Implement the component to work primarily through HTML markup
   - Defer creating public API methods until the element functions properly with attributes

2. **Implement Attribute-Based State Management**
   - Use attributes as the primary interface for controlling component state
   - Create typed definitions for all observed attributes
   - Reflect internal state changes to attributes for easy styling and testing

3. **Add Event Handling**
   - Only attach event listeners to the custom element itself when possible
   - Only bind handlers to other elements when absolutely necessary
   - Always remove event listeners in disconnectedCallback

4. **Finally, Create Public API**
   - After the component works with attributes, create public methods for programmatic control
   - Ensure methods map to the attribute-based behavior for consistency

For comprehensive details on state, event handling, and DOM manipulation best practices, refer to the [Custom Elements Coding Standards](3-custom-elements-coding-standards.md).

## Workflow for Creating New Components

1. **Define API Requirements**
   - Specify attributes, properties, events, and methods.

2. **Design State Management**
   - Outline possible states and transitions. Cross-reference Coding Standards for best practices.

3. **Implement Core Functionality**
   - Develop event listeners and minimal DOM updates as required by design specifications.

4. **Enhance with Accessibility**
   - Add appropriate ARIA roles and keyboard navigation (see Coding Standards for detailed guidelines).

5. **Test & Refine**
   - Incorporate both unit and integration testing to ensure robust component behavior.

## Styling Philosophy

- Use minimal, focused styling
- Prefer CSS custom properties for theming
- Create clear styling hooks for customization
- Consider responsive behavior from the start

### CSS Organization

- Keep CSS focused on specific components
- Use the index.css file for bundling related styles
- Utilize CSS custom properties for theming

## Related Documentation

- [Custom Elements Overview and Philosophy](1-custom-elements-overview.md) - For high-level concepts
- [Custom Elements Coding Standards](3-custom-elements-coding-standards.md) - For detailed coding conventions 