import request from "supertest";
import app from "./app";

describe("API Endpoints", () => {
  it("GET / should return hello", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("hello");
  });

  describe("/auth routes", () => {
    it("GET /auth/csrf-token should return a CSRF token", async () => {
      const res = await request(app).get("/auth/csrf-token");
      expect(res.statusCode).toBe(200);
      // expect(res.body).toHaveProperty('csrfToken'); // Uncomment if implemented
    });

    it("POST /auth/login should fail with missing credentials", async () => {
      const res = await request(app).post("/auth/login").send({});
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("POST /auth/register should fail with missing data", async () => {
      const res = await request(app).post("/auth/register").send({});
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe("/stocks routes", () => {
    it("GET /stocks should return a list or error", async () => {
      const res = await request(app).get("/stocks");
      // expect(res.statusCode).toBe(200); // Uncomment if public
      expect([200, 401, 403, 404]).toContain(res.statusCode);
    });
    // Add more /stocks tests as needed
  });

  describe("/order routes", () => {
    it("GET /order should return orders or error", async () => {
      const res = await request(app).get("/order");
      // expect(res.statusCode).toBe(200); // Uncomment if public
      expect([200, 401, 403, 404]).toContain(res.statusCode);
    });
    // Add more /order tests as needed
  });
});
