import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/control-plane/apps", () => ({
  testTenantAppPush: vi.fn(),
}));

import { auth } from "@/auth";
import { testTenantAppPush } from "@/lib/control-plane/apps";

describe("POST /api/apps/[appCode]/push/test", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    const req = new Request("http://localhost/api/apps/driver/push/test", {
      method: "POST",
      body: JSON.stringify({ tokens: ["t1"] }),
    });
    const res = await POST(req, { params: Promise.resolve({ appCode: "driver" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 when tokens array is missing or empty", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { accountId: "acc_1", tenantId: "ten_1" },
    } as any);
    const req = new Request("http://localhost/api/apps/driver/push/test", {
      method: "POST",
      body: JSON.stringify({ title: "Hi", tokens: [] }),
    });
    const res = await POST(req, { params: Promise.resolve({ appCode: "driver" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("At least one target device token");
  });

  it("calls testTenantAppPush and returns result on success", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { accountId: "acc_1", tenantId: "ten_1" },
    } as any);
    vi.mocked(testTenantAppPush).mockResolvedValueOnce({
      success: true,
      appCode: "driver",
      provider: "ONESIGNAL",
      targetsCount: 1,
      successfulCount: 1,
      failedCount: 0,
      details: "Delivered",
    });

    const req = new Request("http://localhost/api/apps/driver/push/test", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        description: "Msg",
        tokens: ["token-123"],
      }),
    });
    const res = await POST(req, { params: Promise.resolve({ appCode: "driver" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.result.provider).toBe("ONESIGNAL");
  });
});
