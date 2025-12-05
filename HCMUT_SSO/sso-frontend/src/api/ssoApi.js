// src/api/ssoApi.js
// URL gốc của SSO backend
const API_BASE =
  import.meta?.env?.VITE_SSO_API_URL || "http://localhost:9002/api";

/**
 * Call SSO backend to login and get redirect URL with ticket.
 *
 * @param {string} bkNetId
 * @param {string} password
 * @param {string} service - callback URL (frontend /sso/callback)
 * @returns {Promise<{ticket?: string, redirectUrl?: string, bkNetId?: string, message?: string}>}
 */
export const ssoLogin = async (bkNetId, password, service) => {
  const res = await fetch("http://localhost:9002/api/sso/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bkNetId, password, service }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};


/**
 * Validate a ticket with SSO backend and get user profile.
 *
 * @param {string} ticket
 * @param {string} serviceUrl
 * @returns {Promise<{bkNetId: string, fullName: string, email: string, role: string}>}
 */
export async function validateTicket(ticket, serviceUrl) {
  const res = await fetch(
    `${API_BASE}/service-validate?value=${ticket}&service=${encodeURIComponent(serviceUrl)}`,
    {
      method: "GET",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}
