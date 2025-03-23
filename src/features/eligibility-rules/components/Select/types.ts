import type { Option } from '../../types/eligibilityRules.types';

export interface SelectProps {
  /** The options to display in the select */
  options: Option[];
  /** The currently selected value */
  value: string;
  /** Handler for when the selection changes */
  onChange: (value: string) => void;
  /** Additional CSS class names */
  className?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Placeholder text when no option is selected */
  placeholder?: string;
  /** Optional label for the input */
  label?: string;
}
