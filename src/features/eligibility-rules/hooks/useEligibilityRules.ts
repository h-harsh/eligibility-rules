import { useState, useCallback } from 'react';
import type { Rule, RuleType, ValidationResult, Option } from '../types/eligibilityRules.types';
import { 
  validateRules, 
  getOptionsForRuleType,
  operatorToOption,
  findMutuallyExclusiveGroup
} from '../utils/eligibilityRules.utils';
import { OPERATOR_LABELS, AVAILABLE_OPERATORS } from '../data/eligibilityRules.data';

/**
 * Custom hook to manage eligibility rules validation and options.
 * This hook provides validation and option management functionality
 * for eligibility rules.
 */
export const useEligibilityRules = () => {
  // State for validation and success messages
  const [validationResult, setValidationResult] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [] 
  });
  const [successMessage, setSuccessMessage] = useState<string>('');

  /**
   * Validate rules and update validation state
   */
  const validateAndUpdateRules = useCallback((rules: Rule[]) => {
    const result = validateRules(rules);
    setValidationResult(result);
    if (result.isValid) {
      setSuccessMessage('Rules updated successfully!');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  }, []);

  /**
   * Get operator options for a specific rule, considering other rules for mutual exclusivity
   */
  const getOperatorOptions = useCallback((rule: Rule, otherRules: Rule[] = []): Option[] => {
    // Get base operators for this rule type
    const baseOperators = AVAILABLE_OPERATORS[rule.type] || [];
    
    // Find if this rule type belongs to a mutually exclusive group
    const exclusiveGroup = findMutuallyExclusiveGroup(rule.type);
    if (!exclusiveGroup) {
      return baseOperators.map(operator => operatorToOption(operator, OPERATOR_LABELS));
    }

    // Find all rules in the same mutually exclusive group
    const groupRules = otherRules.filter(r => exclusiveGroup.includes(r.type));

    // If there are any rules in the same group, lock to current operator
    if (groupRules.length > 0) {
      return [operatorToOption(rule.operator, OPERATOR_LABELS)];
    }

    return baseOperators.map(operator => operatorToOption(operator, OPERATOR_LABELS));
  }, []);

  /**
   * Get value options for a specific rule type
   */
  const getValueOptions = useCallback((type: RuleType): Option[] => {
    return getOptionsForRuleType(type);
  }, []);

  return {
    // State
    validationResult,
    successMessage,

    // Actions
    validateAndUpdateRules,

    // Options
    getOperatorOptions,
    getValueOptions,
  };
}; 