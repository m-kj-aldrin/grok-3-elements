/**
 * @typedef {['value', 'disabled', 'readonly', 'required', 'type', 'name', 'form']} InputRootObservedAttributes
 */

/**
 * @typedef {['placeholder', 'maxlength', 'minlength', 'pattern']} InputTextObservedAttributes
 */

/**
 * @typedef {['min', 'max', 'step']} InputSliderObservedAttributes
 */

/**
 * @typedef {Object} InputInternalChangeEvent
 * @property {string} value - The new value of the input
 */

/**
 * @typedef {Object} InputInternalFocusEvent
 * @property {HTMLElement} target - The element that received focus
 */

/**
 * @typedef {Object} InputInternalBlurEvent
 * @property {HTMLElement} target - The element that lost focus
 */

/**
 * @typedef {Object} InputInternalEvent
 * @property {string} type - The type of the event
 * @property {HTMLElement} target - The element that triggered the event
 */

export { }; 