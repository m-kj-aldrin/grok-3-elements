import {
  CustomSelect,
  CustomOption,
  CustomTrigger,
  CustomGroup,
} from "./custom-select";

declare global {
  interface HTMLElementTagNameMap {
    "custom-select": CustomSelect;
    "custom-option": CustomOption;
    "custom-trigger": CustomTrigger;
    "custom-group": CustomGroup;
  }
}
