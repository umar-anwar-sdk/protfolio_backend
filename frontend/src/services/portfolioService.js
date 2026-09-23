import { apiRequest } from "@/api/client";

async function safeFetch(path, fallback = null) {
  try {
    return await apiRequest(path);
  } catch (error) {
    if (error?.status === 404) {
      return fallback;
    }
    throw error;
  }
}

export async function fetchProfile() {
  return safeFetch("/api/profile/", null);
}

export async function fetchAbout() {
  return safeFetch("/api/about/", null);
}

export async function fetchSkills() {
  const data = await safeFetch("/api/skills/", []);
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  return [];
}

export async function fetchSocialLinks() {
  const data = await safeFetch("/api/social-links/", []);
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  return [];
}

export async function fetchExperience() {
  const data = await safeFetch("/api/experience/", []);
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  return [];
}

export async function fetchEducation() {
  const data = await safeFetch("/api/education/", []);
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  return [];
}

export async function fetchTestimonials() {
  const data = await safeFetch("/api/testimonials/", []);
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  return [];
}

export async function fetchContactInfo() {
  return safeFetch("/api/contact/", null);
}

export async function fetchProjects() {
  const data = await safeFetch("/api/projects/", []);
  if (Array.isArray(data)) return data;
  if (data && data.results) return data.results;
  return [];
}

export async function fetchPortfolioData() {
  // Use allSettled so a failure in one endpoint doesn't prevent other data from loading
  const callers = [
    fetchProfile,
    fetchAbout,
    fetchSkills,
    fetchSocialLinks,
    fetchExperience,
    fetchEducation,
    fetchTestimonials,
    fetchContactInfo,
    fetchProjects,
  ];

  const settled = await Promise.allSettled(callers.map((fn) => fn()));

  const fallbacks = [null, null, [], [], [], [], [], null, []];

  const [profile, about, skills, socialLinks, experience, education, testimonials, contactInfo, projects] = settled.map((r, i) =>
    r.status === "fulfilled" ? r.value : fallbacks[i]
  );

  return {
    profile,
    about,
    skills: Array.isArray(skills) ? skills : [],
    socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
    experience: Array.isArray(experience) ? experience : [],
    education: Array.isArray(education) ? education : [],
    testimonials: Array.isArray(testimonials) ? testimonials : [],
    contactInfo,
    projects: Array.isArray(projects) ? projects : [],
  };
}
