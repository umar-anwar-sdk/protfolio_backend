import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SectionsCarousel({ sections = [] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!sections.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % sections.length), 5500);
    return () => clearInterval(id);
  }, [sections.length]);

  if (!sections.length) return null;

  const prev = () => setIdx((i) => (i - 1 + sections.length) % sections.length);
  const next = () => setIdx((i) => (i + 1) % sections.length);

  const s = sections[idx];

  return (
    <div className="relative">
      <div className="glass rounded-3xl p-6 grid lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-secondary-foreground">{s.heading}</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
        </div>

        {s.image && (
          <div className="overflow-hidden rounded-2xl">
            <img src={s.image} alt={s.heading} className="w-full h-full object-cover rounded-2xl" />
          </div>
        )}
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2">
        <button onClick={prev} className="rounded-full glass p-2"><ArrowLeft className="w-4 h-4" /></button>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button onClick={next} className="rounded-full glass p-2"><ArrowRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
