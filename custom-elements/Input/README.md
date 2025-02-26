# Custom Input Components

A modular custom input system implementing form controls using web components.

## Components

### InputRoot

The main component that manages input state and form integration.

```html
<input-root type="text" name="username" required>
  <!-- Interface component goes here -->
</input-root>
```

#### Attributes

- `value`: Current input value
- `disabled`: Whether input is disabled
- `readonly`: Whether input is read-only
- `required`: Whether input is required
- `type`: Input type (text, number, slider, etc.)
- `name`: Form field name
- `form`: ID of associated form

#### Events

- `input`: Fired when the value changes
- `change`: Fired when the value is committed (typically on blur)
- `focus`: Fired when the input receives focus
- `blur`: Fired when the input loses focus

### InputText

Component providing a text input interface.

```html
<input-root type="text" name="username" required>
  <input-text placeholder="Enter your username" maxlength="50"></input-text>
</input-root>
```

#### Additional Attributes

- `placeholder`: Hint text when the input is empty
- `maxlength`: Maximum number of characters
- `minlength`: Minimum number of characters
- `pattern`: Regex pattern for validation

### InputSlider

Component providing a slider input interface.

```html
<input-root type="slider" name="volume" value="50">
  <input-slider min="0" max="100" step="1">
    <input-slider-track></input-slider-track>
    <input-slider-thumb></input-slider-thumb>
  </input-slider>
</input-root>
```

#### Additional Attributes

- `min`: Minimum value
- `max`: Maximum value
- `step`: Step size

### InputSliderTrack

Component providing the track visual for the slider.

### InputSliderThumb

Component providing the draggable thumb for the slider.

## Usage Examples

### Basic Text Input

```html
<input-root type="text" name="username" required>
  <input-text placeholder="Enter your username"></input-text>
</input-root>
```

### Number Input

```html
<input-root type="number" name="quantity" value="1">
  <input-text placeholder="Quantity" maxlength="3"></input-text>
</input-root>
```

### Slider Input

```html
<input-root type="slider" name="volume" value="50">
  <input-slider min="0" max="100" step="1">
    <input-slider-track></input-slider-track>
    <input-slider-thumb></input-slider-thumb>
  </input-slider>
</input-root>
```

## Accessibility

- Proper ARIA roles (textbox, slider, etc.)
- Keyboard navigation support
- Focus management between components
- Appropriate labeling through aria-label or associated labels

## Browser Support

These components use standard web component APIs and should work in all modern browsers that support Custom Elements v1. 