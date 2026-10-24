import { vi } from "vitest";

// Next.js server-only modules throw outside the RSC runtime; no-op in unit tests.
vi.mock("server-only", () => ({}));
