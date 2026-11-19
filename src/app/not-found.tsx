import Link from "next/link";
import { ICONS } from "@/lib/pixel";
import { PixelGlyph } from "@/components/ui/PixelGlyph";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col items-start justify-center pt-24">
      <PixelGlyph rows={ICONS.box} size={6} className="text-accent" />
      <p className="label mt-8">Error 404</p>
      <h1 className="mt-4 text-[clamp(2.4rem,6vw,4.5rem)] font-medium leading-none tracking-[-0.045em]">
        Nothing&apos;s been built here yet.
      </h1>
      <Link href="/" className="mt-10 inline-flex h-11 items-center bg-paper px-5 text-[14px] font-medium text-ink hover:bg-accent">
        Back home
      </Link>
    </section>
  );
}
