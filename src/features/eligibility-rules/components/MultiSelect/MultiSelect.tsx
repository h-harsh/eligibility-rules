import React, { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import type { MultiSelectProps } from './types';
import './MultiSelect.css';
import SearchIcon from '../../../../assets/search-icon.svg';

/**
 * An enhanced multi-select component that provides:
 * - Optional search functionality with icon
 * - Dropdown interface with checkboxes
 * - Selected items count display
 * - Keyboard navigation and accessibility
 */
const MultiSelect = memo(({
  options,
  value,
  onChange,
  className = '',
  disabled = false,
  placeholder = 'Select options',
  label,
  showSearch = false,
  showCount = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = useCallback((optionId: string) => {
    const newValue = value.includes(optionId)
      ? value.filter((id: string) => id !== optionId)
      : [...value, optionId];
    onChange(newValue);
  }, [value, onChange]);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(true);
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, []);

  // Memoize filtered options
  const filteredOptions = useMemo(() => 
    options.filter(option => 
      !searchTerm || option.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [options, searchTerm]
  );

  // Memoize selected options display
  const selectedOptionsDisplay = useMemo(() => {
    if (showSearch && searchTerm) return searchTerm;
    return placeholder;
  }, [placeholder, searchTerm, showSearch]);

  // Selection count display
  const selectionCount = useMemo(() => 
    showCount ? `${value.length}/${options.length}` : undefined,
    [value.length, options.length, showCount]
  );

  const wrapperClasses = `input-wrapper ${disabled ? 'disabled' : ''} ${className}`.trim();

  return (
    <div className={wrapperClasses}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-content">
        <div ref={containerRef} className="multi-select-container">
          <div className="select-input-container">
            {showSearch && <img src={SearchIcon} alt="Search" className="search-icon" />}
            <input
              ref={inputRef}
              type="text"
              className={`select-base ${showSearch ? 'with-search' : ''}`}
              placeholder={selectedOptionsDisplay}
              onClick={handleInputClick}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              value={searchTerm}
              disabled={disabled}
            />
            {selectionCount && (
              <span className="selection-count">{selectionCount}</span>
            )}
          </div>
          {isOpen && !disabled && (
            <div className="dropdown-menu">
              {filteredOptions.map(option => (
                <div
                  key={option.id}
                  className="dropdown-item"
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option.id)}
                    onChange={() => {}}
                    onClick={e => e.stopPropagation()}
                  />
                  {option.name}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div className="dropdown-item">No matching options</div>
              )}
            </div>
          )}
        </div>
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
    prevProps.label === nextProps.label &&
    prevProps.showSearch === nextProps.showSearch &&
    prevProps.showCount === nextProps.showCount
  );
}); 

export default MultiSelect;