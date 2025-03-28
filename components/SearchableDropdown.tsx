import React, { useState, useEffect, ChangeEvent } from 'react';
import classNames from 'classnames';
import Dropdown, { DropdownToggle, DropdownMenu, DropdownItem } from '../components/bootstrap/Dropdown';
import PropTypes from 'prop-types';

interface ISearchableDropdownProps {
  items: ({ value: string; label: string } | null | undefined)[];
  selectedItem?: string | null;
  placeholder?: string;
  onSelectItem: (value: string) => void;
  className?: string;
}

const SearchableDropdown: React.FC<ISearchableDropdownProps> = ({
  items = [],
  selectedItem,
  placeholder = 'Search...',
  onSelectItem,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    const filtered = items.filter(
      item => item && item.label.toLowerCase().includes(searchValue.toLowerCase()) 
    );
    setFilteredItems(filtered);
  };
  const handleSelectItem = (value: string) => {
    onSelectItem(value);
    setIsOpen(false);
  };

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  return (
    <Dropdown
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className={classNames('searchable-dropdown', className)}
    >
      <DropdownToggle>
        <button
          type="button"
          className="btn btn-primary dropdown-toggle"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedItem ? items.find(item => item && item.value === selectedItem)?.label : 'Select an option'}
        </button>
      </DropdownToggle>
      <DropdownMenu>
        <div className="dropdown-search-wrapper">
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {filteredItems.length > 0 ? (
          filteredItems.map(
            (item) =>
              item && (
                <DropdownItem key={item.value} onClick={() => handleSelectItem(item.value)}>
                  {item.label}
                </DropdownItem>
              )
          )
        ) : (
          <DropdownItem isText>
            <span>No options found</span>
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
};
SearchableDropdown.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
      PropTypes.oneOf([null, undefined]),
    ])
  ).isRequired,
  selectedItem: PropTypes.string,
  placeholder: PropTypes.string,
  onSelectItem: PropTypes.func.isRequired,
  className: PropTypes.string,
};
SearchableDropdown.defaultProps = {
  selectedItem: null,
  placeholder: 'Search...',
  className: '',
};

export default SearchableDropdown;