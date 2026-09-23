import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Navbar } from "@/layout/Navbar";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { Testimonials } from "@/sections/Testimonials";
import { Contact } from "@/sections/Contact";
import { Footer } from "./layout/Footer";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { AdminLoginPage } from "@/pages/AdminLoginPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { AdminSectionPage } from "@/pages/AdminSectionPage";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { usePortfolioData } from "@/hooks/usePortfolioData";
import { trackVisitorOnLoad } from "@/utils/visitorTracker";

function HomePage({ portfolio, loading, error }) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="glass rounded-3xl px-8 py-6 text-center">Loading portfolio…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar profile={portfolio.profile} socialLinks={portfolio.socialLinks} />
      <main>
        <Hero profile={portfolio.profile} hero={portfolio.profile} skills={portfolio.skills} socialLinks={portfolio.socialLinks} />
        <About profile={portfolio.profile} about={portfolio.about} />
        <Projects projects={portfolio.projects} />
        <Experience experience={portfolio.experience} education={portfolio.education} />
        <Testimonials testimonials={portfolio.testimonials} />
        <Contact contactInfo={portfolio.contactInfo} profile={portfolio.profile} />
      </main>
      <Footer profile={portfolio.profile} socialLinks={portfolio.socialLinks} />
      {error && (
        <div className="container mx-auto px-6 pb-6">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { data, loading, error } = usePortfolioData();

  useEffect(() => {
    trackVisitorOnLoad();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage portfolio={data} loading={loading} error={error} />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/:section" element={<AdminSectionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
