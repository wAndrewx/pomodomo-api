require("dotenv").config();
const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const { app } = require("../../server");
const seed = require("../seed");
const { pool } = require("../../db/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

chai.use(chaiHttp);

describe("Auth route", function () {
  // Clear database and register seed users for test cases
  before(async function () {
    try {
      // truncate users table, restarts sequence column (id)
      await pool.query("TRUNCATE users RESTART IDENTITY");
      // truncate sessions table, restarts sequence column (id)
      await pool.query("TRUNCATE session RESTART IDENTITY");

      const hashedPassword = await bcrypt.hash(seed.validatedPassword, 12);
      const emailHash = crypto.randomBytes(16).toString("hex");

      await pool.query(
        `INSERT INTO users (username, email, email_hash, password, verified)
        VALUES ($1, $2, $3, $4, TRUE)`,
        [
          seed.existingUser.username,
          seed.existingUser.email,
          emailHash,
          hashedPassword,
        ]
      );
    } catch (error) {
      console.log(error);
    }
  });

  describe("POST /register", function () {
    it(`should return 201 and "Check for verification email for ${seed.newUser.email}"`, async function () {
      try {
        const successRegisterRes = await chai
          .request(app)
          .post("/register")
          .send(seed.newUser);
        expect(successRegisterRes.status).to.equal(201);
        expect(successRegisterRes.body)
          .to.have.property("message")
          .equal(`Check for verification email for ${seed.newUser.email}`);
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });

    it("should return 409 if the user already exists", async function () {
      try {
        const existsRegisterRes = await chai
          .request(app)
          .post("/register")
          .send(seed.existingUser);
        expect(existsRegisterRes.status).to.equal(409);
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });

    it("should return 400 if there are missing credentials", async function () {
      try {
        const credMissRegisterRes = await chai
          .request(app)
          .post("/register")
          .send({
            username: "",
            password: "",
          });
        expect(credMissRegisterRes.status).to.equal(400);
        expect(credMissRegisterRes.body)
          .to.have.property("message")
          .equal("All fields must be completed.");
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });

    /** USERNAME VALIDATION TESTS START **/
    it("should return 422 if the username contains profanity", async function () {
      try {
        const profanityRegisterRes = await chai
          .request(app)
          .post("/register")
          .send({
            email: "badword@mail.com",
            username: "badword",
            password: seed.validatedPassword,
          });
        expect(profanityRegisterRes.status).to.equal(422);
        expect(profanityRegisterRes.body)
          .to.have.property("message")
          .equal("Username must not contain profanity.");
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });
    /** USERNAME VALIDATION TESTS END **/

    /** PASSWORD VALIDATION TESTS START **/
    it("should return 422 if password doesn't pass regex checks", async function () {
      try {
        const regexRegisterRes = await chai
          .request(app)
          .post("/register")
          .send({
            email: "regexFail@mail.com",
            username: "missingSpecialChar",
            password: "Password12",
          });
        expect(regexRegisterRes.status).to.equal(422);
        expect(regexRegisterRes.body)
          .to.have.property("message")
          .equal("Password must meet all requirements.");
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });
    /** PASSWORD VALIDATION TESTS END **/
  });

  describe("POST /login", function () {
    it("should return 200 and success property equals true in response body", async function () {
      try {
        const successLoginRes = await chai.request(app).post("/login").send({
          username: seed.existingUser.username,
          password: seed.existingUser.password,
        });

        expect(successLoginRes.status).to.equal(200);
        expect(successLoginRes.body).to.have.property("success").equal(true);

        await chai.request(app).get("/logout");
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });

    it("should return 401 if user does not exist or credentials are invalid", async function () {
      try {
        const credInvalidLoginRes = await chai
          .request(app)
          .post("/login")
          .send({
            username: seed.existingUser.username,
            password: "password",
          });
        expect(credInvalidLoginRes.status).to.be.equal(401);
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });

    it("should return 200 and a message if user tries to login while authenticated", async function () {
      try {
        const agent = chai.request.agent(app);
        await agent.post("/login").send({
          username: seed.existingUser.username,
          password: seed.existingUser.password,
        });

        const loginWhileAuthRes = await agent.post("/login").send({
          username: seed.existingUser.username,
          password: seed.existingUser.password,
        });

        expect(loginWhileAuthRes.status).to.equal(200);
        expect(loginWhileAuthRes.body)
          .to.have.property("message")
          .equal("Already authenticated.");

        await agent.get("/logout");
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });
  });

  // Utilize .request.agent from chai-http to authenticate user and perform requests as an authenticated user
  const agent = chai.request.agent(app);

  describe("GET /home to test user session", function () {
    it("should return 200 if user session exists", async function () {
      try {
        await agent.post("/login").send({
          username: seed.existingUser.username,
          password: seed.existingUser.password,
        });
        const authenticatedResponse = await agent.get("/home");
        expect(authenticatedResponse).to.have.status(200);
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });

    it("should return 401 if user session does not exist", async function () {
      try {
        const unauthenticatedResponse = await chai.request(app).get("/home");
        expect(unauthenticatedResponse.status).to.equal(401);
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });
  });

  describe("GET /logout to test logout", function () {
    it("should return 200 and 'Unauthenticated' if user logs out", async function () {
      try {
        await agent.post("/login").send({
          username: seed.existingUser.username,
          password: seed.existingUser.password,
        });
        const authenticatedResponse = await agent.get("/logout");
        expect(authenticatedResponse).to.have.status(200);
        expect(authenticatedResponse).to.have.property("body");
        expect(authenticatedResponse.body)
          .to.have.property("message")
          .equal("Unauthenticated.");
      } catch (error) {
        console.log(error);
        expect(error).to.be.null();
      }
    });
  });
  it("should return 'No user session to unauthenticate' if no user session exists to logout", async function () {
    try {
      const noSessionResponse = await agent.get("/logout");
      expect(noSessionResponse).to.have.status(200);
      expect(noSessionResponse).to.have.property("body");
      expect(noSessionResponse.body)
        .to.have.property("message")
        .equal("No user session to unauthenticate.");
    } catch (error) {
      console.log(error);
      expect(error).to.be.null();
    }
  });
});
