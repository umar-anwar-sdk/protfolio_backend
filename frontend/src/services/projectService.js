const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function fetchProjectBySlug(slug) {
  const response = await fetch(`${API_BASE_URL}/api/projects/${slug}/`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Project could not be loaded.");
  }

  return response.json();
}
