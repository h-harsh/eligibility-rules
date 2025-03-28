
import type { Rule, RuleType, RuleValue, Operator, Option } from '../../types/eligibilityRules.types';

interface RuleItemProps {
  /** The rule data */
  rule: Rule;
  /** Index of the rule in the rules array */
  index: number;
  /** Total number of rules */
  totalRules: number;
  /** Rule type options */
  ruleTypeOptions: Option[];
  /** Operator options */
  operatorOptions: Option[];
  /** Available operators for the current rule type */
  availableOperators: Option[];
  /** Options for the value selection */
  valueOptions: Option[];
  /** Handler for rule type changes */
  onTypeChange: (ruleId: string, newType: RuleType) => void;
  /** Handler for operator changes */
  onOperatorChange: (ruleId: string, newOperator: Operator) => void;
  /** Handler for value changes */
  onValueChange: (ruleId: string, newValue: RuleValue) => void;
  /** Handler for rule deletion */
  onDelete: (ruleId: string) => void;
  /** Disabled state */
  disabled?: boolean;
}

export default RuleItemProps;