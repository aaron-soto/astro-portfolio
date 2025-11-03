import { useEffect, useState } from "react";

export default function PhoenixTime() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const phoenixTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Phoenix",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());

      setTime(phoenixTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-foreground-muted text-lg">
      {time || "Loading..."} (MST)
    </span>
  );
}
