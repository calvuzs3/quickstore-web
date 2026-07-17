import { describe, it, expect, vi, beforeEach } from "vitest";

const TEST_KTOR_URL = "http://test-ktor.local";

vi.mock("@/lib/config", () => ({ KTOR_URL: TEST_KTOR_URL }));

const getSessionTokenMock = vi.fn<() => Promise<string | null>>();
vi.mock("@/lib/auth", () => ({
  getSessionToken: () => getSessionTokenMock(),
}));

// Import dopo i mock: getArticles legge KTOR_URL/getSessionToken al momento della
// chiamata, ma i mock di modulo devono comunque essere registrati prima dell'import.
const { getArticles } = await import("@/lib/api");

describe("getArticles", () => {
  beforeEach(() => {
    getSessionTokenMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("lancia un errore se non c'è un token di sessione, senza chiamare fetch", async () => {
    getSessionTokenMock.mockResolvedValue(null);

    await expect(getArticles()).rejects.toThrow("Non autenticato");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("costruisce la query string con i default e passa il Bearer token", async () => {
    getSessionTokenMock.mockResolvedValue("token-123");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
    );

    await getArticles();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe(`${TEST_KTOR_URL}/articles?limit=50&offset=0`);
    expect(init?.headers).toMatchObject({ Authorization: "Bearer token-123" });
    expect(init?.cache).toBe("no-store");
  });

  it("include search/categoryId/limit/offset quando forniti", async () => {
    getSessionTokenMock.mockResolvedValue("token-123");
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
    );

    await getArticles({ search: "SKF", categoryId: "cat-1", limit: 10, offset: 20 });

    const [url] = vi.mocked(fetch).mock.calls[0];
    const parsed = new URL(url as string);
    expect(parsed.searchParams.get("search")).toBe("SKF");
    expect(parsed.searchParams.get("categoryId")).toBe("cat-1");
    expect(parsed.searchParams.get("limit")).toBe("10");
    expect(parsed.searchParams.get("offset")).toBe("20");
  });

  it("lancia un errore con lo status HTTP se la risposta non è ok", async () => {
    getSessionTokenMock.mockResolvedValue("token-123");
    vi.mocked(fetch).mockResolvedValue(new Response("boom", { status: 500 }));

    await expect(getArticles()).rejects.toThrow("HTTP 500");
  });

  it("restituisce il JSON decodificato quando la risposta è ok", async () => {
    getSessionTokenMock.mockResolvedValue("token-123");
    const payload = {
      items: [{ id: "art-1", name: "Bullone", totalQuantity: 5 }],
      total: 1,
    };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const result = await getArticles();

    expect(result).toEqual(payload);
  });

  it("avvolge un fallimento di rete in un messaggio comprensibile", async () => {
    getSessionTokenMock.mockResolvedValue("token-123");
    vi.mocked(fetch).mockRejectedValue(new Error("connection refused"));

    await expect(getArticles()).rejects.toThrow(/Impossibile raggiungere il server Ktor/);
  });
});
