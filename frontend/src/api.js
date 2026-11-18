export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isApiDown(error) {
  return Boolean(error) && (!error.status || error.status >= 500);
}

function detailFrom(body, status) {
  if (body && typeof body.detail === 'string' && body.detail.trim()) return body.detail;
  if (body && Array.isArray(body.detail)) {
    const text = body.detail
      .map((item) => item && (item.msg || item.message))
      .filter(Boolean)
      .join(' ');
    if (text) return text;
  }
  if (!status || status >= 500) return 'The planner API is not running.';
  return `Request failed (${status}).`;
}

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new ApiError('The planner API is not running.', 0);
  }
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok || body == null) {
    throw new ApiError(detailFrom(body, response.status), response.status || 0);
  }
  return body;
}

export function getPlaces(signal) {
  return request('/api/places', { signal });
}

export function getContext(time, signal) {
  return request(`/api/context?time=${encodeURIComponent(time)}`, { signal });
}

export function postPlan(body, signal) {
  return request('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}

export function getEvaluation(signal) {
  return request('/api/evaluation', { signal });
}

export function getWeather(signal) {
  return request('/api/weather', { signal });
}

export function getMap(signal) {
  return request('/api/map', { signal });
}
