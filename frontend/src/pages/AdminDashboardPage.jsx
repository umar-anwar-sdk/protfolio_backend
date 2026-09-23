import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, BriefcaseBusiness, FileText, House, Layers3, Link as LinkIcon, LogOut, MessageSquareText, Settings, ShieldCheck, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchDashboardOverview, fetchAdminMessages, fetchAdminProjects, fetchAdminVisitors } from "@/services/adminService";
import { getCurrentAdmin, logoutAdmin } from "@/services/authService";

const sections = [
  { name: "Dashboard", icon: House, slug: "dashboard" },
  { name: "Profile", icon: ShieldCheck, slug: "profile" },
  { name: "About", icon: FileText, slug: "about" },
  { name: "Skills", icon: Layers3, slug: "skills" },
  { name: "Experience", icon: BriefcaseBusiness, slug: "experience" },
  { name: "Education", icon: FileText, slug: "education" },
  { name: "Projects", icon: Layers3, slug: "projects" },
  { name: "Social Links", icon: LinkIcon, slug: "social-links" },
  { name: "Messages", icon: MessageSquareText, slug: "messages" },
  { name: "Contact Information", icon: MessageSquareText, slug: "contact-information" },
  { name: "Visitors", icon: Users, slug: "visitors" },
  { name: "CV", icon: FileText, slug: "cv" },
  { name: "Settings", icon: Settings, slug: "settings" },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [summary, messageData, projectData, visitorData, admin] = await Promise.all([
          fetchDashboardOverview(),
          fetchAdminMessages().catch(() => []),
          fetchAdminProjects().catch(() => []),
          fetchAdminVisitors().catch(() => []),
          getCurrentAdmin().catch(() => null),
        ]);

        setOverview(summary);
        setMessages(messageData || []);
        setProjects(projectData?.results || projectData || []);
        setVisitors(visitorData || []);
        setAdminUser(admin);
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate("/admin/login");
  };

  const stats = [
    { label: "Total Projects", value: overview?.total_projects ?? 0, accent: "text-primary" },
    { label: "Total Visitors", value: overview?.total_visitors ?? 0, accent: "text-primary" },
    { label: "Today's Visitors", value: overview?.today_visitors ?? 0, accent: "text-highlight" },
    { label: "Total Messages", value: overview?.total_messages ?? 0, accent: "text-primary" },
    { label: "Unread Messages", value: overview?.unread_messages ?? 0, accent: "text-red-400" },
    { label: "CV Downloads", value: overview?.cv_downloads ?? 0, accent: "text-primary" },
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="glass rounded-3xl p-10 text-center">Loading dashboard…</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="glass rounded-3xl border border-primary/20 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-primary">Portfolio Administrator</p>
              <h1 className="mt-3 text-3xl font-bold text-secondary-foreground">Custom admin dashboard</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
                {adminUser?.username || "Admin"}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:border-primary/40"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <nav className="glass rounded-2xl border border-border p-4">
          <div className="flex flex-wrap gap-3">
            {sections.map(({ name, icon: Icon, slug }) => (
              <Link key={name} to={slug === "dashboard" ? "/admin" : `/admin/${slug}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                <Icon className="h-4 w-4" />
                {name}
              </Link>
            ))}
          </div>
        </nav>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl border border-border p-5">
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className={`mt-3 text-3xl font-bold ${stat.accent}`}>{stat.value}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-3xl border border-border p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-secondary-foreground">Recent messages</h2>
              <Link to="/admin/messages" className="inline-flex items-center gap-2 text-sm text-primary">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {(messages || []).slice(0, 4).map((message) => (
                <div key={message.id} className="rounded-2xl border border-border bg-surface/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{message.name}</div>
                      <div className="text-sm text-muted-foreground">{message.email}</div>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs text-primary">{message.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{message.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl border border-border p-6">
            <h2 className="text-xl font-semibold text-secondary-foreground">Quick management</h2>
            <div className="mt-5 space-y-3">
              {sections.filter(({ slug }) => slug !== "dashboard").map(({ name, slug }) => (
                <Link key={name} to={`/admin/${slug}`} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
                  <span>{name}</span>
                  <span className="text-primary">Manage</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="glass rounded-3xl border border-border p-6">
            <h2 className="text-xl font-semibold text-secondary-foreground">Projects</h2>
            <div className="mt-4 space-y-3">
              {(projects || []).slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                  <div>
                    <div className="font-medium text-foreground">{project.title}</div>
                    <div className="text-sm text-muted-foreground">{project.short_description}</div>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-primary">{project.featured ? "Featured" : "Draft"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl border border-border p-6">
            <h2 className="text-xl font-semibold text-secondary-foreground">Recent visitors</h2>
            <div className="mt-4 space-y-3">
              {(visitors || []).slice(0, 4).map((visitor) => (
                <div key={visitor.id} className="rounded-xl border border-border bg-surface px-4 py-3">
                  <div className="text-sm text-muted-foreground">{visitor.path || "Unknown page"}</div>
                  <div className="mt-1 text-sm text-foreground">{visitor.ip_address || "Anonymous"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
