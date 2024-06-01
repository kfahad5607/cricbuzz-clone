import SquadPlayerListItem from "./SquadPlayerListItem";

const squads = [
  {
    _id: "6658a3ec2464753df1d6c489",
    matchId: 1,
    teams: [
      {
        teamId: 1,
        players: [
          {
            playerId: 1,
            isPlaying: true,
            isCaptain: true,
          },
          {
            playerId: 2,
            isPlaying: true,
          },
          {
            playerId: 3,
            isPlaying: true,
          },
          {
            playerId: 4,
            isPlaying: true,
          },
          {
            playerId: 5,
            isPlaying: true,
          },
          {
            playerId: 6,
            isPlaying: true,
            isForeignPlayer: true,
          },
          {
            playerId: 7,
            isPlaying: true,
            isKeeper: true,
          },
          {
            playerId: 8,
            isPlaying: true,
            isForeignPlayer: true,
          },
          {
            playerId: 9,
            isPlaying: true,
          },
          {
            playerId: 10,
            isPlaying: true,
          },
          {
            playerId: 11,
            isPlaying: true,
          },
          {
            playerId: 12,
            isPlaying: false,
          },
          {
            playerId: 13,
            isPlaying: false,
          },
          {
            playerId: 14,
            isPlaying: false,
          },
          {
            playerId: 15,
            isPlaying: false,
          },
        ],
      },
      {
        teamId: 2,
        players: [
          {
            playerId: 16,
            isPlaying: true,
            isCaptain: true,
          },
          {
            playerId: 17,
            isPlaying: true,
            isForeignPlayer: true,
          },
          {
            playerId: 18,
            isPlaying: true,
          },
          {
            playerId: 19,
            isPlaying: true,
            isForeignPlayer: true,
          },
          {
            playerId: 20,
            isPlaying: true,
          },
          {
            playerId: 21,
            isPlaying: true,
          },
          {
            playerId: 22,
            isPlaying: true,
            isKeeper: true,
          },
          {
            playerId: 23,
            isPlaying: true,
          },
          {
            playerId: 24,
            isPlaying: true,
          },
          {
            playerId: 25,
            isPlaying: true,
          },
          {
            playerId: 26,
            isPlaying: true,
          },
          {
            playerId: 27,
            isPlaying: true,
          },
          {
            playerId: 28,
            isPlaying: true,
          },
          {
            playerId: 29,
            isPlaying: true,
          },
          {
            playerId: 30,
            isPlaying: false,
          },
        ],
      },
    ],
    __v: 0,
  },
];

const SquadsTab = () => {
  return (
    <div>
      <div className="text-center font-medium text-lg px-2 py-2">
        Playing XI
      </div>
      <div className="flex">
        <div className="w-1/2 border-r border-gray-300">
          {squads[0].teams[0].players.map((player) => (
            <SquadPlayerListItem key={player.playerId} player={player} />
          ))}
        </div>
        <div className="w-1/2 border-l border-gray-300">
          {squads[0].teams[1].players.map((player) => (
            <SquadPlayerListItem
              key={player.playerId}
              player={player}
              reversed
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SquadsTab;
