import { config } from "dotenv";
config();

expect.extend({
  toBeOneOf(received: any, items: Array<any>) {
    const pass = items.includes(received);
    const message = () =>
      `expected ${received} to be contained in array [${items}]`;
    if (pass) {
      return {
        message,
        pass: true,
      };
    }
    return {
      message,
      pass: false,
    };
  },
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toBeOneOf(items: Array<string>): CustomMatcherResult;
    }
  }
}

describe("config", () => {
  describe("Environment", () => {
    it("should contain ENV", () => {
      expect(process.env.ENV).toBeDefined();
    });
    it("should contain ENV to be either development or production or staging", () => {
      expect(process.env.ENV).toBeOneOf(["dev", "prod", "staging"]);
    });
  });
  describe("MongoDB", () => {
    it("should contain MongoDB URI", () => {
      expect(process.env.MONGO_URI).toBeDefined();
    });
  });
  describe("App essentials", () => {
    it("should contain PORT", () => {
      expect(process.env.PORT).toBeDefined();
    });
    it("should contain JWT secret", () => {
      expect(process.env.JWT_SECRET).toBeDefined();
    });
    it("should contain ADMIN_SECRET", () => {
      expect(process.env.ADMIN_SECRET).toBeDefined();
    });
    it("should contain COIN_RUPEE_RATIO", () => {
      expect(process.env.COIN_RUPEE_RATIO).toBeDefined();
      expect(Number(process.env.COIN_RUPEE_RATIO)).toBeGreaterThan(0);
    });
  });
  describe("AWS", () => {
    describe("S3", () => {
      it("should contain AWS_BUCKET_NAME", () => {
        expect(process.env.AWS_BUCKET_NAME).toBeDefined();
      });
      it("should contain AWS_BUCKET_REGION", () => {
        expect(process.env.AWS_BUCKET_REGION).toBeDefined();
      });
      it("should contain S3_AWS_ACCESS_KEY", () => {
        expect(process.env.S3_AWS_ACCESS_KEY).toBeDefined();
      });
      it("should contain S3_AWS_SECRET_KEY", () => {
        expect(process.env.S3_AWS_SECRET_KEY).toBeDefined();
      });
    });
    describe("SES", () => {
      it("should contain SES_AWS_ACCESS_KEY_ID", () => {
        expect(process.env.SES_AWS_ACCESS_KEY_ID).toBeDefined();
      });
      it("should contain SES_AWS_SECRET_ACCESS_KEY", () => {
        expect(process.env.SES_AWS_SECRET_ACCESS_KEY).toBeDefined();
      });
      it("should contain SES_AWS_REGION", () => {
        expect(process.env.SES_AWS_REGION).toBeDefined();
      });
    });
  });
  describe("Webhook", () => {
    it("should contain WEBHOOK_URL", () => {
      expect(process.env.WEBHOOK_URL).toBeDefined();
    });
    it("should contain ENABLE_WEBHOOK_ALERT", () => {
      expect(process.env.ENABLE_WEBHOOK_ALERT).toBeDefined();
      expect(process.env.ENABLE_WEBHOOK_ALERT).toBeOneOf(["true", "false"]);
    });
  });
});