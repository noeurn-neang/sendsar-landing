import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "znel7f86",
  dataset: "production",
  apiVersion: "2026-06-10",
  useCdn: false,
});