import supertest from "supertest";
import createServer from "../helpers/server";

const app = createServer();

describe("GET /", () => {
  it("should return 200 OK", () => {
    return supertest(app).get("/").expect(200);
  });
});