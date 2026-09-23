import { Code2, Lightbulb, Rocket, Users, Brain, Database, Globe, Server, Cpu, Cloud, ShieldCheck, Book, Briefcase, Award, Zap } from "lucide-react";

const iconMap = {
  code2: Code2,
  rocket: Rocket,
  users: Users,
  lightbulb: Lightbulb,
  brain: Brain,
  database: Database,
  web: Globe,
  server: Server,
  cpu: Cpu,
  cloud: Cloud,
  security: ShieldCheck,
  education: Book,
  experience: Briefcase,
  award: Award,
  zap: Zap,
  react: Code2,
  python: Code2,
  django: Code2,
  api: Code2,
};

export const About = ({ profile, about }) => {
  const aboutData = about || { about: profile?.about || "", mission_quote: profile?.mission_quote || "" };
  const highlights = (about?.highlights || []).map((item) => ({
    ...item,
    icon: iconMap[item.icon_name?.toLowerCase()] || Code2,
  }));

  return (
    <section id="about" className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="animate-fade-in">
              <span className="text-secondary-foreground text-sm font-medium tracking-wider uppercase">
                About Me
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight animate-fade-in animation-delay-100 text-secondary-foreground">
              {aboutData?.about ? (
                <>
                  {aboutData.about.split(" ").slice(0, 4).join(" ")}
                  <span className="font-serif italic font-normal text-white">
                    {" "}
                    {aboutData.about.split(" ").slice(4).join(" ") || "one component at a time."}
                  </span>
                </>
              ) : (
                <>
                  Building the future,
                  <span className="font-serif italic font-normal text-white">
                    {" "}
                    one component at a time.
                  </span>
                </>
              )}
            </h2>

            <div className="space-y-4 text-muted-foreground animate-fade-in animation-delay-200">
              <p>{profile?.about || aboutData?.about || "I build products that matter."}</p>
              <p>{profile?.intro || "I create thoughtful digital experiences with a sharp focus on performance, usability, and maintainability."}</p>
              <p>{profile?.mission_quote || "I help teams turn ideas into high-quality products."}</p>
            </div>

            {aboutData?.mission_quote && (
              <div className="glass rounded-2xl p-6 glow-border animate-fade-in animation-delay-300">
                <p className="text-lg font-medium italic text-foreground">"{aboutData.mission_quote}"</p>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {(highlights.length ? highlights : [
              { title: "Clean Code", description: "Writing maintainable, scalable code that stands the test of time.", icon: Code2 },
              { title: "Performance", description: "Optimizing for speed and delivering lightning-fast user experiences.", icon: Rocket },
              { title: "Collaboration", description: "Working closely with teams to bring ideas to life.", icon: Users },
              { title: "Innovation", description: "Staying ahead with the latest technologies and best practices.", icon: Lightbulb },
            ]).map((item, idx) => (
              <div
                key={item.title || idx}
                className="glass p-6 rounded-2xl animate-fade-in"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 hover:bg-primary/20">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
