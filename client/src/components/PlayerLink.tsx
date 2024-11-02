import { Link } from "react-router-dom";

interface Props {
  name: string;
  className?: string;
}

const PlayerLink = ({ name, className = "" }: Props) => {
  return (
    <Link to="#" className={`text-blue-600 hover:underline ${className}`}>
      {name}
    </Link>
  );
};

export default PlayerLink;
