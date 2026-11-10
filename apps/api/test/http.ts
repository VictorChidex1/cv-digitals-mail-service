import { once } from "node:events";
import type { AddressInfo } from "node:net";

import type { Express } from "express";

/**
 * Binds the app to an ephemeral port so tests exercise the real HTTP stack
 * without guessing a free port.
 */
export async function withServer<T>(
  app: Express,
  run: (baseUrl: string) => Promise<T>,
): Promise<T> {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await run(baseUrl);
  } finally {
    server.close();
    await once(server, "close");
  }
}
