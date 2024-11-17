import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

const ErrorElement = ({ children, className }: Props) => {
  return (
    <p className={`text-sm text-red-600 dark:text-red-500 ${className}`}>
      {children}
    </p>
  );
};

export default ErrorElement;
