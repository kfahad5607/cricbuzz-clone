import { forwardRef, useId } from "react";

type Props = {
  label: string;
  type?: "date" | "time" | "datetime-local";
} & React.InputHTMLAttributes<HTMLInputElement>;

const DateTimeElement = forwardRef<HTMLInputElement, Props>(
  ({ type = "datetime-local", label, className, ...props }: Props, ref) => {
    const uniqueId = useId();

    return (
      <div className={className}>
        <label
          htmlFor={uniqueId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
        </label>
        <input
          type={type}
          ref={ref}
          id={uniqueId}
          className="w-full p-2 pl-3 text-gray-700 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 placeholder-gray-400"
          {...props}
        />
      </div>
    );
  }
);
DateTimeElement.displayName = "DateTimeElement";

export default DateTimeElement;
