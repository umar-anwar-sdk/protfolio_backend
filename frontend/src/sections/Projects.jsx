import { ArrowUpRight, Github } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatedBorderButton } from "@/components/AnimatedBorderButton";
import { getAssetUrl } from "@/api/client";
import { useEffect, useState } from "react";

function Carousel({ items = [], onCardClick } = {}) {
  const [start, setStart] = useState(0);
  const [cols, setCols] = useState(2);
  const [rows, setRows] = useState(2);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) {
        setCols(2);
        setRows(2);
      } else if (w >= 768) {
        setCols(2);
        setRows(1);
      } else {
        setCols(1);
        setRows(1);
      }
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const step = Math.max(1, cols * rows);
    const id = setInterval(() => setStart((s) => (s + step) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length, cols, rows]);

  if (!items.length) return null;

  const total = items.length;
  const perSlide = Math.max(1, cols * rows);
  const pages = Math.max(1, Math.ceil(total / perSlide));
  const currentPage = Math.floor(start / perSlide) % pages;

  function prev() {
    setStart((s) => (s - perSlide + total) % total);
  }
  function next() {
    setStart((s) => (s + perSlide) % total);
  }

  const visible = [];
  for (let i = 0; i < Math.min(perSlide, total); i++) {
    visible.push(items[(start + i) % total]);
  }

  return (
    <div className="relative">
      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {visible.map((item) => (
          <div key={item.slug || item.id} className="group glass rounded-2xl overflow-hidden">
            <div className="relative overflow-hidden aspect-video">
              <img
                src={getAssetUrl(item.thumbnail_image || item.images?.[0]?.image || "/hero-bg.jpg")}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => { e.currentTarget.src = "/hero-bg.jpg"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={(e) => { e.stopPropagation(); onCardClick?.(item.slug); }} className="p-3 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </button>
                {item.github_url && (
                  <a onClick={(e) => e.stopPropagation()} href={item.github_url} target="_blank" rel="noreferrer" className="p-3 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-all">
                    <Github className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <p className="text-muted-foreground text-sm">{item.short_description || item.description}</p>
              <div className="flex flex-wrap gap-2">
                {(item.technologies || []).slice(0, 4).map((tag, tagIdx) => (
                  <span key={tag.id || tag.name || tagIdx} className="px-4 py-1.5 rounded-full bg-surface text-xs font-medium border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300">
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <button onClick={prev} className="rounded-full glass p-2">Prev</button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button onClick={next} className="rounded-full glass p-2">Next</button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} onClick={() => setStart(i * perSlide)} className={`w-2 h-2 rounded-full ${i === currentPage ? "bg-primary" : "bg-muted-foreground/30"}`} />
        ))}
      </div>
    </div>
  );
}

export const Projects = ({ projects = [] }) => {
  const visible = projects.filter((p) => p.is_published !== false);
  const featured = visible.filter((p) => p.featured).slice(0,4);
  let selected = featured;
  if (selected.length < 4) {
    const fill = visible.filter((p) => !p.featured).slice(0, 4 - selected.length);
    selected = [...selected, ...fill];
  }

  const navigate = useNavigate();

  return (
    <section id="projects" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mx-auto max-w-3xl mb-16">
          <span className="text-secondary-foreground text-sm font-medium tracking-wider uppercase animate-fade-in">Featured Work</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 animate-fade-in animation-delay-100 text-secondary-foreground">Projects that <span className="font-serif italic font-normal text-white"> make an impact.</span></h2>
        </div>

        {selected.length === 0 ? (
          <div className="text-center text-muted-foreground glass rounded-2xl p-10">No projects are available right now.</div>
        ) : (
          <div className="mx-auto">
            <Carousel items={selected} onCardClick={(slug) => navigate(`/projects/${slug}`)} />
            <div className="text-center mt-8">
              <Link to="/projects">
                <AnimatedBorderButton>View All Projects <ArrowUpRight className="w-5 h-5" /></AnimatedBorderButton>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
