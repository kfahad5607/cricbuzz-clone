import React, { useState, useEffect } from "react";
import axios from "axios";
import apiClient from "../../services/api-client";

interface SelectProps {
  apiUrl: string; // API URL to fetch options from
  placeholder?: string; // Optional placeholder text
  onChange: (value: string) => void; // Callback to handle the selected value
}

interface Option {
  id: string; // Option id (or unique identifier)
  label: string; // Option label (displayed in the dropdown)
}

const SearchableSelectElement: React.FC<SelectProps> = ({
  apiUrl,
  placeholder = "Search...",
  onChange,
}) => {
  const [query, setQuery] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.length === 0) {
      setOptions([]); // Clear options when query is empty
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`${apiUrl}?query=${query}`);
        console.log("response ", response);

        const _options = response.data.data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          };
        });

        setOptions(_options); // Assuming API returns an array of options
      } catch (err) {
        setError("Failed to load options");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchOptions();
    }, 300); // Debounce to prevent too many API calls

    return () => clearTimeout(debounceTimer); // Cleanup debounce timer on unmount or query change
  }, [query, apiUrl]);

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
      />
      {loading && (
        <div className="absolute top-full left-0 w-full p-2 text-gray-500">
          Loading...
        </div>
      )}
      {error && (
        <div className="absolute top-full left-0 w-full p-2 text-red-500">
          {error}
        </div>
      )}
      {query.length > 0 && !loading && !error && options.length > 0 && (
        <ul className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <li
              key={option.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onChange(option.id); // Pass the selected value back to parent
                setQuery(option.label); // Optionally set query to label when selected
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableSelectElement;
