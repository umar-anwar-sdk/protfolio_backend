const STORAGE_KEY = "portfolio_visitor_id";
const COOKIE_NAME = "portfolio_visitor_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function setCookie(name, value, maxAgeSeconds) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getVisitorId() {
  if (typeof window === "undefined") return null;

  const storageValue = window.localStorage.getItem(STORAGE_KEY);
  if (storageValue) return storageValue;

  const cookieValue = getCookie(COOKIE_NAME);
  if (cookieValue) {
    window.localStorage.setItem(STORAGE_KEY, cookieValue);
    return cookieValue;
  }

  return null;
}

function setVisitorId(visitorId) {
  if (typeof window === "undefined") return visitorId;

  window.localStorage.setItem(STORAGE_KEY, visitorId);
  setCookie(COOKIE_NAME, visitorId, COOKIE_MAX_AGE);
  return visitorId;
}

function normalizeLocation(location) {
  if (!location || typeof location !== "object") return {};
  const lat = Number(location.latitude);
  const lng = Number(location.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }
  return {};
}

function getApproxIpLocation() {
  return {
    country: "Unknown",
    city: "Unknown",
  };
}

export async function trackVisitorPageView() {
  if (typeof window === "undefined") return null;

  const currentUrl = window.location.href;
  const referrer = document.referrer || "";
  let visitorId = getVisitorId();

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setVisitorId(visitorId);
  }

  let gpsPermissionStatus = "unknown";
  let gpsLocation = {};

  if (navigator.geolocation) {
    gpsPermissionStatus = "prompt";
    try {
      const permissionStatus = await navigator.permissions?.query({ name: "geolocation" }).catch(() => null);
      gpsPermissionStatus = permissionStatus?.state || "prompt";
    } catch (error) {
      gpsPermissionStatus = "unknown";
    }

    if (gpsPermissionStatus === "granted") {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 });
        });
        gpsLocation = normalizeLocation(position?.coords);
      } catch (error) {
        gpsLocation = {};
      }
    }
  } else {
    gpsPermissionStatus = "unsupported";
  }

  const payload = {
    visitor_id: visitorId,
    path: window.location.pathname,
    referrer,
    user_agent: navigator.userAgent,
    gps_permission_status: gpsPermissionStatus,
    gps_location: gpsLocation,
    approx_ip_location: getApproxIpLocation(),
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/visitors/track/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "omit",
    });

    if (!response.ok) {
      console.warn("Visitor tracking request failed", await response.text());
      return null;
    }

    const data = await response.json();
    if (data?.visitor_id) {
      setVisitorId(data.visitor_id);
    }
    return data;
  } catch (error) {
    console.warn("Visitor tracking request failed", error);
    return null;
  }
}

export function trackVisitorOnLoad() {
  if (typeof window === "undefined") return;
  window.addEventListener("load", () => {
    trackVisitorPageView();
  }, { once: true });
}
