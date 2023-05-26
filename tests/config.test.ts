import { config } from "dotenv";
config();

// This function adds a custom matcher to Jest's expect API.
expect.extend({

  // Defines the matcher called 'toBeOneOf'.
  toBeOneOf(received: any, items: Array<any>) {

    // Check if the received value is included in the list of expected values.
    const pass = items.includes(received);
    
    // Sets a fail message when the received value is not present in the expected list.
    const message = () =>
      `expected ${received} to be contained in array [${items}]`;

    // Return an object with two properties: a message and a boolean indicating whether the test has passed.
    // If 'pass' is true, the test has passed. Otherwise, it has failed.
    if (pass) {
      return {
        message,
        pass: true,
      };
    } else {
      return {
        message,
        pass: false,
      };
    }
  },
});


// defines a new interface called Matchers which extends an existing interface 
// with the generic type parameter <R>. The extended interface includes a single method 
// toBeOneOf that takes an array of strings as its argument and returns a custom matcher result.
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
    it("should contain UTILS_API_KEY", () => {
      expect(process.env.UTILS_API_KEY).toBeDefined();
    });
    it("should contain FRONTEND_HOSTED_URL", () => {
      expect(process.env.FRONTEND_HOSTED_URL).toBeDefined();
    });
    it("should contain REFERRAL_BONUS", () => {
      expect(process.env.REFERRAL_BONUS).toBeDefined();
      expect(Number(process.env.REFERRAL_BONUS)).toBeGreaterThan(0);
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
    it("Should contain STAGING_URL", () => {
      expect(process.env.STAGING_URL).toBeDefined();
    });
    it("Should contain PRODUCTION_URL", () => {
      expect(process.env.PRODUCTION_URL).toBeDefined();
    });
  });
  describe("Razorpay", () => {
    it("should contain RAZORPAY_KEY", () => {
      expect(process.env.RAZORPAY_KEY).toBeDefined();
    });
  });
});
