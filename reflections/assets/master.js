function getAllReflections() {
  if (typeof REFLECTION_DATA !== "undefined" && REFLECTION_DATA && typeof REFLECTION_DATA === "object") {
    return REFLECTION_DATA;
  }

  if (typeof REFLECTIONS !== "undefined" && REFLECTIONS && typeof REFLECTIONS === "object") {
    return REFLECTIONS;
  }

  if (typeof window.REFLECTION_DATA !== "undefined" && window.REFLECTION_DATA && typeof window.REFLECTION_DATA === "object") {
    return window.REFLECTION_DATA;
  }

  if (typeof window.REFLECTIONS !== "undefined" && window.REFLECTIONS && typeof window.REFLECTIONS === "object") {
    return window.REFLECTIONS;
  }

  return {};
}