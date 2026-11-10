import { PassThrough } from "node:stream";

import { describe, expect, it } from "vitest";

import { createLogger, requestSummary } from "../../src/http/logger.js";

function captureStream(): { stream: PassThrough; read: () => string } {
  const stream = new PassThrough();
  let output = "";
  stream.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  return { stream, read: () => output };
}

describe("logger redaction", () => {
  it("redacts authorization headers and token fields", () => {
    const sink = captureStream();
    const log = createLogger({ level: "info", destination: sink.stream });

    log.info(
      {
        req: { headers: { authorization: "Bearer super-secret-token" } },
        password: "hunter2",
        nested: { idToken: "another-secret" },
      },
      "test",
    );

    const output = sink.read();
    expect(output).not.toContain("super-secret-token");
    expect(output).not.toContain("hunter2");
    expect(output).not.toContain("another-secret");
    expect(output).toContain("[redacted]");
  });

  it("emits valid JSON", () => {
    const sink = captureStream();
    const log = createLogger({ level: "info", destination: sink.stream });
    log.info({ requestId: "abc" }, "hello");

    const parsed = JSON.parse(sink.read().trim()) as { msg: string };
    expect(parsed.msg).toBe("hello");
  });

  it("drops query strings from request summaries", () => {
    expect(requestSummary("/auth/me?uid=evil&email=x@y.z", "GET")).toEqual({
      method: "GET",
      path: "/auth/me",
    });
  });
});
