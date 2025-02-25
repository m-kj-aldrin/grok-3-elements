
/**
 * Utility function that finds the next/previous sibling of the same tag name, with optional looping.
 * @param {HTMLElement} element - The reference element.
 * @param {number} direction - Positive for next sibling, negative for previous.
 * @param {string} [test=""] - Optional CSS selector test.
 * @returns {HTMLElement | null}
 */
export function getSiblingOfSameTag(element, direction, test = "") {
  const parent = element.parentElement;
  if (!parent) return null;

  /** @type {HTMLElement} */
  let sibling = element;

  // Try to find a matching sibling, looping through all siblings if necessary
  do {
    // Get next/previous sibling or loop around
    const candidate =
      direction > 0
        ? sibling.nextElementSibling || parent.firstElementChild
        : sibling.previousElementSibling || parent.lastElementChild;

    // Safety check for valid HTML element
    if (!(candidate instanceof HTMLElement)) return null;

    sibling = candidate;

    // Stop searching if we've looped back to the starting element
    if (sibling === element) return null;

    // Return if the sibling matches our criteria
    if (
      sibling.tagName === element.tagName &&
      (!test || sibling.matches(test))
    ) {
      return sibling;
    }
  } while (true);
}