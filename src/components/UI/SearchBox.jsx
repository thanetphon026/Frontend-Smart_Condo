import React, { useState, useEffect } from 'react';

const SearchBox = ({ 
  placeholder = 'ค้นหา...', 
  onSearch, 
  delay = 300,
  className = '',
  showIndicator = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [timer, setTimer] = useState(null);

  const onSearchRef = React.useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (timer) clearTimeout(timer);
    
    if (searchTerm.trim() !== '') {
      setIsSearching(true);
      const newTimer = setTimeout(() => {
        onSearchRef.current(searchTerm);
        setIsSearching(false);
      }, delay);
      setTimer(newTimer);
    } else {
      onSearchRef.current('');
      setIsSearching(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
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