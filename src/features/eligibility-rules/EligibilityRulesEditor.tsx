import { useEffect, useCallback, useState, useMemo } from 'react';
import { useEligibilityRules } from './hooks/useEligibilityRules';
import { MemoizedRuleItem } from './components/RuleItem/RuleItem';
import './EligibilityRulesEditor.css';
import { ruleTypeOptions, operatorOptions, DEFAULT_VALUES, INITIAL_RULES, RULE_TYPE_BEHAVIOR } from './data/eligibilityRules.data';
import { findMutuallyExclusiveGroup, hasInclusionRuleInGroup, sortRulesByPriority } from './utils/eligibilityRules.utils';
import type { Rule, RuleType, Operator } from './types/eligibilityRules.types';

// Main editor component for managing eligibility rules
const EligibilityRulesEditor = () => {
  const [rules, setRules] = useState<Rule[]>(sortRulesByPriority(INITIAL_RULES));
  const [currentEditingRule, setCurrentEditingRule] = useState<Rule | null>(null);
  const disabled = false;
  
  // Memoize the total rules count to prevent unnecessary re-renders
  const totalRules = useMemo(() => rules.length, [rules]);
  
  const {
    getOperatorOptions,
    getValueOptions,
    validateAndUpdateRules
  } = useEligibilityRules();

  // Delay validation to prevent rapid re-validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateAndUpdateRules(rules);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [rules, validateAndUpdateRules]);

  // Core handlers for rule modifications
  const handlers = useMemo(() => ({
    onRuleChange: (index: number, updatedRule: Rule) => {
      setRules(prevRules => {
        const newRules = [...prevRules];
        newRules[index] = updatedRule;
        return sortRulesByPriority(newRules);
      });
    },
    onRuleDelete: (index: number) => {
      setCurrentEditingRule(null);
      setRules(prevRules => sortRulesByPriority(prevRules.filter((_, i) => i !== index)));
    },
    onRuleDeleteById: (ruleId: string) => {
      setCurrentEditingRule(null);
      setRules(prevRules => sortRulesByPriority(prevRules.filter(r => r.id !== ruleId)));
    },
    onTypeChange: (ruleId: string, newType: RuleType) => {
      setRules(prevRules => {
        // Prevent duplicate rule types
        if (prevRules.some(r => r.type === newType)) return prevRules;

        const behavior = RULE_TYPE_BEHAVIOR[newType];
        const newRules = [...prevRules];
        const ruleIndex = newRules.findIndex(r => r.id === ruleId);

        if (ruleIndex !== -1) {
          // If the rule type has a fixed operator defined in behavior
          if (!behavior.showOperator) {
            newRules[ruleIndex] = {
              ...prevRules[ruleIndex],
              type: newType,
              operator: behavior.defaultOperator,
              value: DEFAULT_VALUES[newType]
            };
            return sortRulesByPriority(newRules);
          }

          // Handle operator selection based on mutual exclusivity rules
          const exclusiveGroup = findMutuallyExclusiveGroup(newType);
          let defaultOperator: Operator;

          if (exclusiveGroup && hasInclusionRuleInGroup(prevRules, exclusiveGroup)) {
            defaultOperator = 'is_not';
          } else {
            const operators = getOperatorOptions({ ...prevRules[0], type: newType }, prevRules);
            defaultOperator = operators[0]?.id as Operator || behavior.defaultOperator;
          }

          newRules[ruleIndex] = {
            ...prevRules[ruleIndex],
            type: newType,
            operator: defaultOperator,
            value: DEFAULT_VALUES[newType]
          };
        }

        return sortRulesByPriority(newRules);
      });

      // Clear the editing state after successful change
      setTimeout(() => setCurrentEditingRule(null), 0);
    },
    onOperatorChange: (ruleId: string, newOperator: Operator) => {
      setRules(prevRules => {
        const ruleIndex = prevRules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1) return prevRules;

        const newRules = [...prevRules];
        newRules[ruleIndex] = {
          ...prevRules[ruleIndex],
          operator: newOperator
        };
        return sortRulesByPriority(newRules);
      });
    },
    onValueChange: (ruleId: string, newValue: Rule['value']) => {
      setRules(prevRules => {
        const ruleIndex = prevRules.findIndex(r => r.id === ruleId);
        if (ruleIndex === -1) return prevRules;

        const newRules = [...prevRules];
        newRules[ruleIndex] = {
          ...prevRules[ruleIndex],
          value: newValue
        };
        return sortRulesByPriority(newRules);
      });
    },
    onDelete: (ruleId: string) => {
      setCurrentEditingRule(null);
      setRules(prevRules => sortRulesByPriority(prevRules.filter(r => r.id !== ruleId)));
    }
  }), [getOperatorOptions]);

  // Disable rule types that are already in use
  const options = useMemo(() => ({
    ruleTypeOptions: ruleTypeOptions.map(option => ({
      ...option,
      disabled: rules.some(rule => rule.type === option.id && rule.id !== currentEditingRule?.id)
    })),
    operatorOptions,
    availableOperators: (rule: Rule) => {
      // Filter out the current rule when checking for operator availability
      const otherRules = rules.filter(r => r.id !== rule.id);
      return getOperatorOptions(rule, otherRules);
    },
    valueOptions: getValueOptions
  }), [getOperatorOptions, getValueOptions, rules, currentEditingRule]);

  // Check if any rule types are available to add
  const hasAvailableRuleTypes = useMemo(() => 
    ruleTypeOptions.some(typeOption => 
      !rules.some(rule => rule.type === typeOption.id)
    ),
    [rules]
  );

  // Add new rule with available type and appropriate operator
  const handleAddRule = useCallback(() => {
    // Find a rule type that isn't already used
    const availableType = ruleTypeOptions.find(typeOption => 
      !rules.some(rule => rule.type === typeOption.id)
    );

    // If no unused types available, don't add a rule
    if (!availableType) return;

    const defaultType = availableType.id as RuleType;
    const exclusiveGroup = findMutuallyExclusiveGroup(defaultType);
    let defaultOperator: Operator;

    if (exclusiveGroup && hasInclusionRuleInGroup(rules, exclusiveGroup)) {
      // If there's already an inclusion rule in the group, we must use an exclusion operator
      defaultOperator = 'is_not';
    } else {
      // Otherwise, prefer an inclusion operator
      const operators = getOperatorOptions({ 
        id: `temp_${Date.now()}`, 
        type: defaultType,
        operator: 'contains_any',
        value: DEFAULT_VALUES[defaultType]
      }, rules);
      defaultOperator = operators[0]?.id as Operator;
    }
    
    const newRule: Rule = {
      id: `rule_${Date.now()}`,
      type: defaultType,
      operator: defaultOperator,
      value: DEFAULT_VALUES[defaultType]
    };
    setRules(prevRules => sortRulesByPriority([...prevRules, newRule]));
  }, [rules, getOperatorOptions]);

  return (
    <div className="container">
      <div className="header">
        <h2 className="header-title">Rule</h2>
        <p className="header-description">The offer will be triggered based on the rules in this section</p>
      </div>

      {/* Rules List */}
      <div className="rules-list">
        {rules.map((rule, index) => (
          <MemoizedRuleItem
            key={rule.id}
            rule={rule}
            index={index}
            handlers={handlers}
            options={options}
            disabled={disabled}
            totalRules={totalRules}
          />
        ))}
      </div>

      <button
        onClick={handleAddRule}
        className="add-rule-button button-base"
        disabled={disabled || !hasAvailableRuleTypes}
      >
        + {"  "} Add
      </button>
    </div>
  );
};

export default EligibilityRulesEditor;