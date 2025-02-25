import { wait } from "../../dom-utility/timing.js";
import { getSiblingOfSameTag } from "../../dom-utility/traversal.js";

/**
 * @typedef {["open"]} ObservedAttributes
 */

const CUSTOM_OPTION_SELECTOR = "custom-option:not([disabled])";

/**
 * Custom select component implementing accessible dropdown functionality
 */
class CustomSelect extends HTMLElement {
  #selectedItem = null;
  #focusedItem = null;

  /**@type {ObservedAttributes} */
  static get observedAttributes() {
    return ["open"];
  }

  connectedCallback() {
    this.addEventListener("click", this.#onClick);
    this.addEventListener("keydown", this.#onKeydown);
    this.addEventListener("focusout", this.#onFocusout);
    this.addEventListener("focusin", this.#handleFocusIn);

    this.#setupAccessibility();
    this.#initializeSelected();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
    this.removeEventListener("keydown", this.#onKeydown);
    this.removeEventListener("focusout", this.#onFocusout);
    this.removeEventListener("focusin", this.#handleFocusIn);
  }

  /**
   * @param {ObservedAttributes[number]} name
   */
  attributeChangedCallback(name) {
    if (name === "open") {
      this.#updateUI();
    }
  }
  
  _bla() {
    return 1;
  }

  #handleFocusIn(event) {
    if (event.target.closest(CUSTOM_OPTION_SELECTOR)) {
      this.#focusedItem = event.target.closest(CUSTOM_OPTION_SELECTOR);
    }
  }

  open() {
    this.toggleAttribute("open", true);
  }

  close() {
    this.toggleAttribute("open", false);
  }

  toggle() {
    this.toggleAttribute("open");
  }

  get selectedValue() {
    return this.#selectedItem?.getAttribute("value") ?? null;
  }

  set selectedValue(value) {
    const item = this.querySelector(
      `${CUSTOM_OPTION_SELECTOR}[value="${value}"]`
    );
    if (item) {
      this.#setSelected(item);
    }
  }

  #setupAccessibility() {
    this.setAttribute("role", "combobox");
    this.setAttribute("aria-expanded", "false");
  }

  #initializeSelected() {
    const selected = this.querySelector(`${CUSTOM_OPTION_SELECTOR}[selected]`);
    if (selected) {
      this.#selectedItem = selected;
      this.#updateTrigger();
    }
  }

  #onClick(event) {
    const target = event.target;
    const trigger = target.closest("custom-trigger");
    const option = target.closest(CUSTOM_OPTION_SELECTOR);

    if (trigger) {
      this.toggle();
      return;
    }

    if (option && this.contains(option) && !option.hasAttribute("selected")) {
      this.#setSelected(option);
      this.close();
    }
  }

  #onFocusout(event) {
    if (!this.hasAttribute("open")) return;

    wait().then(() => {
      if (!this.contains(document.activeElement)) {
        this.close();
      }
    });
  }

  #onKeydown(event) {
    if (this.hasAttribute("open")) {
      this.#handleOpenKeydown(event);
    } else {
      this.#handleClosedKeydown(event);
    }
  }

  #handleClosedKeydown(event) {
    const trigger = event.target.closest("custom-trigger");

    if (trigger) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.open();
        return;
      } else if (event.key === "Escape") {
        event.preventDefault();
        trigger.blur();
        return;
      }
    }

    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      this.#handleArrowNavigation(event);
    }
  }

  #handleOpenKeydown(event) {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        this.#handleArrowNavigation(event);
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        if (this.#focusedItem && !this.#focusedItem.hasAttribute("disabled")) {
          this.#setSelected(this.#focusedItem);
          this.close();
        }
        this.#focusTrigger();
        break;

      case "Escape":
      case "Tab":
        event.preventDefault();
        this.close();
        this.#focusTrigger();
        break;
    }
  }

  #handleArrowNavigation(event) {
    event.preventDefault();
    const currentElement = this.#getCurrentNavigationElement();
    if (!currentElement) return;

    const direction = event.key === "ArrowDown" ? 1 : -1;
    const sibling = getSiblingOfSameTag(
      currentElement,
      direction,
      ":not([disabled])"
    );

    if (!sibling) return;

    if (this.hasAttribute("open")) {
      this.#focusItem(sibling);
    } else {
      this.#setSelected(sibling);
    }
  }

  #getCurrentNavigationElement() {
    return this.hasAttribute("open")
      ? this.#focusedItem ||
          this.#selectedItem ||
          this.querySelector(CUSTOM_OPTION_SELECTOR)
      : this.#selectedItem || this.querySelector(CUSTOM_OPTION_SELECTOR);
  }

  #focusTrigger() {
    this.querySelector("custom-trigger")?.focus();
  }

  #updateUI() {
    const isOpen = this.hasAttribute("open");
    this.setAttribute("aria-expanded", isOpen.toString());

    if (isOpen) {
      const itemToFocus =
        this.#selectedItem || this.querySelector(CUSTOM_OPTION_SELECTOR);
      this.#focusItem(itemToFocus);
    }
  }

  #setSelected(item) {
    if (this.#selectedItem) {
      this.#selectedItem.removeAttribute("selected");
      this.#selectedItem.removeAttribute("aria-selected");
    }

    let currentItem = this.#selectedItem;
    this.#selectedItem = item;
    if (item && !item.hasAttribute("disabled") && item !== currentItem) {
      item.setAttribute("selected", "");
      item.setAttribute("aria-selected", "true");

      this.#updateTrigger();
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          detail: { value: this.selectedValue },
        })
      );
    }
  }

  #updateTrigger() {
    const trigger = this.querySelector("custom-trigger");
    if (trigger && this.#selectedItem) {
      trigger.textContent = this.#selectedItem.textContent;
      trigger.setAttribute(
        "aria-label",
        `Selected: ${this.#selectedItem.textContent}`
      );
    }
  }

  #focusItem(item) {
    if (!item) return;
    if (item.hasAttribute("disabled")) return;

    item.scrollIntoView({ block: "nearest", behavior: "smooth" });
    item.focus();
  }
}

/**
 * Represents an option in the custom select
 */
class CustomOption extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("value")) {
      this.setAttribute("value", this.textContent.trim());
    }

    this.setAttribute("role", "option");
    this.setAttribute("tabindex", "-1");
  }
}

/**
 * Represents the trigger button for the custom select
 */
class CustomTrigger extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "button");
    this.setAttribute("tabindex", "0");
    this.setAttribute("aria-haspopup", "listbox");
  }
}

/**
 * Represents the option group container
 */
class CustomGroup extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "listbox");
  }
}

/**
 * Represents an icon container for the custom select
 * This element is always visible regardless of selection state
 */
class CustomIcon extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "presentation");
    this.setAttribute("tabindex", "-1");
    this.setAttribute("aria-hidden", "true");
  }
}

// Register custom elements
customElements.define("custom-select", CustomSelect);
customElements.define("custom-option", CustomOption);
customElements.define("custom-trigger", CustomTrigger);
customElements.define("custom-group", CustomGroup);
customElements.define("custom-icon", CustomIcon);

export { CustomSelect, CustomOption, CustomTrigger, CustomGroup, CustomIcon };
