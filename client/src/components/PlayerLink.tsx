interface Props {
  name: string;
}

const PlayerLink = ({ name }: Props) => {
  return (
    <a href="#" className="text-blue-600 hover:underline">
      {name}
    </a>
  );
};

export default PlayerLink;
