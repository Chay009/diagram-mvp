import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diagram Editor",
  description: "Create beautiful diagrams with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.NodeNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
