import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Code2, Brain, Database, Globe, Server, Cpu, Cloud, ShieldCheck, Book, Briefcase, Award } from "lucide-react";
import { getApiBaseUrl, getAssetUrl } from "@/api/client";
import { createAdminResource, deleteAdminResource, fetchAdminResource, updateAdminResource } from "@/services/adminService";

const sectionConfig = {
  profile: { label: "Profile", endpoint: "/api/admin/profile/" },
  about: { label: "About", endpoint: "/api/admin/about/" },
  skills: { label: "Skills", endpoint: "/api/admin/skills/" },
  highlights: { label: "About Highlights", endpoint: "/api/admin/highlights/" },
  experience: { label: "Experience", endpoint: "/api/admin/experience/" },
  education: { label: "Education", endpoint: "/api/admin/education/" },
  projects: { label: "Projects", endpoint: "/api/admin/projects/" },
  "social-links": { label: "Social Links", endpoint: "/api/admin/social-links/" },
  messages: { label: "Messages", endpoint: "/api/admin/messages/" },
  visitors: { label: "Visitors", endpoint: "/api/admin/visitors/" },
  cv: { label: "CV", endpoint: "/api/admin/profile/" },
  settings: { label: "Settings", endpoint: "/api/admin/profile/" },
};

const emptyForms = {
  profile: {
    full_name: "",
    role: "",
    headline: "",
    intro: "",
    mission_quote: "",
    years_experience: 5,
    availability_text: "",
    is_available: true,
    is_published: true,
    profile_image: "",
    background_image: "",
    cv_file: "",
  },
  about: {
    about: "",
    mission_quote: "",
  },
  highlights: {
    about: "",
    title: "",
    description: "",
    icon_name: "code2",
    sort_order: 0,
    is_active: true,
  },
  skills: {
    name: "",
    sort_order: 0,
    is_active: true,
  },
  experience: {
    period: "",
    role: "",
    company: "",
    description: "",
    current: false,
    sort_order: 0,
    is_active: true,
  },
  education: {
    institution: "",
    degree: "",
    description: "",
    start_date: "",
    end_date: "",
    sort_order: 0,
    is_active: true,
  },
  projects: {
    title: "",
    short_description: "",
    description: "",
    overview: "",
    featured: false,
    is_published: true,
    thumbnail_image: "",
    project_url: "",
    github_url: "",
  },
  "social-links": {
    platform: "",
    url: "",
    is_active: true,
    sort_order: 0,
  },
  messages: {
    admin_notes: "",
    status: "new",
  },
  visitors: {},
  cv: {},
  settings: {},
};

const requiredFieldsBySection = {
  profile: ["full_name", "role", "headline", "intro", "years_experience", "availability_text"],
  "social-links": ["platform", "url"],
  hero: ["full_name", "role", "headline", "intro"],
  about: ["about"],
  highlights: ["about", "title", "description"],
  skills: ["name"],
  experience: ["period", "role", "company", "description"],
  education: ["institution", "degree"],
  projects: ["title", "short_description", "description"],
};

const numberFieldNames = new Set(["years_experience", "sort_order", "order", "min", "max"]);
const emailFieldNames = new Set(["email"]);
const urlFieldNames = new Set(["url", "project_url", "github_url"]);
const fileFieldNames = new Set(["profile_image", "background_image", "cv_file", "thumbnail_image", "image", "avatar"]);
const textareaFieldNames = new Set(["intro", "about", "description", "mission_quote", "overview", "features", "development_details", "content", "admin_notes"]);

function normalizeFieldError(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value[0] || "";
  if (typeof value === "string") return value;
  return String(value);
}

function getFieldLabel(key) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFieldType(fieldName, value) {
  if (fileFieldNames.has(fieldName)) return "file";
  if (emailFieldNames.has(fieldName)) return "email";
  if (urlFieldNames.has(fieldName)) return "url";
  if (fieldName.toLowerCase().includes("date")) return "date";
  if (fieldName.toLowerCase().includes("phone") || numberFieldNames.has(fieldName)) return "number";
  if (typeof value === "boolean") return "checkbox";
  if (textareaFieldNames.has(fieldName)) return "textarea";
  return "text";
}

function validateFieldValue(fieldName, value, section) {
  const requiredFields = requiredFieldsBySection[section] || [];
  const textValue = typeof value === "string" ? value.trim() : value;

  if (requiredFields.includes(fieldName) && (value === null || value === undefined || textValue === "" || (value instanceof File && !value.name))) {
    return `${getFieldLabel(fieldName)} is required`;
  }

  if (value === "" || value === null || value === undefined) {
    return "";
  }

  if (fieldName === "email" || fieldName.toLowerCase().includes("email")) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(value))) {
      return "Please enter a valid email address";
    }
  }

  if (getFieldType(fieldName, value) === "number" && value !== "") {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return `${getFieldLabel(fieldName)} must be a valid number`;
    }
    if (fieldName === "years_experience" && numericValue < 0) {
      return "Years of experience cannot be negative";
    }
  }

  return "";
}

export function AdminSectionPage() {
  const navigate = useNavigate();
  const { section } = useParams();
  const config = sectionConfig[section] || { label: "Section", endpoint: "/api/admin/dashboard/" };
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(emptyForms[section] || {});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  // About highlights state (managed inside About section)
  const [highlights, setHighlights] = useState([]);
  const [highlightForm, setHighlightForm] = useState({ about: '', title: "", description: "", icon_name: "code2", sort_order: 0, is_active: true });
  const [selectedHighlight, setSelectedHighlight] = useState(null);
  const [highlightErrors, setHighlightErrors] = useState({});
  const [highlightsLoading, setHighlightsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchAdminResource(config.endpoint);
        const normalized = Array.isArray(data) ? data : data?.results || data?.items || [];
        if (active) {
          setItems(normalized);
          // If this is the Profile section and a single profile exists, auto-fill the form
          if (section === 'profile' && Array.isArray(normalized) && normalized.length === 1) {
            const profileItem = normalized[0];
            setSelectedItem(profileItem);
            setForm((prev) => ({ ...prev, ...profileItem }));
          } else {
            // For all other sections (or if multiple/no profiles), reset the form and selection
            setForm(emptyForms[section] || {});
            setSelectedItem(null);
          }
          // Clear highlight UI when switching sections
          setHighlights([]);
          setHighlightForm({ about: '', title: "", description: "", icon_name: "code2", sort_order: 0, is_active: true });
          setSelectedHighlight(null);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load section data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (section && sectionConfig[section]) {
      loadData();
      // load about highlights when in about section
      if (section === "about") {
        loadHighlights();
      }
    }

    return () => {
      active = false;
    };
  }, [section]);

  const isReadOnlySection = useMemo(() => ["messages", "visitors", "cv", "settings"].includes(section), [section]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function buildValidationErrors(nextForm) {
    const errors = {};
    Object.keys(nextForm || {}).forEach((fieldName) => {
      const message = validateFieldValue(fieldName, nextForm[fieldName], section);
      if (message) {
        errors[fieldName] = message;
      }
    });
    return errors;
  }

  // About highlights helpers
  async function loadHighlights() {
    setHighlightsLoading(true);
    try {
      const data = await fetchAdminResource('/api/admin/highlights/');
      const normalized = Array.isArray(data) ? data : data?.results || [];
      setHighlights(normalized);
    } catch (err) {
      // ignore quietly
    } finally {
      setHighlightsLoading(false);
    }
  }

  function updateHighlightField(name, value) {
    setHighlightForm((prev) => ({ ...prev, [name]: value }));
    setHighlightErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function saveHighlight(e) {
    e?.preventDefault();
    const required = ['about', 'title', 'description'];
    const errs = {};
    required.forEach((f) => {
      if (!highlightForm[f] || String(highlightForm[f]).trim() === '') errs[f] = `${getFieldLabel(f)} is required`;
    });
    if (Object.keys(errs).length) {
      setHighlightErrors(errs);
      return;
    }

    try {
      if (selectedHighlight) {
        await updateAdminResource(`/api/admin/highlights/${selectedHighlight.id}/`, highlightForm);
      } else {
        await createAdminResource('/api/admin/highlights/', highlightForm);
      }
      await loadHighlights();
      setSelectedHighlight(null);
      setHighlightForm({ about: '', title: '', description: '', icon_name: 'code2', sort_order: 0, is_active: true });
    } catch (err) {
      const apiErrors = err?.fields || {};
      setHighlightErrors(apiErrors || {});
    }
  }

  async function deleteHighlight(id) {
    if (!window.confirm('Delete this highlight?')) return;
    try {
      await deleteAdminResource(`/api/admin/highlights/${id}/`);
      await loadHighlights();
    } catch (err) {
      // ignore
    }
  }

  function buildFormData(nextForm) {
    const formData = new FormData();

    Object.entries(nextForm).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      if (fileFieldNames.has(key) && typeof value === "string") {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v === null || v === undefined || v === "") return;
          if (v instanceof File) {
            formData.append(key, v);
          } else {
            formData.append(key, String(v));
          }
        });
        return;
      }

      if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
        return;
      }

      if (value instanceof File) {
        formData.append(key, value);
        return;
      }

      formData.append(key, String(value));
    });

    return formData;
  }

  function buildProjectPayload(projectForm) {
    const writableFields = [
      "title",
      "slug",
      "short_description",
      "overview",
      "description",
      "features",
      "development_details",
      "project_url",
      "github_url",
      "featured",
      "is_published",
    ];
    const payload = writableFields.reduce((result, field) => {
      result[field] = projectForm[field] ?? "";
      return result;
    }, {});

    payload.technology_ids = (projectForm.technologies || []).map((technology) => technology.id);
    if (projectForm.thumbnail_image instanceof File) {
      payload.thumbnail_image = projectForm.thumbnail_image;
    }
    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isReadOnlySection) return;

    const nextErrors = buildValidationErrors(form);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      let payloadObj = { ...form };
      if (section === 'projects') {
        // The serializer accepts technology_ids, not nested technologies/images/sections.
        payloadObj = buildProjectPayload(form);
      }

      const payload = buildFormData(payloadObj);
      const hasFile = section === "projects"
        ? payloadObj.thumbnail_image instanceof File
        : Array.from(payload.entries()).some(([key]) => fileFieldNames.has(key));
      let requestPayload;
      if (hasFile) {
        requestPayload = payload;
      } else {
        requestPayload = Object.entries(payloadObj).reduce((acc, [k, v]) => {
          if (fileFieldNames.has(k) && typeof v === 'string') return acc;
          acc[k] = v;
          return acc;
        }, {});
      }

      if (selectedItem) {
        const detailPath = getDetailPath(selectedItem);
        if (section === "projects") {
          const isMultipart = requestPayload instanceof FormData;
          console.info("[Admin project update]", {
            projectId: selectedItem.id,
            projectSlug: selectedItem.slug,
            updateUrl: `${getApiBaseUrl()}${detailPath}`,
            method: "PATCH",
            contentType: isMultipart ? "multipart/form-data (browser boundary)" : "application/json",
            payload: isMultipart ? Object.fromEntries(requestPayload.entries()) : requestPayload,
          });
        }
        const updated = await updateAdminResource(detailPath, requestPayload);
        setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, ...updated } : item)));
      } else {
        const created = await createAdminResource(config.endpoint, requestPayload);
        setItems((prev) => [created, ...prev]);
      }
      setSelectedItem(null);
      setForm(emptyForms[section] || {});
      setFieldErrors({});
    } catch (err) {
      const apiErrors = err?.fields || {};
      const normalized = {};
      Object.entries(apiErrors).forEach(([fieldName, fieldValue]) => {
        normalized[fieldName] = normalizeFieldError(fieldValue);
      });
      setFieldErrors((prev) => ({ ...prev, ...normalized }));
      setError(err.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  function getDetailPath(item) {
    if (section === "projects") {
      if (!item?.slug) {
        throw new Error("This project is missing its API slug and cannot be opened or updated.");
      }
      return `${config.endpoint}${encodeURIComponent(item.slug)}/`;
    }

    return `${config.endpoint}${item.id}/`;
  }

  async function handleDelete(item) {
    if (!window.confirm("Delete this item?")) return;

    try {
      await deleteAdminResource(getDetailPath(item));
      setItems((prev) => prev.filter((currentItem) => currentItem.id !== item.id));
    } catch (err) {
      setError(err.message || "Unable to delete item.");
    }
  }

  async function startEdit(item) {
    setFieldErrors({});
    setError("");

    try {
      // Project detail URLs use the slug returned by the admin API, not the database ID.
      const detailPath = getDetailPath(item);
      if (section === "projects") {
        console.info("[Admin project detail load]", {
          projectId: item.id,
          projectSlug: item.slug,
          detailUrl: `${getApiBaseUrl()}${detailPath}`,
          method: "GET",
        });
      }
      const detailItem = await fetchAdminResource(detailPath);
      setSelectedItem(detailItem);
      setForm((prev) => ({ ...prev, ...detailItem }));
    } catch (err) {
      setError(err.message || "Unable to load this item for editing.");
    }
  }

  // Small helper components for Projects section
  function TechsPicker({ updateField, selectedTechs = [] }) {
    const [techs, setTechs] = useState([]);

    useEffect(() => {
      let active = true;
      async function load() {
        try {
          const data = await fetchAdminResource('/api/admin/technologies/');
          if (!active) return;
          const list = Array.isArray(data) ? data : data?.results || [];
          setTechs(list);
        } catch (err) {
          // ignore
        }
      }
      load();
      return () => { active = false; };
    }, []);

    function toggle(id) {
      const current = (form.technologies || []).slice();
      const found = current.find((t) => t.id === id);
      if (found) {
        updateField('technologies', current.filter((t) => t.id !== id));
      } else {
        const tech = techs.find((t) => t.id === id);
        if (tech) updateField('technologies', [...current, tech]);
      }
    }

    return (
      <div className="flex flex-wrap gap-2">
        {techs.map((t) => {
          const active = (form.technologies || []).some((s) => s.id === t.id);
          return (
            <button key={t.id} type="button" onClick={() => toggle(t.id)} className={`px-3 py-1.5 rounded-full border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface border-border text-muted-foreground'}`}>
              {t.name}
            </button>
          );
        })}
      </div>
    );
  }

  function ProjectFeatures({ featuresText, onChange }) {
    const [items, setItems] = useState((featuresText || '').split(/\n+/).map((s) => s.trim()).filter(Boolean));

    useEffect(() => { setItems((featuresText || '').split(/\n+/).map((s) => s.trim()).filter(Boolean)); }, [featuresText]);

    function addItem() {
      setItems((prev) => { const next = [...prev, '']; onChange(next.join('\n')); return next; });
    }
    function updateItem(idx, val) { const next = items.slice(); next[idx] = val; setItems(next); onChange(next.join('\n')); }
    function removeItem(idx) { const next = items.slice(); next.splice(idx,1); setItems(next); onChange(next.join('\n')); }

    return (
      <div>
        <div className="space-y-2">
          {items.map((it, idx) => (
            <div key={idx} className="flex gap-2">
              <input value={it} onChange={(e) => updateItem(idx, e.target.value)} className="flex-1 rounded-xl border border-border bg-background px-3 py-2" />
              <button type="button" onClick={() => removeItem(idx)} className="rounded-xl bg-red-500/10 px-3 py-1 text-red-300">Remove</button>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <button type="button" onClick={addItem} className="rounded-xl bg-primary px-3 py-2 text-primary-foreground">Add feature</button>
        </div>
      </div>
    );
  }

  function ProjectGallery({ projectItem }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    function onFiles(e) { setFiles(Array.from(e.target.files || [])); }

    async function uploadFiles() {
      if (!projectItem || !projectItem.id) { alert('Save project before uploading gallery images.'); return; }
      if (!files.length) return;
      setLoading(true);
      try {
        for (const f of files) {
          const fd = new FormData();
          fd.append('project', String(projectItem.id));
          fd.append('image', f);
          fd.append('title', '');
          fd.append('description', '');
          await createAdminResource('/api/admin/project-images/', fd);
        }
        // refresh project
        const refreshed = await fetchAdminResource(`/api/admin/projects/${projectItem.slug}/`);
        setSelectedItem(refreshed);
        setForm((prev) => ({ ...prev, ...refreshed }));
        setFiles([]);
      } catch (err) {
        alert(err.message || 'Upload failed');
      } finally { setLoading(false); }
    }

    async function deleteImage(id) {
      if (!window.confirm('Delete image?')) return;
      try {
        await deleteAdminResource(`/api/admin/project-images/${id}/`);
        const refreshed = await fetchAdminResource(`/api/admin/projects/${projectItem.slug}/`);
        setSelectedItem(refreshed);
        setForm((prev) => ({ ...prev, ...refreshed }));
      } catch (err) {
        // ignore
      }
    }

    return (
      <div>
        {(projectItem?.images || []).length > 0 && (
          <div className="grid gap-3 md:grid-cols-3 mb-3">
            {projectItem.images.map((img) => (
              <div key={img.id} className="rounded-xl border border-border bg-background overflow-hidden">
                <img src={img.image} alt={img.title || ''} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className="text-sm font-medium">{img.title || 'Untitled'}</div>
                  <div className="text-xs text-muted-foreground">{img.description}</div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => deleteImage(img.id)} className="rounded-xl bg-red-500/10 px-3 py-1 text-red-300">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input type="file" multiple accept="image/*" onChange={onFiles} />
          <button type="button" onClick={uploadFiles} disabled={loading} className="rounded-xl bg-primary px-3 py-2 text-primary-foreground">Upload</button>
        </div>
      </div>
    );
  }

  function ProjectSectionsEditor({ projectItem }) {
    const [formSec, setFormSec] = useState({ heading: '', content: '', image: null, order: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => { if (projectItem) setFormSec({ heading: '', content: '', image: null, order: (projectItem.sections?.length || 0) }); }, [projectItem]);

    function updateSecField(k, v) { setFormSec((p) => ({ ...p, [k]: v })); }

    async function addSection() {
      if (!projectItem || !projectItem.id) { alert('Save project before adding sections.'); return; }
      setLoading(true);
      try {
        const fd = new FormData();
        fd.append('project', String(projectItem.id));
        fd.append('heading', formSec.heading);
        fd.append('content', formSec.content);
        fd.append('order', String(formSec.order || 0));
        if (formSec.image instanceof File) fd.append('image', formSec.image);
        await createAdminResource('/api/admin/project-sections/', fd);
        const refreshed = await fetchAdminResource(`/api/admin/projects/${projectItem.slug}/`);
        setSelectedItem(refreshed);
        setForm((prev) => ({ ...prev, ...refreshed }));
        setFormSec({ heading: '', content: '', image: null, order: (refreshed.sections?.length || 0) });
      } catch (err) {
        alert(err.message || 'Unable to add section');
      } finally { setLoading(false); }
    }

    async function deleteSection(id) {
      if (!window.confirm('Delete section?')) return;
      try {
        await deleteAdminResource(`/api/admin/project-sections/${id}/`);
        const refreshed = await fetchAdminResource(`/api/admin/projects/${projectItem.slug}/`);
        setSelectedItem(refreshed);
        setForm((prev) => ({ ...prev, ...refreshed }));
      } catch (err) {}
    }

    return (
      <div>
        {(projectItem?.sections || []).length > 0 && (
          <div className="space-y-3 mb-3">
            {projectItem.sections.map((s) => (
              <div key={s.id} className="rounded-xl border border-border bg-background p-3 flex justify-between items-start">
                <div>
                  <div className="font-medium">{s.heading}</div>
                  <div className="text-xs text-muted-foreground">{s.content}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => deleteSection(s.id)} className="rounded-xl bg-red-500/10 px-3 py-1 text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-3">
          <input placeholder="Heading" value={formSec.heading} onChange={(e) => updateSecField('heading', e.target.value)} className="rounded-xl border border-border px-3 py-2" />
          <textarea placeholder="Content" value={formSec.content} onChange={(e) => updateSecField('content', e.target.value)} className="rounded-xl border border-border px-3 py-2" />
          <input type="file" accept="image/*" onChange={(e) => updateSecField('image', e.target.files?.[0] || null)} />
          <div className="flex items-center gap-2">
            <input type="number" min={0} value={formSec.order} onChange={(e) => updateSecField('order', Number(e.target.value))} className="rounded-xl border border-border px-3 py-2 w-24" />
            <button type="button" onClick={addSection} disabled={loading} className="rounded-xl bg-primary px-3 py-2 text-primary-foreground">Add section</button>
          </div>
        </div>
      </div>
    );
  }

  function renderListItem(item) {
    if (section === "social-links") {
      return (
        <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{(item.platform || item.id).toString().replace(/^[a-z]/, (c) => c.toUpperCase())}</p>
            <p className="truncate text-xs text-muted-foreground">{item.url || "No URL"}</p>
          </div>
          <div className="ml-3 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-end">
              <span className="text-xs">{item.is_active ? "Active" : "Inactive"}</span>
              <span className="text-xs">Order: {item.sort_order ?? 0}</span>
            </div>
            {!isReadOnlySection && (
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => handleDelete(item)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    const summary = Object.entries(item)
      .filter(([key]) => !["id", "created_at", "updated_at", "image", "avatar", "profile_image", "background_image", "cv_file"].includes(key))
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");

    return (
      <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{item.title || item.name || item.full_name || item.company || item.institution || item.email || item.id}</p>
          <p className="truncate text-xs text-muted-foreground">{summary || "No preview available"}</p>
        </div>
        {!isReadOnlySection && (
          <div className="ml-3 flex items-center gap-2">
            <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => handleDelete(item)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="glass rounded-3xl border border-border p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate("/admin")} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-primary">Admin</p>
                <h1 className="mt-2 text-2xl font-bold text-secondary-foreground">{config.label}</h1>
              </div>
            </div>
            {!isReadOnlySection && (
              <button type="button" onClick={() => { setSelectedItem(null); setForm(emptyForms[section] || {}); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                <Plus className="h-4 w-4" />
                Add {config.label}
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
        )}

        {!isReadOnlySection && (
          section === 'projects' ? (
            <section className="glass rounded-3xl border border-border p-6">
              <h2 className="text-lg font-semibold text-secondary-foreground">{selectedItem ? "Edit" : "Create"} Projects</h2>
              <div className="mt-5 space-y-6">
                {/* Project Image */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Project Image</h3>
                  <div className="space-y-3">
                    {typeof form.thumbnail_image === 'string' && form.thumbnail_image && (
                      <div className="overflow-hidden rounded-xl border border-border bg-surface p-2">
                        <img src={getAssetUrl(form.thumbnail_image)} alt={form.title || 'Thumbnail'} className="max-h-48 w-auto rounded-lg object-contain" />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => updateField('thumbnail_image', e.target.files?.[0] || '')} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                    {fieldErrors.thumbnail_image && <div className="text-xs text-red-300">{fieldErrors.thumbnail_image}</div>}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Basic Information</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm text-muted-foreground md:col-span-2">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Title</span>
                      <input value={form.title || ''} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                      {fieldErrors.title && <div className="mt-2 text-xs text-red-300">{fieldErrors.title}</div>}
                    </label>

                    <label className="block text-sm text-muted-foreground">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Slug</span>
                      <input value={form.slug || ''} onChange={(e) => updateField('slug', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                    </label>

                    <label className="block text-sm text-muted-foreground">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Short Description</span>
                      <input value={form.short_description || ''} onChange={(e) => updateField('short_description', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                      {fieldErrors.short_description && <div className="mt-2 text-xs text-red-300">{fieldErrors.short_description}</div>}
                    </label>

                    <label className="block text-sm text-muted-foreground md:col-span-2">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Overview</span>
                      <textarea rows={3} value={form.overview || ''} onChange={(e) => updateField('overview', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                    </label>

                    <label className="block text-sm text-muted-foreground md:col-span-2">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Description</span>
                      <textarea rows={6} value={form.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                      {fieldErrors.description && <div className="mt-2 text-xs text-red-300">{fieldErrors.description}</div>}
                    </label>
                  </div>
                </div>

                {/* Technologies */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Technologies</h3>
                  <div className="grid gap-2">
                    <TechsPicker updateField={updateField} selectedTechs={(form.technologies || []).map((t) => t.id)} />
                  </div>
                </div>

                {/* Features */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Features</h3>
                  <ProjectFeatures featuresText={form.features || ''} onChange={(val) => updateField('features', val)} />
                </div>

                {/* Project Gallery */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Project Gallery</h3>
                  <ProjectGallery projectItem={selectedItem} />
                </div>

                {/* Project Story / Client Story */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Project Story / Client Story</h3>
                  <ProjectSectionsEditor projectItem={selectedItem} />
                </div>

                {/* Links & Settings */}
                <div className="rounded-xl border border-border bg-surface p-4">
                  <h3 className="text-sm font-medium text-secondary-foreground mb-3">Links & Settings</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block text-sm text-muted-foreground">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Project URL</span>
                      <input value={form.project_url || ''} onChange={(e) => updateField('project_url', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                    </label>
                    <label className="block text-sm text-muted-foreground">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">GitHub URL</span>
                      <input value={form.github_url || ''} onChange={(e) => updateField('github_url', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground md:col-span-2">
                      <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => updateField('featured', e.target.checked)} />
                      <span>Featured</span>
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground md:col-span-2">
                      <input type="checkbox" checked={Boolean(form.is_published)} onChange={(e) => updateField('is_published', e.target.checked)} />
                      <span>Published</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  {selectedItem && (
                    <button type="button" onClick={() => { setSelectedItem(null); setForm(emptyForms[section] || {}); }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground">
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                  <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : selectedItem ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="glass rounded-3xl border border-border p-6">
              <h2 className="text-lg font-semibold text-secondary-foreground">{selectedItem ? "Edit" : "Create"} {config.label}</h2>
              <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                {Object.entries(form).map(([key, value]) => {
                  if (key === "id" || key === "created_at" || key === "updated_at") return null;

                  const fieldType = getFieldType(key, value);
                  const isRequired = (requiredFieldsBySection[section] || []).includes(key);
                  const hasFieldError = Boolean(fieldErrors[key]);
                  const showPreview = fileFieldNames.has(key) && typeof value === "string" && value;

                  if (fieldType === "checkbox") {
                    return (
                      <label key={key} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground md:col-span-2">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => updateField(key, e.target.checked)}
                          required={isRequired}
                        />
                        <span>{getFieldLabel(key)}</span>
                      </label>
                    );
                  }

                  if (fieldType === "file") {
                    return (
                      <div key={key} className="md:col-span-2">
                        <label className="block text-sm text-muted-foreground">
                          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{getFieldLabel(key)}</span>
                                  {showPreview && (
                                    <div className="mb-3 overflow-hidden rounded-xl border border-border bg-surface p-2">
                                      {key === "cv_file" ? (
                                        <div className="flex items-center gap-3">
                                          <a href={getAssetUrl(value)} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                                            {value.split('/').pop()}
                                          </a>
                                        </div>
                                      ) : (
                                        <img src={getAssetUrl(value)} alt={getFieldLabel(key)} className="max-h-40 w-auto rounded-lg object-contain" />
                                      )}
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept={key === "cv_file" ? "application/pdf" : "image/*"}
                                    required={isRequired && !selectedItem}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      // client-side validation for cv_file (pdf only)
                                      if (file && key === "cv_file") {
                                        if (file.type !== "application/pdf") {
                                          setFieldErrors((prev) => ({ ...prev, [key]: "Only PDF files are allowed for the CV." }));
                                          updateField(key, "");
                                          return;
                                        }
                                      }
                                      updateField(key, file || "");
                                    }}
                                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary"
                                  />
                        </label>
                        {hasFieldError && <div className="mt-2 text-xs text-red-300">{fieldErrors[key]}</div>}
                      </div>
                    );
                  }

                  // Platform select (fixed choices)
                  if (key === "platform") {
                    const options = [
                      { value: "github", label: "GitHub" },
                      { value: "linkedin", label: "LinkedIn" },
                      { value: "twitter", label: "Twitter" },
                    ];

                    return (
                      <label key={key} className="block text-sm text-muted-foreground md:col-span-2">
                        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{getFieldLabel(key)}</span>
                        <select
                          required={isRequired}
                          value={value || ""}
                          onChange={(e) => updateField(key, e.target.value)}
                          className={`w-full rounded-xl border ${hasFieldError ? "border-red-500/60" : "border-border"} bg-surface px-4 py-3 text-foreground outline-none focus:border-primary`}
                        >
                          <option value="">Select platform</option>
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {hasFieldError && <div className="mt-2 text-xs text-red-300">{fieldErrors[key]}</div>}
                      </label>
                    );
                  }

                  const fieldProps = {
                    type: fieldType === "textarea" ? undefined : fieldType,
                    required: isRequired,
                    min: fieldType === "number" ? 0 : undefined,
                    step: key.toLowerCase().includes("price") || key.toLowerCase().includes("amount") ? "0.01" : undefined,
                    value: value ?? "",
                    onChange: (e) => updateField(key, fieldType === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value),
                    className: `w-full rounded-xl border ${hasFieldError ? "border-red-500/60" : "border-border"} bg-surface px-4 py-3 text-foreground outline-none focus:border-primary`,
                  };

                  return (
                    <label key={key} className="block text-sm text-muted-foreground md:col-span-2">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">{getFieldLabel(key)}</span>
                      {fieldType === "textarea" ? (
                        <textarea
                          {...fieldProps}
                          rows={5}
                        />
                      ) : (
                        <input {...fieldProps} />
                      )}
                      {hasFieldError && <div className="mt-2 text-xs text-red-300">{fieldErrors[key]}</div>}
                    </label>
                  );
                })}

                <div className="md:col-span-2 flex items-center justify-end gap-3">
                  {selectedItem && (
                    <button type="button" onClick={() => { setSelectedItem(null); setForm(emptyForms[section] || {}); }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground">
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                  <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-70">
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : selectedItem ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </section>
          )
        )}

        {/* About highlights management (inside About section) */}
        {section === 'about' && (
          <section className="glass rounded-3xl border border-border p-6">
            <h2 className="text-lg font-semibold text-secondary-foreground">About Highlights</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <form onSubmit={saveHighlight} className="grid gap-4 md:col-span-2">
                <label className="block text-sm text-muted-foreground">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">About</span>
                  <textarea rows={3} value={highlightForm.about || ''} onChange={(e) => updateHighlightField('about', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                  {highlightErrors.about && <div className="mt-2 text-xs text-red-300">{highlightErrors.about}</div>}
                </label>

                <label className="block text-sm text-muted-foreground">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Title</span>
                  <input value={highlightForm.title || ''} onChange={(e) => updateHighlightField('title', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                  {highlightErrors.title && <div className="mt-2 text-xs text-red-300">{highlightErrors.title}</div>}
                </label>

                <label className="block text-sm text-muted-foreground">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Description</span>
                  <textarea rows={4} value={highlightForm.description || ''} onChange={(e) => updateHighlightField('description', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                  {highlightErrors.description && <div className="mt-2 text-xs text-red-300">{highlightErrors.description}</div>}
                </label>

                  <label className="block text-sm text-muted-foreground">
                    <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Icon</span>
                    <select value={highlightForm.icon_name || ''} onChange={(e) => updateHighlightField('icon_name', e.target.value)} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary">
                      <option value="code2">Code</option>
                      <option value="brain">AI / Brain</option>
                      <option value="database">Database</option>
                      <option value="web">Web</option>
                      <option value="server">Server</option>
                      <option value="cpu">Computer / CPU</option>
                      <option value="cloud">Cloud</option>
                      <option value="shieldcheck">Security</option>
                      <option value="book">Education</option>
                      <option value="briefcase">Experience</option>
                      <option value="award">Award</option>
                      <option value="react">React</option>
                      <option value="python">Python</option>
                      <option value="django">Django</option>
                      <option value="api">API</option>
                      <option value="project">Project</option>
                    </select>
                  </label>

                <label className="block text-sm text-muted-foreground md:col-span-2">
                  <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-foreground">Sort Order</span>
                  <input type="number" min={0} value={highlightForm.sort_order ?? 0} onChange={(e) => updateHighlightField('sort_order', Number(e.target.value))} className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none focus:border-primary" />
                </label>

                <div className="md:col-span-2 flex items-center justify-end gap-3">
                  {selectedHighlight && (
                    <button type="button" onClick={() => { setSelectedHighlight(null); setHighlightForm({ about: '', title: '', description: '', icon_name: 'code2', sort_order: 0, is_active: true }); }} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground">
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                    {selectedHighlight ? 'Update Highlight' : 'Add Highlight'}
                  </button>
                </div>
              </form>

              <div className="md:col-span-2">
                <div className="space-y-3 mt-4">
                  {highlightsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading highlights…</div>
                  ) : (
                    (highlights || []).map((h) => (
                      <div key={h.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{h.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{h.description}</p>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
                          <button onClick={() => { setSelectedHighlight(h); setHighlightForm({ about: h.about || '', title: h.title || '', description: h.description || '', icon_name: h.icon_name || 'code2', sort_order: h.sort_order || 0, is_active: h.is_active ?? true }); }} className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground">Edit</button>
                          <button onClick={() => deleteHighlight(h.id)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-300">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="glass rounded-3xl border border-border p-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading {config.label.toLowerCase()}…</div>
          ) : (
            <div className="space-y-3">
              {(items || []).map((item) => renderListItem(item))}
              {items.length === 0 && <div className="text-sm text-muted-foreground">No records available.</div>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
