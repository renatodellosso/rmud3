import "styles/global.css";

export const metadata = {
  title: "RMUD3",
  description: "Renato's Multi-User Dungeon 3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
