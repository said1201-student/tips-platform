/**
 * Small, dependency-free validation helpers.
 * Each validator receives a value and returns an error message string,
 * or null when the value is valid.
 */

const isBlank = (value) =>
  value === undefined || value === null || String(value).trim() === "";

function required(label = "This field") {
  return (value) => (isBlank(value) ? `${label} is required.` : null);
}

function maxLen(max, label = "This field") {
  return (value) =>
    !isBlank(value) && String(value).trim().length > max
      ? `${label} must be at most ${max} characters.`
      : null;
}

function minLen(min, label = "This field") {
  return (value) =>
    !isBlank(value) && String(value).trim().length < min
      ? `${label} must be at least ${min} characters.`
      : null;
}

function isEmail(label = "Email") {
  return (value) => {
    if (isBlank(value)) return null;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(String(value).trim())
      ? null
      : `${label} must be a valid email address.`;
  };
}

function isUsername(label = "Username") {
  return (value) => {
    if (isBlank(value)) return null;
    const pattern = /^[a-zA-Z0-9_]{3,60}$/;
    return pattern.test(String(value).trim())
      ? null
      : `${label} must be 3-60 characters (letters, numbers, underscore only).`;
  };
}

function isNumber(label = "This field") {
  return (value) => {
    if (isBlank(value)) return null;
    return Number.isFinite(Number(value)) ? null : `${label} must be a number.`;
  };
}

function isOdds(label = "Total odds") {
  return (value) => {
    if (isBlank(value)) return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return `${label} must be a number.`;
    if (num < 1) return `${label} must be at least 1.00.`;
    if (num > 100000) return `${label} is too large.`;
    return null;
  };
}

function isIn(allowed, label = "This field") {
  return (value) => {
    if (isBlank(value)) return null;
    return allowed.includes(value)
      ? null
      : `${label} must be one of: ${allowed.join(", ")}.`;
  };
}

function isUrl(label = "Website") {
  return (value) => {
    if (isBlank(value)) return null;
    try {
      const url = new URL(String(value).trim());
      return url.protocol === "http:" || url.protocol === "https:"
        ? null
        : `${label} must start with http:// or https://.`;
    } catch {
      return `${label} must be a valid URL.`;
    }
  };
}

module.exports = {
  required,
  maxLen,
  minLen,
  isEmail,
  isUsername,
  isNumber,
  isOdds,
  isIn,
  isUrl,
  isImageDataUrl,
  isBlank,
};
