import { About } from "@/components/about/About";
import { Contact } from "@/components/contact/Contact";
import { Experience } from "@/components/experience/Experience";
import { Hero } from "@/components/hero/Hero";
import { InfoStrip } from "@/components/hero/InfoStrip";
import { Projects } from "@/components/projects/Projects";
import { Stack } from "@/components/stack/Stack";
import { site } from "@/data/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.emails[0].address}`,
  alumniOf: { "@type": "CollegeOrUniversity", name: site.education.school },
  address: { "@type": "PostalAddress", addressLocality: "St. Louis", addressRegion: "MO", addressCountry: "US" },
  sameAs: [site.socials.github.href, site.socials.linkedin.href],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero>
        <InfoStrip />
      </Hero>
      <About />
      <Projects />
      <Experience />
      <Stack />
      <Contact />
    </>
  );
}
