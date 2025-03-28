import type { RuleValue } from '../types/eligibilityRules.types';

export const isNumber = (value: RuleValue): value is number => {
  return typeof value === 'number';
}; 

export const isNumberPair = (value: unknown): value is [number, number] => {
  return Array.isArray(value) && 
         value.length === 2 && 
         typeof value[0] === 'number' && 
         typeof value[1] === 'number';
};