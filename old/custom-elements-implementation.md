# Custom Elements Implementation Approach

## Core Philosophy

Our custom elements implementation follows these fundamental principles:

- **Light DOM Only**: Custom elements will never use Shadow DOM, ensuring full style inheritance and straightforward DOM manipulation.
- **State and Event Management**: Custom elements primarily focus on managing state and reacting to events, not generating DOM structures. They enhance existing HTML rather than replacing it.
- **Minimal DOM Manipulation**: Custom elements should rarely create and attach new elements to the DOM. The HTML structure should be authored in markup by developers using the components.
- **Behavior Enhancement**: Components add behavior to existing DOM structures, focusing on interaction patterns, accessibility, and state management.
- **Progressive Enhancement**: Elements should work with basic functionality without JavaScript and enhance when JavaScript is available.
- **Explicit Boundaries**: Each component has clear responsibilities with minimal overlap or assumptions about parent/child relationships.

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

#### Component Implementation Files

Each component file should:

- Have a clear, consistent structure
- Include thorough JSDoc comments
- Follow the defined coding standards

#### Test Files

Simple test files that verify basic functionality:

```javascript
// select-trigger.test.js
import { SelectTrigger } from "./select-trigger.js";

// Basic functionality test
const element = new SelectTrigger();
console.assert(
  element instanceof HTMLElement,
  "Element should be an HTMLElement"
);

// State management test
element.setAttribute("some-attr", "value");
console.assert(
  element.someProperty === "expectedValue",
  "Attribute should reflect to property"
);

// Additional simple tests...
```

#### README.md

Documentation for the component family:

````markdown
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
````

### SelectTrigger

A subcomponent that...

[Additional documentation...]

```

## Best Practices

1. **Component Import/Export**
   - Always export components as named exports
   - Create index files for convenient importing

2. **CSS Management**
   - Keep CSS focused on specific components
   - Use the index.css file for bundling related styles
   - Utilize CSS custom properties for theming

3. **Type Definitions**
   - Keep types in the dedicated types.js file
   - Use JSDoc for typing to avoid TypeScript dependency
   - Leverage generics where applicable for better type inference

4. **Utilities**
   - Place shared utilities in the dedicated utility directory
   - Create focused utility functions with clear responsibilities
   - Document utilities with JSDoc comments

This structure provides a clean, consistent organization for your custom elements library while maintaining a lightweight approach without complex build tools.
```
