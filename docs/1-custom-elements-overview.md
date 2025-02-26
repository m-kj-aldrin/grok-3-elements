# Custom Elements Overview and Philosophy

## Introduction

This document provides a high-level overview of our custom elements approach, explaining the core philosophy, benefits, and patterns that guide our implementation.

## Core Philosophy

Our custom elements implementation is centered on:
- Progressive enhancement: Elements work with basic functionality without JavaScript and enhance when available.
- Light DOM Only: Components use the light DOM for full style inheritance.
- Explicit boundaries: Each component has clear responsibilities, enhancing existing HTML rather than recreating it.
- Simplicity and compatibility: A straightforward approach that works with any framework or vanilla JavaScript.
- Attribute-driven design: Elements use attributes as the primary mechanism for state management.
- Custom implementation over native wrapping: When working with form inputs, we build custom elements from scratch rather than wrapping native elements.
- Markup-first approach: We prioritize authoring elements with HTML markup, rather than focusing on programmatic API interactions.

For practical implementation details, including state management and event handling, please refer to the Custom Elements Implementation Guide and Coding Standards documents.

## Implementation Priorities

When building custom elements, we follow these priorities:

1. Focus on internal logic and attribute-driven state management first
2. Create a working component that users can effectively author with markup
3. Only after establishing a solid foundation, develop a public API for programmatic interaction
4. Ensure proper typing of attributes and their values for better developer experience

## Benefits and Trade-offs

### Benefits
- Simple design and usage
- High performance with minimal overhead
- Cross-framework compatibility and ease of customization
- Maintainability through clear separation of concerns
- Built-in accessibility from the start

### Trade-offs
- More explicit HTML markup is required
- Some repetitive patterns are necessary for clarity
- Requires modern browsers or appropriate polyfills

## Example Use Case

Below is an example of how our custom elements can be used:

```html
<select-root>
  <select-trigger>Select an option</select-trigger>
  <select-listbox>
    <select-option value="1">Option 1</select-option>
    <select-option value="2">Option 2</select-option>
    <select-option value="3">Option 3</select-option>
  </select-listbox>
</select-root>
```

## Cross-References
- For repository structure, component architecture, and workflow details, see [Custom Elements Implementation Guide](2-custom-elements-implementation.md).
- For naming conventions, code organization, and accessibility standards, see [Custom Elements Coding Standards](3-custom-elements-coding-standards.md). 