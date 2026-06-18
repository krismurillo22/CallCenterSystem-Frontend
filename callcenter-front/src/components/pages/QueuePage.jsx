import React from "react";
import CallQueuePanel from "../calls/CallQueuePanel";

export default function QueuePage({ queue, calls, employees, onDispatch }) {
  return (
    <div className="flex flex-col gap-6 max-w-7xl">
      <CallQueuePanel queue={queue} calls={calls} employees={employees} onDispatch={onDispatch} />
    </div>
  );
}