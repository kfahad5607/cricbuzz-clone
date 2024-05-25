import MatchPreviewCard from "../components/MatchPreviewCard";

const data = [
  {
    id: 1,
    slug: "csk-vs-rcb-final-indian-premier-league-2024",
    description: "Final",
    matchFormat: "t20",
    startTime: "2024-05-25T15:28:07.727Z",
    status: "",
    series: {
      title: "Indian Premier League 2024",
    },
    homeTeam: {
      name: "Chennai Super Kings",
      shortName: "CSK",
    },
    awayTeam: {
      name: "Royal Challengers Bengaluru",
      shortName: "RCB",
    },
  },
  {
    id: 17,
    slug: "csk-vs-rcb-5th-match-indian-premier-league-2024",
    description: "5th Match",
    matchFormat: "t20",
    startTime: "2024-05-25T15:48:34.000Z",
    status: "",
    series: {
      title: "Indian Premier League 2024",
    },
    homeTeam: {
      name: "Chennai Super Kings",
      shortName: "CSK",
    },
    awayTeam: {
      name: "Royal Challengers Bengaluru",
      shortName: "RCB",
    },
  },
  {
    id: 3,
    slug: "csk-vs-rcb-1st-match-indian-premier-league-2024",
    description: "1st Match",
    matchFormat: "t20",
    startTime: "2024-05-25T15:48:34.000Z",
    status: "",
    series: {
      title: "Indian Premier League 2024",
    },
    homeTeam: {
      name: "Chennai Super Kings",
      shortName: "CSK",
    },
    awayTeam: {
      name: "Royal Challengers Bengaluru",
      shortName: "RCB",
    },
  },
  {
    id: 5,
    slug: "csk-vs-rcb-2nd-match-indian-premier-league-2024",
    description: "2nd Match",
    matchFormat: "t20",
    startTime: "2024-05-25T15:48:34.000Z",
    status: "",
    series: {
      title: "Indian Premier League 2024",
    },
    homeTeam: {
      name: "Chennai Super Kings",
      shortName: "CSK",
    },
    awayTeam: {
      name: "Royal Challengers Bengaluru",
      shortName: "RCB",
    },
  },
  {
    id: 6,
    slug: "csk-vs-rcb-3rd-match-indian-premier-league-2024",
    description: "3rd Match",
    matchFormat: "t20",
    startTime: "2024-05-25T15:48:34.000Z",
    status: "",
    series: {
      title: "Indian Premier League 2024",
    },
    homeTeam: {
      name: "Chennai Super Kings",
      shortName: "CSK",
    },
    awayTeam: {
      name: "Royal Challengers Bengaluru",
      shortName: "RCB",
    },
  },
];

const HomePage = () => {
  return (
    <div className=" ">
      <div className="flex gap-3 overflow-auto">
        {data.map((match) => (
          <MatchPreviewCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
