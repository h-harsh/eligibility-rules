import { memo } from 'react';
import type { SelectProps } from './types';
import './Select.css';

/**
 * A reusable select component that provides consistent styling and behavior
 * across the application. It handles single-select scenarios with a standard
 * dropdown interface.
 */
const Select = memo(({
  options,
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder = 'Select an option',
  label,
}: SelectProps) => {
  const wrapperClasses = `input-wrapper ${disabled ? 'disabled' : ''} ${className}`.trim();

  return (
    <div className={wrapperClasses}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-content">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="select-base"
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.id} 
              value={option.id}
              disabled={option.disabled}
            >
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.options === nextProps.options &&
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.className === nextProps.className &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.label === nextProps.label
  );
}); 

export default Select;