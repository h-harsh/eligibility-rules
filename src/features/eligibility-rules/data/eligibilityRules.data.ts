import type {
  RuleTypeConfig,
  RulePriorityConfig,
  OperatorLabelsConfig,
  AvailableOperatorsConfig,
  DefaultValuesConfig,
  Option,
  Rule,
  RuleType,
  Operator
} from '../types/eligibilityRules.types';

// Collections
export const MOCK_COLLECTIONS: Option[] = [
  { id: 'summer2024', name: 'Summer 2024' },
  { id: 'winter2024', name: 'Winter 2024' },
  { id: 'bestsellers', name: 'Bestsellers' },
  { id: 'new-arrivals', name: 'New Arrivals' },
  { id: 'clearance', name: 'Clearance Items' },
  { id: 'automated-collection', name: 'Automated Collection' }
];

// Products
export const MOCK_PRODUCTS: Option[] = [
  { id: 'tshirt1', name: 'Cotton T-Shirt' },
  { id: 'jeans1', name: 'Slim Fit Jeans' },
  { id: 'hoodie1', name: 'Zip-up Hoodie' },
  { id: 'sneakers1', name: 'Classic Sneakers' }
];

// Tags
export const MOCK_TAGS: Option[] = [
  { id: 'new', name: 'New Arrival' },
  { id: 'sale', name: 'On Sale' },
  { id: 'trending', name: 'Trending' },
  { id: 'limited', name: 'Limited Edition' }
];

// Discount Codes
export const MOCK_DISCOUNT_CODES: Option[] = [
  { id: 'summer10', name: 'SUMMER10' },
  { id: 'welcome20', name: 'WELCOME20' },
  { id: 'flash50', name: 'FLASH50' }
];

// Rule configurations
export const RULE_TYPES: RuleTypeConfig[] = [
  { value: 'specific_collections', label: 'Specific collections' },
  { value: 'product_tags', label: 'Product tags' },
  { value: 'specific_products', label: 'Specific products' },
  { value: 'product_subscribed', label: 'Product subscribed' },
  { value: 'specific_discount_codes', label: 'Specific discount codes' },
  { value: 'cart_value_range', label: 'Cart value range' }
];

// Priority order for rules (used for sorting)
export const RULE_PRIORITY: RulePriorityConfig = {
  specific_collections: 1,
  product_tags: 2,
  specific_products: 3,
  product_subscribed: 4,
  specific_discount_codes: 5,
  cart_value_range: 6
};

// Operator labels for display
export const OPERATOR_LABELS: OperatorLabelsConfig = {
  contains_any: 'contains any',
  is_not: 'is not',
  equals_anything: 'equals anything',
  yes: 'yes',
  no: 'no',
  is_equal_or_greater: 'is equal or greater than',
  is_between: 'is between',
  is_less_than: 'is less than'
};

// Available operators for each rule type
export const AVAILABLE_OPERATORS: AvailableOperatorsConfig = {
  specific_collections: ['contains_any', 'is_not'],
  product_tags: ['contains_any', 'is_not'],
  specific_products: ['contains_any', 'is_not'],
  product_subscribed: ['yes', 'no'],
  specific_discount_codes: ['contains_any'],
  cart_value_range: ['is_equal_or_greater', 'is_between', 'is_less_than']
};

// Define mutually exclusive rule groups
export const MUTUALLY_EXCLUSIVE_GROUPS: RuleType[][] = [
  ['specific_collections', 'specific_products']
];

// Define inclusion operators (all other operators are considered exclusion)
export const INCLUSION_OPERATORS: Operator[] = ['contains_any', 'yes', 'equals_anything'];

// Define exclusion operators
export const EXCLUSION_OPERATORS: Operator[] = ['is_not', 'no'];

// Default values for each rule type
export const DEFAULT_VALUES: DefaultValuesConfig = {
  specific_collections: [],
  product_tags: [],
  specific_products: [],
  product_subscribed: null,
  specific_discount_codes: [],
  cart_value_range: 0
};

// Sample initial rules (for demonstration)
export const INITIAL_RULES: Rule[] = [
  {
    id: 'rule_1',
    type: 'specific_collections',
    operator: 'contains_any',
    value: ['summer2024']
  },
  {
    id: 'rule_2',
    type: 'cart_value_range',
    operator: 'is_equal_or_greater',
    value: 50
  }
];

// Export rule type options in the format needed by the Select component
export const ruleTypeOptions: Option[] = RULE_TYPES.map(type => ({
  id: type.value,
  name: type.label
}));

// Export operator options in the format needed by the Select component
export const operatorOptions: Option[] = Object.entries(OPERATOR_LABELS)
  .map(([operator, label]) => ({
    id: operator,
    name: label
  }));

// Rule type UI behavior configuration
export const RULE_TYPE_BEHAVIOR: Record<RuleType, {
  showOperator: boolean;
  defaultOperator: Operator;
  allowMultipleValues: boolean;
}> = {
  specific_collections: {
    showOperator: true,
    defaultOperator: 'contains_any',
    allowMultipleValues: true
  },
  product_tags: {
    showOperator: true,
    defaultOperator: 'contains_any',
    allowMultipleValues: true
  },
  specific_products: {
    showOperator: true,
    defaultOperator: 'contains_any',
    allowMultipleValues: true
  },
  product_subscribed: {
    showOperator: true,
    defaultOperator: 'yes',
    allowMultipleValues: false
  },
  specific_discount_codes: {
    showOperator: false,
    defaultOperator: 'contains_any',
    allowMultipleValues: true
  },
  cart_value_range: {
    showOperator: true,
    defaultOperator: 'is_equal_or_greater',
    allowMultipleValues: false
  }
}; 