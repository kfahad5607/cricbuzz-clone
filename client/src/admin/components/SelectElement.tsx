import { forwardRef, useId } from "react";

type Props = {
  label: string;
  options: {
    label: string;
    value: string;
  }[];
} & React.InputHTMLAttributes<HTMLSelectElement>;

const SelectElement = forwardRef<HTMLSelectElement, Props>(
  ({ label, options, className, ...props }: Props, ref) => {
    const uniqueId = useId();

    return (
      <div className={className}>
        <label
          htmlFor={uniqueId}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <select
          id={uniqueId}
          ref={ref}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          {...props}
        >
          {options.map((option, optionIdx) => (
            <option key={optionIdx} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);
export default SelectElement;
