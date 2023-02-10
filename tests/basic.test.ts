import supertest from "supertest";
import createServer from "../helpers/server";
import { router } from "../router";

const app = createServer();

app.use(router);

describe("GET /", () => {
  it("should return 200 OK", () => {
    return supertest(app).get("/").expect(200);
  });
});
