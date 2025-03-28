import type {
  Rule,
  RuleType,
  Operator,
  ValidationResult,
  Option,
  RuleTypeConfig,
  OperatorLabelsConfig
} from '../types/eligibilityRules.types';

import { 
  RULE_PRIORITY, 
  MUTUALLY_EXCLUSIVE_GROUPS,
  INCLUSION_OPERATORS,
  MOCK_COLLECTIONS,
  MOCK_PRODUCTS,
  MOCK_TAGS,
  MOCK_DISCOUNT_CODES,
  RULE_TYPES
} from '../data/eligibilityRules.data';
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