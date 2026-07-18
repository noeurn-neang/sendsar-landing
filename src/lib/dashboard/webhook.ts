export type WebhookTestResult = {
  ok: boolean;
  statusCode: number | null;
  latencyMs: number;
  error: string | null;
  testedAt: string;
  url: string;
};
