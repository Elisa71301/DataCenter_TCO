import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ToasterProvider from "@/providers/ToasterProvider";
import { TCOProvider } from "./context/useContext";
import { ScenarioProvider } from "./context/scenarioContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Center TCO Calculator",
  description:
    "Scenario-driven TCO calculator for data centers - A research artifact for comparative analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToasterProvider />
        <TCOProvider>
          <ScenarioProvider>{children}</ScenarioProvider>
        </TCOProvider>
      </body>
    </html>
  );
}
