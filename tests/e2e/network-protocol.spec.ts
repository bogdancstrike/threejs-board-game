import { test, expect } from "./fixtures";

test("realtime transport handles acknowledgements, reconnects, fallback, rejection and expired sessions", async ({
  page,
}) => {
  await page.goto("/scripts/preview-stage.html");
  const result = await page.evaluate(async () => {
    const path = "/src/network/client.ts";
    const { RealtimeClient } = await import(path);
    const original = {
      fetch: window.fetch,
      WebSocket: window.WebSocket,
      timeout: window.setTimeout.bind(window),
      interval: window.setInterval.bind(window),
    };
    const sleep = (ms = 20) => new Promise((r) => original.timeout(r, ms));
    const sockets: any[] = [],
      requests: any[] = [],
      errors: string[] = [],
      updates: any[] = [],
      statuses: string[] = [];
    let failTicket = false,
      failRequest = false,
      invalidJson = false;
    let room: any = {
      id: "room-1",
      revision: 1,
      hostId: "player-1",
      phase: "playing",
      hotseat: false,
      game: {
        active: 0,
        players: [{ id: "player-1", name: "Ada", character: "lyra" }],
      },
    };
    class Socket {
      static OPEN = 1;
      readyState = 0;
      onopen: any;
      onmessage: any;
      onclose: any;
      onerror: any;
      sent: any[] = [];
      constructor(public url: URL) {
        sockets.push(this);
      }
      open() {
        this.readyState = 1;
        this.onopen?.();
      }
      send(data: string) {
        this.sent.push(JSON.parse(data));
      }
      message(data: any) {
        this.onmessage?.({
          data: typeof data === "string" ? data : JSON.stringify(data),
        });
      }
      close() {
        this.readyState = 3;
        this.onclose?.();
      }
    }
    (window as any).WebSocket = Socket;
    window.setTimeout = ((fn: any, ms: number) =>
      original.timeout(fn, ms === 10000 ? 35 : ms === 800 ? 15 : ms)) as any;
    window.setInterval = ((fn: any) => original.interval(fn, 15)) as any;
    window.fetch = (async (url: any, init: any) => {
      requests.push({
        url,
        body: init.body && JSON.parse(init.body),
        headers: init.headers,
      });
      if (failRequest || (failTicket && String(url).endsWith("/ticket")))
        return {
          ok: false,
          json: async () => {
            if (invalidJson) throw Error("html");
            return { error: { message: "Session expired" } };
          },
        };
      if (String(url).endsWith("/ticket"))
        return { ok: true, json: async () => ({ ticket: "one-use-ticket" }) };
      if (String(url).endsWith("/commands"))
        room = { ...room, revision: room.revision + 1 };
      return {
        ok: true,
        json: async () => ({
          room,
          playerId: "player-1",
          token: "test-token",
          serverTime: Date.now(),
        }),
      };
    }) as any;
    const client = new RealtimeClient(
      (u: any) => updates.push(u),
      (s: string) => statuses.push(s),
      (e: string) => errors.push(e),
    );
    const assert = (value: unknown, label: string) => {
      if (!value) throw Error(label);
    };
    try {
      assert(
        client.myIndex === -1 && !client.myTurn && !client.isHost,
        "empty client capabilities",
      );
      await client.command("ROLL_DIE").then(
        () => {
          throw Error("allowed without session");
        },
        (e: Error) => assert(e.message.includes("Join"), "join required"),
      );
      await client.refresh();
      await client.create("Ada", "verdant", "classic");
      await sleep();
      const socket = sockets.at(-1);
      socket.open();
      assert(
        client.connected && client.myTurn && client.isHost,
        "connected ownership",
      );
      await sleep();
      assert(
        socket.sent.some((x: any) => x.type === "PING"),
        "heartbeat",
      );
      const command = client.command("ROLL_DIE");
      const intent = socket.sent.at(-1);
      socket.message({
        type: "ACK",
        commandId: intent.idempotency_key,
        room: { ...room, revision: 2 },
        serverTime: Date.now(),
      });
      await command;
      assert(client.room.revision === 2, "ack applies snapshot");
      const before = updates.length;
      socket.message("invalid JSON");
      socket.message({ type: "PONG" });
      socket.message({
        room: { ...room, revision: 0 },
        serverTime: Date.now(),
      });
      socket.message({
        room: { ...room, revision: 2 },
        serverTime: Date.now(),
      });
      socket.message({
        room: {
          ...room,
          revision: 3,
          game: { players: [{ character: "unknown" }] },
        },
        serverTime: Date.now(),
      });
      assert(updates.length === before, "malformed and stale messages ignored");
      room = { ...room, revision: 3 };
      const rejected = client
        .command("ROLL_DIE")
        .catch((e: Error) => e.message);
      socket.message({
        type: "REJECTED",
        commandId: socket.sent.at(-1).idempotency_key,
        error: { code: "version_mismatch", message: "Refresh the room" },
      });
      assert((await rejected) === "Refresh the room", "rejection propagated");
      await sleep();
      assert(client.room.revision === 3, "version mismatch refreshes");
      const timeout = client.command("ROLL_DIE");
      const key = socket.sent.at(-1).idempotency_key;
      await timeout;
      assert(
        requests.at(-1).body.idempotency_key === key,
        "HTTP fallback preserves idempotency",
      );
      socket.onerror();
      await sleep(30);
      sockets.at(-1).open();
      assert(
        client.connected && statuses.includes("offline"),
        "reconnected after transport error",
      );
      const pending = client.command("ROLL_DIE").catch((e: Error) => e.message);
      client.disconnect();
      assert(
        (await pending) === "You left the room.",
        "pending command cancelled",
      );
      assert(
        !localStorage.getItem("wilder-room-v1") && !client.session,
        "session cleared",
      );
      failTicket = true;
      await client.join(" abc123 ", "Grace");
      await sleep(5);
      assert(
        requests.some((r) => r.url.includes("/ABC123/join")),
        "join normalizes code",
      );
      assert(client.status === "offline", "failed ticket goes offline");
      failTicket = false;
      await sleep(30);
      sockets.at(-1).open();
      room = { ...room, hotseat: true, game: { ...room.game, active: 1 } };
      await client.refresh();
      assert(client.myTurn, "hotseat host controls all seats");
      client.disconnect(false);
      await client.command("ROLL_DIE");
      assert(
        requests.at(-1).url.endsWith("/commands"),
        "disconnected HTTP fallback",
      );
      await client.restore();
      await sleep();
      sockets.at(-1).open();
      assert(client.session?.token === "test-token", "saved session restored");
      client.disconnect();
      localStorage.setItem("wilder-room-v1", '{"roomId":1}');
      await client.restore();
      assert(
        errors.length === 1 && !client.session,
        "malformed session rejected",
      );
      localStorage.setItem(
        "wilder-room-v1",
        JSON.stringify({ roomId: "expired", playerId: "p", token: "expired" }),
      );
      failRequest = true;
      invalidJson = true;
      await client.restore();
      assert(
        errors.length === 2 && !client.session,
        "expired non-JSON response recovered",
      );
      await client.join("bad", "Ada").then(
        () => {
          throw Error("failed request accepted");
        },
        (e: Error) =>
          assert(
            e.message.includes("could not be reached"),
            "network error readable",
          ),
      );
      return {
        reconnects: statuses.filter((s) => s === "online").length,
        commands: requests.filter((r) => r.url.endsWith("/commands")).length,
        errors: errors.length,
      };
    } finally {
      client.disconnect();
      window.fetch = original.fetch;
      window.WebSocket = original.WebSocket;
      window.setTimeout = original.timeout;
      window.setInterval = original.interval;
    }
  });
  expect(result.reconnects).toBeGreaterThanOrEqual(3);
  expect(result.commands).toBe(2);
  expect(result.errors).toBe(2);
});
