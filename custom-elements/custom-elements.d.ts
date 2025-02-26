import {
  CustomSelect,
  CustomOption,
  CustomTrigger,
  CustomGroup,
} from "./Select/custom-select";

import {
  InputRoot,
  InputText,
  InputSlider,
  InputSliderTrack,
  InputSliderThumb,
} from "./Input/index.js";

declare global {
  interface HTMLElementTagNameMap {
    "custom-select": CustomSelect;
    "custom-option": CustomOption;
    "custom-trigger": CustomTrigger;
    "custom-group": CustomGroup;
    "input-root": InputRoot;
    "input-text": InputText;
    "input-slider": InputSlider;
    "input-slider-track": InputSliderTrack;
    "input-slider-thumb": InputSliderThumb;
  }
}
