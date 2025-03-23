import { memo, useCallback, useMemo } from 'react';
import MultiSelect from '../MultiSelect/MultiSelect';
import Select from '../Select/Select';
import { RULE_TYPE_BEHAVIOR, ruleTypeOptions, operatorOptions } from '../../data/eligibilityRules.data';
import DeleteIcon from '../../../../assets/delete-icon.svg';
import type RuleItemProps from './types';
import type { RuleType, RuleValue, Operator, Rule } from '../../types/eligibilityRules.types';
import './RuleItem.css';

// This file has two components:
// 1. RuleItem: A component that represents a single rule in the eligibility rules editor.
// 2. MemoizedRuleItem: A wrapper component that memoizes the RuleItem component.

/**
 * Type guard to check if a value is a number array with exactly 2 elements
 */
const isNumberPair = (value: unknown): value is [number, number] => {
  return Array.isArray(value) && 
         value.length === 2 && 
         typeof value[0] === 'number' && 
         typeof value[1] === 'number';
};

/**
 * A component that represents a single rule in the eligibility rules editor.
 * It handles the display and editing of rule type, operator, and value.
 * The component is memoized to prevent unnecessary re-renders.
 */
const RuleItem = memo(({
  rule,
  index,
  totalRules,
  onTypeChange,
  onOperatorChange,
  onValueChange,
  onDelete,
  ruleTypeOptions,
  availableOperators,
  valueOptions,
  disabled = false
}: RuleItemProps) => {

  // Memoize callbacks with stable references
  const handleTypeChange = useCallback((newType: string) => {
    onTypeChange(rule.id, newType as RuleType);
  }, [rule.id, onTypeChange]);

  const handleOperatorChange = useCallback((newOperator: string) => {
    onOperatorChange(rule.id, newOperator as Operator);
  }, [rule.id, onOperatorChange]);

  const handleValueChange = useCallback((newValue: string[] | string) => {
    if (rule.type === 'cart_value_range') {
      // Convert string to number for cart value range
      const numValue = Array.isArray(newValue) 
        ? newValue.map(v => parseFloat(v))
        : parseFloat(newValue as string);
      onValueChange(rule.id, numValue as RuleValue);
    } else {
      // For all other cases, pass the string array as is
      onValueChange(rule.id, newValue as RuleValue);
    }
  }, [rule.id, rule.type, onValueChange]);

  const handleDelete = useCallback(() => {
    onDelete(rule.id);
  }, [rule.id, onDelete]);

  const handleRemoveValue = useCallback((valueToRemove: string) => {
    if (!Array.isArray(rule.value)) return;
    const newValues = rule.value.filter(v => v !== valueToRemove);
    onValueChange(rule.id, newValues as RuleValue);
  }, [rule.id, rule.value, onValueChange]);

  // Memoize the rule item container props and isLast check
  const { containerProps, isLast } = useMemo(() => ({
    containerProps: {
      className: 'rule-item-container div-with-partial-border',
      style: { opacity: disabled ? 0.5 : 1 }
    },
    isLast: index === totalRules - 1
  }), [disabled, index, totalRules]);

  // Determine if we should use SearchableSelect
  const shouldUseSearchableSelect = useMemo(() => {
    return ['specific_collections', 'specific_products', 'product_tags'].includes(rule.type);
  }, [rule.type]);

  // Render value input based on rule type and operator
  const renderValueInput = () => {
    if (rule.type === 'product_subscribed' || 
        (rule.type === 'specific_products' && rule.operator === 'equals_anything')) {
      return null;
    }

    if (rule.type === 'specific_discount_codes') {
      return (
        <input
          type="text"
          value={Array.isArray(rule.value) ? rule.value.join(',') : ''}
          onChange={(e) => {
            const codes = e.target.value.split(',');
            const filteredCodes = codes.map(code => code.trim());
            handleValueChange(filteredCodes);
          }}
          className="text-input"
          disabled={disabled}
          placeholder="Enter discount codes"
        />
      );
    }

    if (rule.type === 'cart_value_range') {
      if (rule.operator === 'is_between') {
        const [value1, value2] = isNumberPair(rule.value) ? rule.value : [0, 0];
        return (
          <div className="range-input">
            <input
              type="number"
              value={value1}
              onChange={(e) => handleValueChange([String(e.target.value), String(value2)])}
              className="number-input"
              disabled={disabled}
              style={{ width: '213px' }}
            />
            <input
              type="number"
              value={value2}
              onChange={(e) => handleValueChange([String(value1), String(e.target.value)])}
              className="number-input"
              disabled={disabled}
              style={{ width: '213px' }}
            />
          </div>
        );
      }
      return (
        <input
          type="number"
          value={typeof rule.value === 'number' ? rule.value : 0}
          onChange={(e) => handleValueChange(e.target.value)}
          className="number-input"
          disabled={disabled}
        />
      );
    }

    // For all other cases, we're dealing with string arrays
    const stringArrayValue = Array.isArray(rule.value) && rule.value.every(v => typeof v === 'string')
      ? rule.value
      : [];

    // Use enhanced MultiSelect with search for specific rule types
    return (
      <MultiSelect
        options={valueOptions}
        value={stringArrayValue}
        onChange={handleValueChange}
        disabled={disabled}
        className="rule-value-select"
        placeholder={`${shouldUseSearchableSelect ? 'Search' : 'Select'} ${rule.type.replace('specific_', '').replace('_', ' ')}...`}
        showSearch={shouldUseSearchableSelect}
        showCount={shouldUseSearchableSelect}
      />
    );
  };

  // Render selected values as badges
  const renderSelectedValues = () => {
    if (!Array.isArray(rule.value) || rule.value.length === 0 || 
        rule.type === 'cart_value_range' || 
        rule.type === 'product_subscribed' || 
        rule.type === 'specific_discount_codes' ||
        (rule.type === 'specific_products' && rule.operator === 'equals_anything')) {
      return null;
    }

    return (
      <div className="selected-items-container">
        {rule.value.map(value => {
          const option = valueOptions.find(opt => opt.id === value);
          return option ? (
            <div key={value} className="selected-item-badge">
              {option.name}
              <button
                type="button"
                className="remove-badge"
                onClick={() => handleRemoveValue(value as string)}
                disabled={disabled}
              >
                ×
              </button>
            </div>
          ) : null;
        })}
      </div>
    );
  };

  return (
    <div {...containerProps}>
      <>
        {!isLast && <span className="connector-label">AND</span>}
        <span className="connector-top"></span>
        <span className="connector-bottom"></span>
      </>
      
      <div className="rule-controls">
        <Select
          options={ruleTypeOptions}
          value={rule.type}
          onChange={handleTypeChange}
          disabled={disabled}
          className="rule-type-select"
        />
        
        {RULE_TYPE_BEHAVIOR[rule.type].showOperator && (
          <Select
            options={availableOperators}
            value={rule.operator}
            onChange={handleOperatorChange}
            disabled={disabled}
            className="rule-operator-select"
          />
        )}
        
        {renderValueInput()}

        <button
          onClick={handleDelete}
          disabled={disabled}
          className="delete-button"
        >
          <img src={DeleteIcon} alt="Delete rule" width={16} height={16} />
        </button>
      </div>
      {renderSelectedValues()}
    </div>
  );
}, (prevProps, nextProps) => {
  // Deep compare rule values
  const prevValue = prevProps.rule.value;
  const nextValue = nextProps.rule.value;
  const valueEqual = Array.isArray(prevValue) && Array.isArray(nextValue) 
    ? prevValue.length === nextValue.length && prevValue.every((v, i) => v === nextValue[i])
    : prevValue === nextValue;

  return (
    prevProps.rule.id === nextProps.rule.id &&
    prevProps.rule.type === nextProps.rule.type &&
    prevProps.rule.operator === nextProps.rule.operator &&
    valueEqual &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.ruleTypeOptions === nextProps.ruleTypeOptions &&
    prevProps.availableOperators === nextProps.availableOperators &&
    prevProps.valueOptions === nextProps.valueOptions &&
    prevProps.index === nextProps.index &&
    prevProps.totalRules === nextProps.totalRules
  );
}); 

// Wrapper component for RuleItem with additional props
export const MemoizedRuleItem = memo(({ 
  rule, 
  index,
  handlers,
  options,
  disabled,
  totalRules
}: {
  rule: Rule;
  index: number;
  handlers: {
    onRuleChange: (index: number, updatedRule: Rule) => void;
    onRuleDelete: (index: number) => void;
    onTypeChange: (ruleId: string, newType: RuleType) => void;
    onOperatorChange: (ruleId: string, newOperator: Operator) => void;
    onValueChange: (ruleId: string, newValue: Rule['value']) => void;
    onDelete: (ruleId: string) => void;
  };
  options: {
    ruleTypeOptions: typeof ruleTypeOptions;
    operatorOptions: typeof operatorOptions;
    availableOperators: (rule: Rule) => Array<{ id: string; name: string; disabled?: boolean }>;
    valueOptions: (type: RuleType) => Array<{ id: string; name: string }>;
  };
  disabled: boolean;
  totalRules: number;
}) => {
  // Get operators based on current rule state
  const availableOperators = useMemo(() => 
    options.availableOperators(rule), 
    [options, rule]
  );

  // Get value options based on rule type
  const valueOptions = useMemo(() => 
    options.valueOptions(rule.type),
    [options, rule]
  );

  return (
    <RuleItem
      key={rule.id}
      rule={rule}
      index={index}
      totalRules={totalRules}
      onRuleChange={handlers.onRuleChange}
      onRuleDelete={handlers.onRuleDelete}
      ruleTypeOptions={options.ruleTypeOptions}
      operatorOptions={options.operatorOptions}
      availableOperators={availableOperators}
      valueOptions={valueOptions}
      onTypeChange={handlers.onTypeChange}
      onOperatorChange={handlers.onOperatorChange}
      onValueChange={handlers.onValueChange}
      onDelete={handlers.onDelete}
      disabled={disabled}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.rule === nextProps.rule &&
    prevProps.index === nextProps.index &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.handlers === nextProps.handlers &&
    prevProps.options === nextProps.options &&
    prevProps.totalRules === nextProps.totalRules
  );
});

// Export both components
export default MemoizedRuleItem;