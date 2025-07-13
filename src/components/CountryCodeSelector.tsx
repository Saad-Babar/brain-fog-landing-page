"use client";
import { useState, useRef, useEffect } from "react";
import { countries } from "countries-list";

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  value,
  onChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert countries object to array and filter by phone codes
  const countryList = Object.entries(countries)
    .filter(([_, country]) => country.phone)
    .map(([code, country]) => {
      let phoneCode = '';
      const phone = country.phone as any;
      if (Array.isArray(phone)) {
        phoneCode = phone[0]?.toString() || '';
      } else if (typeof phone === 'number') {
        phoneCode = phone.toString();
      } else if (typeof phone === 'string') {
        phoneCode = phone;
      }
      
      return {
        code,
        name: country.name,
        phone: phoneCode,
        flagUrl: `https://flagcdn.com/w20/${code.toLowerCase()}.png`
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredCountries = countryList.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.phone.includes(searchTerm)
  );

  const selectedCountry = countryList.find(country => country.phone === value) || countryList[0];

  // Debug: Log first few countries to see flags
  console.log("First 3 countries:", countryList.slice(0, 3));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-full w-full items-center justify-between rounded-l-lg border border-r-0 border-stroke bg-white px-3 py-3 text-sm font-medium text-dark focus:outline-none focus:ring-2 focus:ring-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
      >
        <div className="flex items-center space-x-2">
          <img 
            src={selectedCountry?.flagUrl} 
            alt={`${selectedCountry?.name} flag`}
            className="h-4 w-6 object-cover rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="text-xs text-dark-6 dark:text-dark-4">+{selectedCountry?.phone}</span>
        </div>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-80 overflow-auto rounded-lg border border-stroke bg-white shadow-lg dark:border-dark-3 dark:bg-dark-2">
          <div className="sticky top-0 border-b border-stroke bg-gray-50 p-3 dark:border-dark-3 dark:bg-dark-3">
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-stroke px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-dark-3 dark:bg-dark-2 dark:text-white"
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country.phone);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-dark-3"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={country.flagUrl} 
                    alt={`${country.name} flag`}
                    className="h-4 w-6 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-sm font-medium text-dark dark:text-white">
                    {country.name}
                  </span>
                </div>
                <span className="text-xs text-dark-6 dark:text-dark-4">
                  +{country.phone}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelector; 