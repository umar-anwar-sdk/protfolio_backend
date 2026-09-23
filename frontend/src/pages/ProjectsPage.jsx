import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { getAssetUrl } from "@/api/client";

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/api/projects/");

        if (!response.ok) {
          throw new Error("Projects could not be loaded.");
        }

        const data = await response.json();
        setProjects(Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load projects.");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-6">
          <div className="glass rounded-3xl p-10 text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to portfolio
          </Link>
        </div>

        <div className="mb-12 text-center">
          <p className="text-secondary-foreground text-sm font-medium tracking-wider uppercase">Selected work</p>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 text-secondary-foreground">All Projects</h1>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4">
          {['All','Web Development','AI','Python','React','WordPress'].map((cat)=> (
            <button key={cat} onClick={()=>setFilter(cat)} className={`px-4 py-2 rounded-full ${filter===cat? 'bg-primary text-primary-foreground':'glass text-muted-foreground'}`}>{cat}</button>
          ))}
        </div>

        {error ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">{error}</div>
        ) : projects.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-muted-foreground">No projects are available right now.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {projects
              .filter((project) => {
                if (!filter || filter === "All") return true;
                const techNames = (project.technologies || []).map((t) => t.name.toLowerCase());
                return techNames.includes(filter.toLowerCase());
              })
              .map((project, idx) => (
              <div key={project.slug || project.id || idx} className="group glass rounded-2xl overflow-hidden animate-fade-in" style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
                <div className="relative overflow-hidden aspect-video">
                  <img src={getAssetUrl(project.thumbnail_image || project.images?.[0]?.image || "/hero-bg.jpg")} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(event)=>{event.currentTarget.src='/hero-bg.jpg'}} />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link to={`/projects/${project.slug}`} className="p-3 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noreferrer" className="p-3 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-all">
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
                <div role="button" tabIndex={0} onClick={()=> window.location.href = `/projects/${project.slug}`} onKeyDown={(e)=>{ if(e.key==='Enter') window.location.href = `/projects/${project.slug}`}} className="p-6 space-y-4 cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{project.title}</h3>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                  <p className="text-muted-foreground text-sm">{project.short_description || project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.technologies || []).slice(0, 4).map((tag) => (
                      <span key={tag.id || tag.name} className="px-4 py-1.5 rounded-full bg-surface text-xs font-medium border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">View details <ArrowUpRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
