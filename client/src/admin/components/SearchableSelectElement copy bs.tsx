import React, { useState } from "react";

interface ComboBoxProps {
  options: { label: string; value: string }[];
  label: string;
  onChange: (value: string) => void;
}

const ComboBox: React.FC<ComboBoxProps> = ({ options, label, onChange }) => {
  const [selected, setSelected] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleSelect = (option: string) => {
    setSelected(option);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-2">
        <input
          type="text"
          className=" w-full rounded-md border-0 bg-white text-slate-900 py-1.5 pl-3 pr-10 shadow-sm sm:text-sm"
        />
        <button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            data-slot="icon"
            className="size-5 text-gray-500"
          >
            <path
              fill-rule="evenodd"
              d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
        <div className="absolute z-10 mt-1 w-full max-h-60 rounded-md overflow-auto bg-white py-1 shadow-sm text-base sm:text-sm">
          <div className="relative cursor-default select-none py-2 pl-3 pr-9 text-slate-900">
            <span className="block truncate font-semibold">Fahad Khan</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
                className="size-5"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
      {/* <div
        className="mt-1 relative"
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="combo-list"
      >
        <input
          type="text"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          placeholder="Select an option"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {isOpen && (
          <ul
            id="combo-list"
            className="absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-10"
          >
            {options
              .filter((option) =>
                option.label.toLowerCase().includes(selected.toLowerCase())
              )
              .map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                >
                  {option.label}
                </li>
              ))}
          </ul>
        )}
      </div> */}
    </div>
  );
};

export default ComboBox;
