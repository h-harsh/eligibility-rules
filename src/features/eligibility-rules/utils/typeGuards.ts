import type { RuleValue, CartValueRange } from '../types/eligibilityRules.types';

/**
 * Type guard functions for eligibility rules value types
 */

export const isCartValueRange = (value: RuleValue): value is CartValueRange => {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
};

export const isStringArray = (value: RuleValue): value is string[] => {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
};

export const isNumber = (value: RuleValue): value is number => {
  return typeof value === 'number';
}; 