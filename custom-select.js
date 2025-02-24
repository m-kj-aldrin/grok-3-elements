/**
 * Gets the sibling of the same tag name, looping around if needed.
 * @param {HTMLElement} element - The reference element.
 * @param {number} direction - Positive for next sibling, negative for previous.
 * @param {string} [test=""] - Optional CSS selector test.
 * @returns {HTMLElement | null}
 */
function getSiblingOfSameTag(element, direction, test = "") {
  const parent = element.parentElement;
  if (!parent) return null; // Can't loop without a parent.

  /** @type {HTMLElement} */
  let sibling = element;

  while (true) {
    /** @type {Element | null} */
    let candidate =
      direction > 0
        ? sibling.nextElementSibling
        : sibling.previousElementSibling;

    // Wrap around if no candidate exists.
    if (!candidate) {
      candidate =
        direction > 0 ? parent.firstElementChild : parent.lastElementChild;
    }

    if (!(candidate instanceof HTMLElement)) return null;

    sibling = candidate;

    // If we've looped back to the starting element, no valid sibling exists.
    if (sibling === element) return null;

    // Return if the sibling has the same tag name and passes the test (if provided).
    if (
      sibling.tagName === element.tagName &&
      (!test || sibling.matches(test))
    ) {
      return sibling;
    }
  }
}

class CustomSelect extends HTMLElement {
  #isOpen = false;
  #selectedItem = null;
  #focusedItem = null;

  static get observedAttributes() {
    return ["open"];
  }

  connectedCallback() {
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
    this.#initializeSelected();
    this.#setupTrigger();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "open") {
      this.#isOpen = newValue !== null;
      this.#updateDisplay();
      if (this.#isOpen && this.#selectedItem) {
        this.#focusItem(this.#selectedItem);
      } else if (!this.#isOpen) {
        this.#clearFocus();
      }
      this.#updateTabIndex();
    }
  }

  // Public methods
  open() {
    this.setAttribute("open", "");
  }

  close() {
    this.removeAttribute("open");
  }

  toggle() {
    this.#isOpen ? this.close() : this.open();
  }

  get selectedValue() {
    return this.#selectedItem?.getAttribute("value") ?? null;
  }

  set selectedValue(value) {
    const item = this.querySelector(
      `custom-option[value="${value}"]:not([disabled])`
    );
    if (item) {
      this.#setSelected(item);
    }
  }

  // Private methods
  #handleClick = (event) => {
    const target = event.target;
    if (target.closest("custom-trigger")) {
      this.toggle();
      return;
    }
    const option = target.closest("custom-option:not([disabled])");
    if (option && this.contains(option) && !option.hasAttribute("selected")) {
      this.#setSelected(option);
      this.close();
    }
  };

  #handleKeydown = (event) => {
    const target = event.target;
    const trigger = target.closest("custom-trigger");

    if (
      trigger &&
      !this.#isOpen &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      this.open();
      return;
    }

    const allOptions = [
      ...this.querySelectorAll("custom-option:not([disabled],[selected])"),
    ];
    if (allOptions.length === 0) return;

    if (!this.#isOpen) {
      const currentElement = this.#selectedItem || allOptions[0]; // Fallback to first option if none selected
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          const next = getSiblingOfSameTag(
            currentElement,
            1,
            ":not([disabled],[selected])"
          );
          if (next) this.#setSelected(next);
          break;
        case "ArrowUp":
          event.preventDefault();
          const prev = getSiblingOfSameTag(
            currentElement,
            -1,
            ":not([disabled],[selected])"
          );
          if (prev) this.#setSelected(prev);
          break;
      }
      return;
    }

    // Open state: both Tab/Shift+Tab and ArrowUp/ArrowDown cycle
    const currentElement =
      this.#focusedItem || this.#selectedItem || allOptions[0];
    switch (event.key) {
      case "ArrowDown":
      case "Tab":
        if (event.key === "Tab" && event.shiftKey) {
          event.preventDefault();
          const prev = getSiblingOfSameTag(
            currentElement,
            -1,
            ":not([disabled],[selected])"
          );
          this.#focusItem(prev);
        } else {
          event.preventDefault();
          const next = getSiblingOfSameTag(
            currentElement,
            1,
            ":not([disabled],[selected])"
          );
          this.#focusItem(next);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        const prev = getSiblingOfSameTag(
          currentElement,
          -1,
          ":not([disabled],[selected])"
        );
        this.#focusItem(prev);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (
          this.#focusedItem &&
          !this.#focusedItem.hasAttribute("disabled") &&
          !this.#focusedItem.hasAttribute("selected")
        ) {
          this.#setSelected(this.#focusedItem);
          this.close();
        }
        this.querySelector("custom-trigger")?.focus();
        break;
      case "Escape":
        event.preventDefault();
        this.close();
        this.querySelector("custom-trigger")?.focus();
        break;
    }
  };

  #setupTrigger() {
    const trigger = this.querySelector("custom-trigger");
    if (trigger) {
      trigger.setAttribute("role", "button");
      trigger.setAttribute("tabindex", "0");
    }
  }

  #initializeSelected() {
    const selected = this.querySelector(
      "custom-option[selected]:not([disabled])"
    );
    if (selected) {
      this.#selectedItem = selected;
      this.#updateTrigger();
    }
  }

  #setSelected(item) {
    if (this.#selectedItem) {
      this.#selectedItem.removeAttribute("selected");
      this.#selectedItem.removeAttribute("aria-selected");
    }

    this.#selectedItem = item;
    if (item && !item.hasAttribute("disabled")) {
      item.setAttribute("selected", "");
      item.setAttribute("aria-selected", "true");
      this.dispatchEvent(
        new CustomEvent("change", {
          bubbles: true,
          detail: {
            value: this.selectedValue,
          },
        })
      );
    }
    this.#updateTrigger();
  }

  #updateTrigger() {
    const trigger = this.querySelector("custom-trigger");
    if (trigger && this.#selectedItem) {
      trigger.textContent = this.#selectedItem.textContent;
    }
  }

  #updateDisplay() {
    const group = this.querySelector("custom-group");
    if (group) {
      if (this.#isOpen) {
        group.setAttribute("open", "");
      } else {
        group.removeAttribute("open");
      }
    }
  }

  #focusItem(item) {
    if (!item) return; // No valid item to focus
    if (this.#focusedItem) {
      this.#focusedItem.classList.remove("focused");
    }
    this.#focusedItem = item;
    if (item && !item.hasAttribute("disabled")) {
      item.classList.add("focused");
      item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      item.focus();
    }
  }

  #clearFocus() {
    if (this.#focusedItem) {
      this.#focusedItem.classList.remove("focused");
      this.#focusedItem = null;
    }
  }

  #updateTabIndex() {
    const options = this.querySelectorAll("custom-option");
    options.forEach((option) => {
      option.setAttribute("tabindex", this.#isOpen ? "0" : "-1");
    });
  }
}

class CustomOption extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute("value")) {
      this.setAttribute("value", this.textContent.trim());
    }
    this.setAttribute("role", "option");
    this.setAttribute("tabindex", "-1");
  }
}

class CustomTrigger extends HTMLElement {}

class CustomGroup extends HTMLElement {}

customElements.define("custom-select", CustomSelect);
customElements.define("custom-option", CustomOption);
customElements.define("custom-trigger", CustomTrigger);
customElements.define("custom-group", CustomGroup);
