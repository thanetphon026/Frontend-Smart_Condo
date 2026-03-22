import React, { useState, useEffect, useRef } from 'react';

const SearchBox = ({ 
  placeholder = 'ค้นหา...', 
  onSearch, 
  delay = 300,
  className = '',
  showIndicator = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef(null);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (searchTerm.trim() !== '') {
      setIsSearching(true);
      timerRef.current = setTimeout(() => {
        onSearchRef.current(searchTerm);
        setIsSearching(false);
      }, delay);
    } else {
      onSearchRef.current('');
      setIsSearching(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm, delay]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchTerm('');
      onSearch('');
    }
  };

  return (
    <div className={`position-relative w-100 ${className}`}>
      <input
        type="text"
        className={`form-control pe-4 ${isSearching ? 'searching' : ''}`}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {showIndicator && (
        <div className="search-indicator">
          <span className="search-spinner">
            <i className="bi bi-arrow-repeat"></i>
          </span>
          <span className="search-text">กำลังค้นหา...</span>
        </div>
      )}
    </div>
  );
};

export default SearchBox;