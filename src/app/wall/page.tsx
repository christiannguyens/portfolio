import type { Metadata } from "next";
import { Caveat, Homemade_Apple, Permanent_Marker, Reenie_Beanie, Sacramento } from "next/font/google";
import { WallClient } from "@/components/wall/WallClient";

const caveat = Caveat({ subsets: ["latin"], weight: ["500"], variable: "--font-sig-caveat" });
const apple = Homemade_Apple({ subsets: ["latin"], weight: "400", variable: "--font-sig-apple" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-sig-marker" });
const reenie = Reenie_Beanie({ subsets: ["latin"], weight: "400", variable: "--font-sig-reenie" });
const sacramento = Sacramento({ subsets: ["latin"], weight: "400", variable: "--font-sig-sacramento" });

export const metadata: Metadata = {
  title: "The Wall",
  description: "A wall of polaroids from everyone who's stopped by. Take a photo, sign it, and pin it up.",
  alternates: { canonical: "/wall" },
};

const fonts = [
  { label: "Caveat", family: caveat.style.fontFamily, scale: 1 },
  { label: "Homemade Apple", family: apple.style.fontFamily, scale: 0.62 },
  { label: "Permanent Marker", family: marker.style.fontFamily, scale: 0.72 },
  { label: "Reenie Beanie", family: reenie.style.fontFamily, scale: 1.15 },
  { label: "Sacramento", family: sacramento.style.fontFamily, scale: 1.05 },
];

export default function WallPage() {
  return (
    <div className={[caveat.variable, apple.variable, marker.variable, reenie.variable, sacramento.variable].join(" ")}>
      <WallClient fonts={fonts} handFont={caveat.style.fontFamily} />
    </div>
  );
}
