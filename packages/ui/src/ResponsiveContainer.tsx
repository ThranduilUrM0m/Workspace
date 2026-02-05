import * as React from "react";

export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto px-4 sm:px-6 lg:px-8 container">{children}</div>;
}
export default ResponsiveContainer;