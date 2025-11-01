import React, { useState, useRef, useEffect } from 'react';
import { currencies, searchCurrencies } from '../../data/currencies';
import './CurrencyDropdown.css';

const CurrencyDropdown = ({ selectedCurrency, onSelect, isOpen, onClose, position = 'bottom' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCurrencies, setFilteredCurrencies] = useState(currencies);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const filtered = searchCurrencies(searchQuery);
    setFilteredCurrencies(filtered);
  }, [searchQuery]);

  // Reset search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFilteredCurrencies(currencies);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown menu
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Also check if click is not on a currency selector button (class name check)
        const target = event.target;
        const isCurrencyButton = target.closest('.currency-selector-button');
        
        if (!isCurrencyButton) {
          onClose();
        }
      }
    };

    if (isOpen) {
      // Use setTimeout to avoid immediate closure when opening
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const handleCurrencySelect = (currency) => {
    onSelect(currency.code);
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="currency-dropdown-container" ref={dropdownRef}>
      {isOpen && (
        <div className={`currency-dropdown-menu currency-dropdown-${position}`}>
          <div className="currency-search-container">
            <span className="search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              className="currency-search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="currency-list">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`currency-item ${currency.code === selectedCurrency ? 'selected' : ''}`}
                  onClick={() => handleCurrencySelect(currency)}
                >
                  <span className="currency-item-flag">{currency.flag}</span>
                  <div className="currency-item-info">
                    <span className="currency-item-code">{currency.code}</span>
                    <span className="currency-item-name">{currency.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="currency-item-empty">No currencies found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;

