import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BaseEmail from "./_base-email";

const checkIfFeatureIsEnabledGlobally = vi.fn();
const sendMail = vi.fn();

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}

vi.mock("@calcom/features/flags/features.repository", () => ({
  FeaturesRepository: vi.fn(function FeaturesRepository() {
    return {
      checkIfFeatureIsEnabledGlobally,
    };
  }),
}));

vi.mock("@calcom/prisma", () => ({
  prisma: {},
}));

vi.mock("@calcom/lib/serverConfig", () => ({
  serverConfig: {
    headers: {},
    transport: {},
  },
}));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail,
  })),
}));

class TestEmail extends BaseEmail {
  protected async getNodeMailerPayload() {
    return {
      from: "Cal <hello@example.com>",
      to: "user@example.com",
      subject: "Hello &amp; welcome",
      html: "<p>Hello</p>",
      text: "Hello",
    };
  }
}

describe("BaseEmail", () => {
  const originalResendApiKey = process.env.RESEND_API_KEY;
  const originalFetch = globalThis.fetch;
  const originalIntegrationTestMode = process.env.INTEGRATION_TEST_MODE;

  beforeEach(() => {
    vi.clearAllMocks();
    checkIfFeatureIsEnabledGlobally.mockResolvedValue(false);
    sendMail.mockImplementation((_payload: unknown, callback: (err: Error | null, info: unknown) => void) =>
      callback(null, { accepted: ["user@example.com"] })
    );
    delete process.env.RESEND_API_KEY;
    delete process.env.INTEGRATION_TEST_MODE;
  });

  afterEach(() => {
    restoreEnv("RESEND_API_KEY", originalResendApiKey);
    restoreEnv("INTEGRATION_TEST_MODE", originalIntegrationTestMode);
    globalThis.fetch = originalFetch;
  });

  it("sends through Resend REST API when RESEND_API_KEY is configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock as typeof fetch;

    await new TestEmail().sendEmail();

    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer re_test_key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Cal <hello@example.com>",
        to: ["user@example.com"],
        subject: "Hello & welcome",
        html: "<p>Hello</p>",
        text: "Hello",
      }),
    });
    expect(sendMail).not.toHaveBeenCalled();
  });
});
