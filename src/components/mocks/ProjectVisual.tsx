import Image from "next/image";
import type { Project } from "@/data/projects";
import { CampusBorrowMock } from "./CampusBorrowMock";
import { PoolMock } from "./PoolMock";
import { PortableDashMock } from "./PortableDashMock";

/**
 * Shows a project's real cover image when one exists in projects.ts,
 * otherwise falls back to its illustrative mockup.
 */
export function ProjectVisual({
  project,
  interactive = false,
  priority = false,
}: {
  project: Project;
  interactive?: boolean;
  priority?: boolean;
}) {
  if (project.cover) {
    return (
      <Image
        src={project.cover.src}
        alt={project.cover.alt}
        width={project.cover.width}
        height={project.cover.height}
        priority={priority}
        sizes="(min-width: 1024px) 1100px, 100vw"
        className="h-auto w-full"
      />
    );
  }
  switch (project.mock) {
    case "portabledash":
      return <PortableDashMock controls={interactive} />;
    case "campusborrow":
      return <CampusBorrowMock />;
    case "pool":
      return <PoolMock />;
    default:
      return <div className="aspect-[16/10] w-full border border-line bg-ink-2" />;
  }
}
