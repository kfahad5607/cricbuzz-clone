import clsx from "clsx";
import React, { forwardRef, useEffect, useId, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { FiCheck } from "react-icons/fi";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useApiOptions } from "../../hooks/useApiOptions";
import { ApiOption } from "../../types/common";
import Spinner from "./Spinner";
import useDebouncedState from "../../hooks/useDebouncedState";

type Props = {
  label: string;
  // apiURL: string;
  selectedValue?: ApiOption["value"];
  onOptionSelect: (val: ApiOption["value"] | undefined) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

const getSelectedOption = <T,>(options: ApiOption[], selectedOptionVal?: T) => {
  if (!selectedOptionVal) {
    return options[0];
  }

  for (let i = 0; i < options.length; i++) {
    if (options[i].value === selectedOptionVal) return options[i];
  }

  return null;
};

const DynamicComboBoxElement = forwardRef<HTMLInputElement, Props>(
  (
    { label, className, selectedValue, onOptionSelect, ...props }: Props,
    ref
  ) => {
    const uniqueId = useId();
    const [showOptions, setShowOptions] = useState(false);
    const [query, setQuery] = useState("");
    const compRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const lastSelectedOptionRef = useRef<ApiOption | null>(null);
    const debouncedQuery = useDebouncedState(query, 350);
    const { data, isLoading } = useApiOptions(
      "teams",
      debouncedQuery,
      selectedValue
    );

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const handleClickOutside = (e: MouseEvent) => {
      e.stopPropagation();
      if (compRef.current && !compRef.current.contains(e.target as Node)) {
        closeOptions();
      }
    };

    const handleOptionClick = (option: ApiOption) => {
      const optionVal = option.value === selectedOption?.value ? null : option;
      onOptionSelect(optionVal?.value || undefined);
      closeOptions();
    };

    const openOptions = () => {
      setShowOptions(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    };

    const closeOptions = () => {
      setShowOptions(false);
      setQuery("");
    };

    const filteredOptions = data || [];
    const selectedOption = getSelectedOption(filteredOptions, selectedValue);
    if (selectedOption) {
      lastSelectedOptionRef.current = selectedOption;
    }

    return (
      <div className={className} ref={compRef}>
        <label
          htmlFor={uniqueId}
          onClick={(e) => {
            if (showOptions) {
              e.preventDefault();
              closeOptions();
            }
          }}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="relative mt-2">
          <input
            id={uniqueId}
            type="button"
            className="w-full p-2 pl-3 pr-10 text-left bg-gray-50 border border-gray-300 rounded-md text-slate-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            {...props}
            value={
              lastSelectedOptionRef.current?.label ||
              (isLoading ? "Fetching options..." : "")
            }
            onClick={() => {
              if (showOptions) {
                closeOptions();
              } else {
                openOptions();
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (showOptions) {
                closeOptions();
              } else {
                openOptions();
              }
            }}
            className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2"
          >
            <div className="text-xs text-gray-700">
              <IoIosArrowUp className="text-inherit -mb-1" />
              <IoIosArrowDown className="text-inherit" />
            </div>
          </button>
          <div
            className={clsx(
              "absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-gray-50 py-1 shadow-sm text-base sm:text-sm",
              showOptions ? "block" : "hidden"
            )}
          >
            <div className="px-2 py-2 flex items-center">
              <BiSearch className="mr-2 text-lg text-gray-600" />
              <input
                type="text"
                ref={inputRef}
                className="pr-2 outline-none bg-transparent w-full"
                placeholder="Search Items..."
                onChange={(e) => setQuery(e.target.value.trim())}
                value={query}
              />
            </div>
            <div className="border-t-gray-300 border-t p-1 max-h-60 overflow-auto">
              {isLoading ? (
                <div className="flex justify-center mt-1.5 mb-1">
                  <Spinner className="w-6 h-6" />
                </div>
              ) : (
                filteredOptions.map((option, optionIdx) => (
                  <div
                    key={optionIdx}
                    onClick={() => handleOptionClick(option)}
                    className={clsx(
                      "relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white",
                      option.value === selectedOption?.value
                        ? "bg-blue-600 text-white"
                        : "text-slate-900"
                    )}
                  >
                    <span
                      className={clsx(
                        "block truncate",
                        option.value === selectedOption?.value &&
                          "font-semibold"
                      )}
                    >
                      {option.label}
                    </span>
                    {option.value === selectedOption?.value && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-inherit">
                        <FiCheck className="text-[22px]" />
                      </span>
                    )}
                  </div>
                ))
              )}
              {!isLoading && filteredOptions.length === 0 && (
                <div className="text-center mt-1">No match found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default DynamicComboBoxElement;
