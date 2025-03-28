// Rule Types
export type RuleType = 
  | 'specific_collections'
  | 'product_tags'
  | 'specific_products'
  | 'product_subscribed'
  | 'specific_discount_codes'
  | 'cart_value_range';

// Operator Types
export type Operator = 
  | 'contains_any'
  | 'is_not'
  | 'equals_anything'
  | 'yes'
  | 'no'
  | 'is_equal_or_greater'
  | 'is_between'
  | 'is_less_than';

// Rule Value Types
export type RuleValue = string[] | number | [number, number] | null;

// Core rule types and configurations
export interface Rule {
  id: string;
  type: RuleType;
  operator: Operator;
  value: RuleValue;
}

// Option interface for dropdowns (collections, products, etc.)
export interface Option {
  id: string;
  name: string;
  disabled?: boolean;
}

// Validation result structure
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Rule Type Configuration Interface
export interface RuleTypeConfig {
  value: RuleType;
  label: string;
}

// Rule Priority Configuration
export type RulePriorityConfig = Record<RuleType, number>;

// Operator Labels Configuration
export type OperatorLabelsConfig = Record<Operator, string>;

// Available Operators Configuration
export type AvailableOperatorsConfig = Record<RuleType, Operator[]>;

// Default Values Configuration
export type DefaultValuesConfig = Record<RuleType, RuleValue>;
