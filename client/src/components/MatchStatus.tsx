export type StatusColor = "yellow" | "red" | "blue";

interface Props {
  children: string;
  className?: string;
  color?: StatusColor;
  size?: "sm" | "lg";
}

const MatchStatus = ({
  children,
  className = "",
  color = "red",
  size = "lg",
}: Props) => {
  let classNames = className ? className + " " : "";

  if (color === "red") classNames += "text-red-600";
  else if (color === "yellow") classNames += "text-yellow-700";
  else if (color === "blue") classNames += "text-blue-700";

  if (size === "sm") classNames += " text-xs";
  else if (size === "lg") classNames += " text-sm";

  return <div className={classNames}>{children}</div>;
};

export default MatchStatus;
