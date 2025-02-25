import {
  CustomSelect,
  CustomOption,
  CustomTrigger,
  CustomGroup,
} from "./Select/custom-select";

declare global {
  interface HTMLElementTagNameMap {
    "custom-select": CustomSelect;
    "custom-option": CustomOption;
    "custom-trigger": CustomTrigger;
    "custom-group": CustomGroup;
  }
}
