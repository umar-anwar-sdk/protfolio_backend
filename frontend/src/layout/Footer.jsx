import { Github, Linkedin, Twitter } from "lucide-react";

const iconMap = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
};

const footerLinks = [
  { href: "/#about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

export const Footer = ({ profile, socialLinks = [] }) => {
  const currentYear = new Date().getFullYear();
  const initials = (profile?.full_name || "PM")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <a href="#" className="text-xl font-bold tracking-tight">
              {initials || "PM"}<span className="text-primary">.</span>
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              © {currentYear} {profile?.full_name || "Portfolio"}. All rights reserved.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            {footerLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {(socialLinks || []).map((social) => {
              const Icon = iconMap[social.platform] || Github;
              return (
                <a key={social.id || social.platform} href={social.url} target="_blank" rel="noreferrer" aria-label={social.platform} className="p-2 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};
