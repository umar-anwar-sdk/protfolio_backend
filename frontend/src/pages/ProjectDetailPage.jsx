import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/Button";
import SectionsCarousel from "@/components/SectionsCarousel";
import { fetchProjectBySlug } from "@/services/projectService";

function splitText(text = "") {
  return text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export const ProjectDetailPage = () => {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProject = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchProjectBySlug(slug);
        if (active) setProject(data);
      } catch (err) {
        if (active) setError(err.message || "Project not found.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProject();

    return () => {
      active = false;
    };
  }, [slug]);

  const heroImage = useMemo(() => {
    if (!project) return "/hero-bg.jpg";
    return project.thumbnail_image || project.images?.[0]?.image || "/hero-bg.jpg";
  }, [project]);

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="glass rounded-3xl p-10 text-center max-w-2xl mx-auto">
            <p className="text-secondary-foreground text-sm uppercase tracking-wider">
              Project not found
            </p>
            <h1 className="text-4xl font-bold mt-4 mb-6 text-secondary-foreground">
              This project is unavailable.
            </h1>
            <p className="text-muted-foreground mb-8">
              {error || "The requested project could not be found or is not published yet."}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-5 h-5" />
                Back to portfolio
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const featureList = splitText(project.features);
  const detailList = splitText(project.development_details);

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to portfolio
          </Link>
        </div>

        <section className="relative overflow-hidden glass rounded-3xl border border-primary/20">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img src={heroImage} alt={project.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          <div className="absolute top-6 right-6 flex items-center gap-3">
            {project.project_url && (
              <a href={project.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 border border-border hover:border-primary transition">
                <span>Live</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 border border-border hover:border-primary transition">
                <span>GitHub</span>
                <Github className="w-4 h-4" />
              </a>
            )}
          </div>
        </section>

        <section className="mt-12 grid lg:grid-cols-[1.4fr_0.6fr] gap-10">
          <div className="space-y-8">
            <div>
              <p className="text-secondary-foreground text-sm font-medium tracking-wider uppercase animate-fade-in">
                Featured project
              </p>
              <h1 className="text-4xl md:text-5xl font-bold mt-4 text-secondary-foreground">
                {project.title}
              </h1>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-secondary-foreground">
                Overview
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {project.overview || project.short_description}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-secondary-foreground">
                Project description
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {featureList.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-secondary-foreground">
                  Features
                </h2>
                <ul className="space-y-3">
                  {featureList.map((feature, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {detailList.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-secondary-foreground">
                  Development details
                </h2>
                <ul className="space-y-3">
                  {detailList.map((detail, idx) => (
                    <li key={idx} className="flex gap-3 text-muted-foreground">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-secondary-foreground">
                Project links
              </h3>
              <div className="space-y-3">
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground hover:border-primary/50 transition-colors"
                  >
                    <span>Live project</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground hover:border-primary/50 transition-colors"
                  >
                    <span>GitHub</span>
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {!project.project_url && !project.github_url && (
                  <p className="text-sm text-muted-foreground">No public links available.</p>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-secondary-foreground">
                Tech stack
              </h3>
              {project.technologies && project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech.id}
                      className="px-3 py-1.5 rounded-full bg-surface text-xs font-medium border border-border/50 text-muted-foreground"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No technologies listed for this project.</p>
              )}
            </div>
          </aside>
        </section>

        {project.images && project.images.length > 0 ? (
          <section className="mt-16 space-y-8">
            <div className="max-w-2xl">
              <p className="text-secondary-foreground text-sm font-medium tracking-wider uppercase">
                Screenshots
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 text-secondary-foreground">
                Visual walkthrough
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {project.images.map((image) => (
                <div key={image.id} className="glass rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={image.image}
                      alt={image.title || project.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    {image.title && <h3 className="text-lg font-semibold">{image.title}</h3>}
                    {image.description && <p className="text-sm text-muted-foreground">{image.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-16">
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-muted-foreground">
                No project screenshots have been added yet for this project.
              </p>
            </div>
          </section>
        )}

        {project.sections && project.sections.length > 0 && (
          <section className="mt-16 space-y-8">
            <div className="max-w-2xl">
              <p className="text-secondary-foreground text-sm font-medium tracking-wider uppercase">
                More details
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 text-secondary-foreground">
                Additional project insights
              </h2>
            </div>

            <SectionsCarousel sections={project.sections} />
          </section>
        )}

        <div className="mt-12 text-center">
          <Link to="/">
            <Button>
              <ArrowUpRight className="w-5 h-5" />
              Explore more work
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
};
