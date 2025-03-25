import type {
  Rule,
  RuleType,
  Operator,
  ValidationResult,
  RuleValue,
  Option,
  RuleTypeConfig,
  OperatorLabelsConfig
} from '../types/eligibilityRules.types';

import { 
  RULE_PRIORITY, 
  AVAILABLE_OPERATORS, 
  MUTUALLY_EXCLUSIVE_GROUPS,
  INCLUSION_OPERATORS,
  EXCLUSION_OPERATORS,
  DEFAULT_VALUES,
  MOCK_COLLECTIONS,
  MOCK_PRODUCTS,
  MOCK_TAGS,
  MOCK_DISCOUNT_CODES,
  RULE_TYPES
} from '../data/eligibilityRules.data';

/**
 * Generate a unique ID for new rules
 * @returns {string} - Unique rule ID
 */
export const generateId = (): string => `rule_${Math.floor(Math.random() * 10000)}`;

/**
 * Orders rules by their business priority
 * @param {Rule[]} rules - Array of rule objects
 * @returns {Rule[]} - Sorted array of rule objects
 */
export const sortRulesByPriority = (rules: Rule[]): Rule[] => {
  return [...rules].sort((a, b) => RULE_PRIORITY[a.type] - RULE_PRIORITY[b.type]);
};

/**
 * Check if an operator is an inclusion operator
 * @param {Operator} operator - Operator to check
 * @returns {boolean} - True if it's an inclusion operator
 */
export const isInclusionOperator = (operator: Operator): boolean => {
  return INCLUSION_OPERATORS.includes(operator);
};

/**
 * Check if an operator is an exclusion operator
 * @param {Operator} operator - Operator to check
 * @returns {boolean} - True if it's an exclusion operator
 */
export const isExclusionOperator = (operator: Operator): boolean => {
  return EXCLUSION_OPERATORS.includes(operator);
};

/**
 * Finds group of rules that can't be used together
 * @param {RuleType} ruleType - Rule type to check
 * @returns {RuleType[] | null} - Group containing the rule type, or null if not in a group
 */
export const findMutuallyExclusiveGroup = (ruleType: RuleType): RuleType[] | null => {
  return MUTUALLY_EXCLUSIVE_GROUPS.find(group => group.includes(ruleType)) || null;
};

/**
 * Checks if a group already has an inclusion rule
 * @param {Rule[]} rules - Current rules array
 * @param {RuleType[]} group - Mutually exclusive group to check
 * @param {string | null} currentRuleId - ID of the current rule (to exclude from checks)
 * @returns {boolean} - True if there's already an inclusion rule in the group
 */
export const hasInclusionRuleInGroup = (
  rules: Rule[], 
  group: RuleType[], 
  currentRuleId: string | null = null
): boolean => {
  return rules.some(rule => 
    rule.id !== currentRuleId && // Skip current rule
    group.includes(rule.type) && 
    isInclusionOperator(rule.operator)
  );
};

/**
 * Get available operators for a rule based on mutual exclusivity rules
 * @param {Rule[]} rules - Current rules array
 * @param {RuleType} ruleType - Rule type to get operators for
 * @param {string | null} currentRuleId - ID of the current rule (to exclude from checks)
 * @returns {Operator[]} - Array of available operators
 */
export const getAvailableOperators = (
  rules: Rule[], 
  ruleType: RuleType, 
  currentRuleId: string | null = null
): Operator[] => {
  // Get base operators for this rule type
  const baseOperators = AVAILABLE_OPERATORS[ruleType] || [];
  
  // Find if this rule type belongs to a mutually exclusive group
  const exclusiveGroup = findMutuallyExclusiveGroup(ruleType);
  if (!exclusiveGroup) {
    return baseOperators;
  }

  // Find all rules in the same mutually exclusive group
  const groupRules = rules.filter(rule => 
    exclusiveGroup.includes(rule.type) && 
    rule.id !== currentRuleId
  );

  // If there are any rules in the same group, lock to current operator
  if (groupRules.length > 0) {
    const currentRule = rules.find(r => r.id === currentRuleId);
    if (currentRule) {
      return [currentRule.operator];
    }
  }

  return baseOperators;
};

/**
 * Create a new rule with the specified type
 * @param {RuleType} type - Rule type
 * @param {Rule[]} rules - Existing rules (to check constraints)
 * @returns {Rule} - New rule object
 */
export const createRule = (type: RuleType, rules: Rule[] = []): Rule => {
  // Get available operators for this rule type
  const operators = getAvailableOperators(rules, type);
  
  // Create new rule with first available operator
  return {
    id: generateId(),
    type: type,
    operator: operators[0],
    value: DEFAULT_VALUES[type]
  };
};

/**
 * When a rule type changes, ensure it's placed at the correct priority position
 * and its operator is valid
 * @param {Rule[]} rules - Current rules array
 * @param {string} ruleId - ID of the rule being changed
 * @param {RuleType} newType - New rule type
 * @returns {Rule[]} - Updated and reordered rules array
 */
export const handleRuleTypeChange = (
  rules: Rule[], 
  ruleId: string, 
  newType: RuleType
): Rule[] => {
  // First get a copy of rules without the changed rule
  const otherRules = rules.filter(rule => rule.id !== ruleId);
  
  // Get available operators for the new type
  const operators = getAvailableOperators(otherRules, newType);
  
  // Create updated rule with new type and default operator/value
  const updatedRule: Rule = {
    id: ruleId,
    type: newType,
    operator: operators[0],
    value: DEFAULT_VALUES[newType]
  };
  
  // Add the updated rule and sort by priority
  return sortRulesByPriority([...otherRules, updatedRule]);
};

/**
 * Validate the entire ruleset for conflicts
 * @param {Rule[]} rules - Rules to validate
 * @returns {ValidationResult} - Validation result with errors array
 */
export const validateRules = (rules: Rule[]): ValidationResult => {
  const errors: string[] = [];
  
  // Check each mutually exclusive group
  MUTUALLY_EXCLUSIVE_GROUPS.forEach(group => {
    // Find all rules in this group that use inclusion operators
    const inclusionRules = rules.filter(rule => 
      group.includes(rule.type) && 
      isInclusionOperator(rule.operator)
    );
    
    // If more than one rule uses inclusion operators, that's a conflict
    if (inclusionRules.length > 1) {
      const ruleTypes = inclusionRules.map(r => {
        const config = RULE_TYPES.find((rt: RuleTypeConfig) => rt.value === r.type);
        return config ? config.label.toLowerCase() : r.type;
      });
      errors.push(
        `You cannot include by both ${ruleTypes.join(' and ')}. ` +
        `Choose one way to include items, and use exclusion operators (is not) for the other.`
      );
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats rule value for display
 * @param {RuleType} type - Rule type 
 * @param {RuleValue} value - Rule value
 * @param {Option[]} options - Available options for this rule type
 * @returns {string} - Readable representation of the value
 */
export const getReadableValue = (type: RuleType, value: RuleValue, options: Option[] = []): string => {
  if (!value) return 'None';
  
  if (type === 'cart_value_range') {
    if (Array.isArray(value)) {
      return `${value[0]} - ${value[1]}`;
    }
    return `${value}`;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None selected';
    
    // Find corresponding display names for IDs
    const names = value.map(id => {
      const option = options.find(opt => opt.id === id);
      return option ? option.name : id;
    });
    
    return names.join(', ');
  }
  
  return String(value);
};

/**
 * Conversion utilities for eligibility rules
 */

export const ruleTypeConfigToOption = (config: RuleTypeConfig): Option => ({
  id: config.value,
  name: config.label
});

export const operatorToOption = (operator: Operator, labels: OperatorLabelsConfig): Option => ({
  id: operator,
  name: labels[operator]
});

/**
 * Get options for a specific rule type
 * @param {RuleType} ruleType - Rule type to get options for
 * @returns {Option[]} - Array of options for the rule type
 */
export const getOptionsForRuleType = (ruleType: RuleType): Option[] => {
  switch (ruleType) {
    case 'specific_collections':
      return MOCK_COLLECTIONS;
    case 'specific_products':
      return MOCK_PRODUCTS;
    case 'product_tags':
      return MOCK_TAGS;
    case 'specific_discount_codes':
      return MOCK_DISCOUNT_CODES;
    default:
      return [];
  }
}; 