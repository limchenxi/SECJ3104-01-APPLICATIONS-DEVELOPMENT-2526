export const resolveRedirectPath = (
  path: string | null | undefined,
  fallback = "/"
) => {
  if (!path) {
    return fallback;
  }

  const trimmed = path.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  return fallback;
};
