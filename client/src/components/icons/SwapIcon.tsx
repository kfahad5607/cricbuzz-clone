import { MdSwapHoriz } from "react-icons/md";

export interface Props {
  color?: string;
  className?: string;
}

export const SwapIcon = ({ color = "#de4141", className = "" }: Props) => {
  return (
    <div
      className={`${className} rounded-full flex justify-center items-center w-6 h-6 p-0.5`}
      style={{ backgroundColor: color }}
    >
      <MdSwapHoriz className="text-white" size="1.55rem" />
    </div>
  );
};
