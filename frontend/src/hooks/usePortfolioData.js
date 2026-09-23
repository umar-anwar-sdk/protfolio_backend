import { useEffect, useState } from "react";
import { fetchPortfolioData } from "@/services/portfolioService";

export function usePortfolioData() {
  const [data, setData] = useState({
    profile: null,
    about: null,
    skills: [],
    socialLinks: [],
    experience: [],
    education: [],
    testimonials: [],
    contactInfo: null,
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const payload = await fetchPortfolioData();

        if (!active) return;
        setData(payload);
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load portfolio data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
