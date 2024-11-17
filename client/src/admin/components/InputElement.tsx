import { forwardRef, useId } from "react";

type Props = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputElement = forwardRef<HTMLInputElement, Props>(
  ({ label, className, ...props }: Props, ref) => {
    const uniqueId = useId();

    return (
      <div className={className}>
        <label
          htmlFor={uniqueId}
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={uniqueId}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          autoComplete="off"
          {...props}
        />
      </div>
    );
  }
);
InputElement.displayName = "Input";

export default InputElement;
