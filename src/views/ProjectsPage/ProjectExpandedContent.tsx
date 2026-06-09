import type { PublicProjectDetail } from "@/data/projectUiMapper";
import {
  bodyParagraphs,
  projectBuildLabel,
} from "@/lib/projectMeta";
import { ExternalLink, Github } from "lucide-react";

export function ProjectExpandedContent({
  project,
}: {
  project: PublicProjectDetail;
}): JSX.Element {
  const paragraphs = bodyParagraphs(
    project.longDescription?.trim() || project.description || "",
  );
  const buildLabel = projectBuildLabel(project);

  return (
    <div className="space-y-6 text-sm leading-relaxed text-white/60">
      {paragraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}

      {project.technologies.length > 0 ? (
        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
            Tech stack
          </p>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-white/70"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.07] pt-5 text-xs">
        <span className="text-white/40">
          {project.buildKind === "custom" ? "Stack" : "Platform"}:{" "}
          <span className="text-white/75">{buildLabel}</span>
        </span>
        {project.cmsThemeName ? (
          <span className="text-white/40">
            Theme: <span className="text-white/75">{project.cmsThemeName}</span>
          </span>
        ) : null}
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#00BB7D]/90 transition-colors hover:text-[#00BB7D]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Live demo
          </a>
        ) : null}
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/45 transition-colors hover:text-white/75"
          >
            <Github className="h-3.5 w-3.5" />
            Source
          </a>
        ) : null}
      </div>
    </div>
  );
}
