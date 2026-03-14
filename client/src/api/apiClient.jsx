// File: src/api/apiClient.js

// const BASE_URL = 'http://localhost:5000/api';
const BASE_URL = 'https://inventory-management-system-71gh.onrender.com/api';

export const apiClient = async (endpoint, method = 'GET', bodyData = null) => {
  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (bodyData && method !== 'GET') {
    config.body = JSON.stringify(bodyData);
  }

  try {
    // ✨ SMART FIX: Ensure we don't get double slashes (like /api//suppliers)
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const targetUrl = `${cleanBase}${cleanEndpoint}`;

    const response = await fetch(targetUrl, config);
    
    // Check if the response is actually JSON before parsing!
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Oops, we haven't got JSON!");
    }

    const result = await response.json();

    return {
      success: response.ok,
      data: result.data || result, 
      message: result.message || 'Operation successful',
    };
  } catch (error) {
    console.error("API Call Error:", error);
    
    // Provide a clear error if the backend is down or sent HTML by accident
    return {
      success: false,
      data: null,
      message: 'Server error. Is the backend running on port 5000?',
    };
  }
};