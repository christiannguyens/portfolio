import type { Metadata } from "next";
import { WallAdmin } from "@/components/wall/WallAdmin";

export const metadata: Metadata = {
  title: "Wall admin",
  robots: { index: false, follow: false },
};

export default function WallAdminPage() {
  return <WallAdmin />;
}
