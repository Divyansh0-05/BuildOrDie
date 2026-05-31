export type CreateProjectInput = {
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  toolsUsed: string[];
};

export function parseStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateCreateProjectInput(body: unknown):
  | { ok: true; data: CreateProjectInput }
  | { ok: false; error: string } {
  const input = body as {
    title?: unknown;
    tagline?: unknown;
    description?: unknown;
    tags?: unknown;
    toolsUsed?: unknown;
    toolsPlanned?: unknown;
  };

  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const tagline =
    typeof input?.tagline === "string" ? input.tagline.trim() : "";
  const description =
    typeof input?.description === "string" ? input.description.trim() : "";
  const tags = parseStringArray(input?.tags);
  const toolsUsed = parseStringArray(input?.toolsUsed ?? input?.toolsPlanned);

  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  if (!tagline) {
    return { ok: false, error: "Tagline is required." };
  }

  if (tagline.length > 140) {
    return { ok: false, error: "Tagline must be 140 characters or less." };
  }

  if (!description) {
    return { ok: false, error: "Description is required." };
  }

  if (!Array.isArray(input?.tags)) {
    return { ok: false, error: "Tags must be an array." };
  }

  return {
    ok: true,
    data: {
      title,
      tagline,
      description,
      tags,
      toolsUsed,
    },
  };
}

export function validateHttpsUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
