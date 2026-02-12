const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

const tests = [
  { name: "health", method: "GET", path: "/health", expect: [200] },
  { name: "daily-challenge", method: "GET", path: "/api/v1/challenges/today", expect: [200, 404] },
  { name: "leaderboard", method: "GET", path: "/api/v1/leaderboard", expect: [200] },
  { name: "problems-auth-guard", method: "GET", path: "/api/v1/problems/get-all-problems", expect: [401] },
  { name: "contest-auth-guard", method: "GET", path: "/api/v1/contest", expect: [401] },
  { name: "ai-auth-guard", method: "GET", path: "/api/v1/ai", expect: [401] },
];

const run = async () => {
  const results = [];

  for (const test of tests) {
    const url = `${baseUrl}${test.path}`;
    try {
      const res = await fetch(url, { method: test.method });
      const ok = test.expect.includes(res.status);
      results.push({ ...test, status: res.status, ok });
    } catch (error) {
      results.push({ ...test, status: "ERR", ok: false, error: String(error) });
    }
  }

  const failed = results.filter((r) => !r.ok);

  results.forEach((r) => {
    if (r.ok) {
      console.log(`[PASS] ${r.name} -> ${r.status}`);
    } else {
      console.log(`[FAIL] ${r.name} -> ${r.status}${r.error ? ` (${r.error})` : ""}`);
    }
  });

  if (failed.length > 0) {
    process.exitCode = 1;
  } else {
    console.log("Smoke checks passed.");
  }
};

run();

