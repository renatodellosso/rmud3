"use client";

import "styles/global.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <title>RMUD3</title>
      <body>{children}</body>
    </html>
  );
}
