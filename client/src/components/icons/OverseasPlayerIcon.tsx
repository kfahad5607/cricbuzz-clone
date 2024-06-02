import { MdAirplanemodeActive } from "react-icons/md";

interface Props {
  className?: string;
}

const OverseasPlayerIcon = ({ className }: Props) => {
  return (
    <div className={`rotate-45 ${className}`}>
      <MdAirplanemodeActive className="text-slate-600" size="1.35em" />
    </div>
  );
};

export default OverseasPlayerIcon;
