import { UpdateComplaintPayload } from "@/types/complaints/type";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token"); // Use a distinct key so student/admin tokens don't clash
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

export function removeToken() {
  localStorage.removeItem("admin_token");
}

export async function loginApi(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");

  // 🔒 CRITICAL: Ensure only admins can log in here
  if (json.user.role !== "admin") {
    throw new Error("Access denied. Admin credentials required.");
  }

  return json; 
}

export async function registerAdminApi(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, role: "admin" }), // <-- Hardcode role as admin
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Admin registration failed");

  return json;
}


// ---------- ADMIN DATA FETCHING ----------

export async function getSystemStatsApi() {
  const token = getToken();
  const res = await fetch(`${API_URL}/reports/system`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch stats");
  return json.data; 
}

export async function getCategoriesApi() {
  const token = getToken();
  const res = await fetch(`${API_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` }, // Admin token
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch categories");
  return json.data;
}

export async function createCategoryApi(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create category");
  return json;
}

export async function getDepartmentsApi() {
  const token = getToken();
  const res = await fetch(`${API_URL}/departments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch departments");
  return json.data;
}
// ---------- STAFF ----------
export async function getStaffApi() {
  const token = getToken();
  const res = await fetch(`${API_URL}/staff`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch staff");
  return json.data;
}

// ---------- COMPLAINTS ----------
export async function getAllComplaintsApi(query = "") {
  const token = getToken();
  const res = await fetch(`${API_URL}/complaints${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch complaints");
  return json; // { success, data, pagination }
}

export async function assignComplaintApi(
  complaintId: number,
  staffEmail: string,
  adminEmail: string
) {
  const res = await fetch(
    `${API_URL}/complaints/${complaintId}/assign`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        staffEmail,
        adminEmail,
      }),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    console.error("Assignment API error:", json);
    throw new Error(json.message || "Failed to assign complaint");
  }

  return json;
}



export async function getAdminsApi() {
  const token = getToken();
  const res = await fetch(`${API_URL}/staff/admins`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch admins");
  return json.data;
}


// create department

export async function createDepartmentApi(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/departments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create department");
  return json.data;
}


export async function deleteComplaintApi(complaintId: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete complaint");
  return json;
}

export async function updateComplaintApi(
  complaintId: number,
  data: UpdateComplaintPayload
) {
  const token = getToken();

  console.log("Complaint ID:", complaintId);
  console.log("Update payload:", data);

  const body = JSON.stringify(data);

  console.log("Serialized request body:", body);

  const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  const json = await res.json();

  if (!res.ok) {
    console.error("Update API failed:", json);
    throw new Error(json.message || "Failed to update complaint");
  }

  return json;
}


// ---------- ADMIN PROFILE ----------

export async function getAdminProfileApi() {
  const token = getToken();
  const res = await fetch(`${API_URL}/staff/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch profile");
  return json.data;
}

export async function updateAdminProfileApi(data: any) {
  const token = getToken();
  const res = await fetch(`${API_URL}/staff/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update profile");
  return json.data;
}