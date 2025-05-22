import React from "react";

export function Events({ events }: any) {
  return (
    <ul>
      {events.map((event: any, index: any) => (
        <li key={index}>{event}</li>
      ))}
    </ul>
  );
}
