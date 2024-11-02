import { useEffect, useState } from "react";

interface Props {
  time: number;
}

const padNumber = (num: number) => {
  return num.toString().padStart(2, "0");
};

const CountDown = ({ time }: Props) => {
  const [timeLeft, setTimeLeft] = useState(time - 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t < 1) {
          clearInterval(interval);
          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (time <= 0) return null;

  const minutes = timeLeft % 3600;
  const hoursLeft = (timeLeft - minutes) / 3600;
  const seconds = minutes % 60;
  const minutesLeft = (minutes - seconds) / 60;

  return (
    <div className="flex items-baseline font-semibold mb-6">
      <div className="text-4xl">
        {padNumber(hoursLeft)}:{padNumber(minutesLeft)}
      </div>
      <div className="text-lg ml-1">{padNumber(seconds)}</div>
    </div>
  );
};

export default CountDown;
