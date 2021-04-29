require("dotenv").config();
const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const { app } = require("../../server");
const seed = require("../seed");
const User = require("../../models/user");

chai.use(chaiHttp);

describe("Auth route", function () {
  // Clear database and register seed users for test cases
  before(async function () {
    try {
      await User.deleteMany({});
      const userArray = [seed.existingUser, seed.anotherUser, seed.ghostUser];

      // Loops through our userArray and makes async/await calls to register each account
      (async function registerUsers() {
        for (let i = 0; i < userArray.length; i++) {
          await chai.request(app).post("/register").send(userArray[i]);
        }
      })();
    } catch (error) {
      console.log(error);
    }
  });

  describe("POST /register", function () {
    it("should return 201 and user's id if successful", async function () {
      try {
        const successRegisterRes = await chai
          .request(app)
          .post("/register")
          .send(seed.newUser);
        expect(successRegisterRes.status).to.equal(201);
        expect(successRegisterRes.body).to.have.property("userId");

        await chai.request(app).get("/logout");
      } catch (error) {
        console.log(error);
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
      }
    });

    it("should return 422 if there are missing credentials", async function () {
      try {
        const credMissRegisterRes = await chai
          .request(app)
          .post("/register")
          .send({
            username: "",
            password: "",
          });
        expect(credMissRegisterRes.status).to.equal(422);
        expect(credMissRegisterRes.body)
          .to.have.property("message")
          .equal("Missing credentials");
      } catch (error) {
        console.log(error);
      }
    });

    /** USERNAME VALIDATION TESTS START **/
    it("should return 422 if username length >= 50 characters ", async function () {
      try {
        const longUsernameRegisterRes = await chai
          .request(app)
          .post("/register")
          .send({
            username: "324uw0g98u24qorjdslgj92qu3r98uf98sug829u4q98upsdgu",
            password: seed.validatedPassword,
          });
        expect(longUsernameRegisterRes.status).to.equal(422);
        expect(longUsernameRegisterRes.body)
          .to.have.property("message")
          .equal("Username cannot be 50 characters or longer.");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 422 if the username contains profanity", async function () {
      try {
        const profanityRegisterRes = await chai
          .request(app)
          .post("/register")
          .send({
            username: "badword",
            password: seed.validatedPassword,
          });
        expect(profanityRegisterRes.status).to.equal(422);
        expect(profanityRegisterRes.body)
          .to.have.property("message")
          .equal("Username must not contain profanity.");
      } catch (error) {
        console.log(error);
      }
    });
    /** USERNAME VALIDATION TESTS END **/

    /** PASSWORD VALIDATION TESTS START **/
    it("should return 422 if password doesn't pass regex checks", async function () {
      const regexRegisterRes = await chai.request(app).post("/register").send({
        username: "missingSpecialChar",
        password: "Password12",
      });
      expect(regexRegisterRes.status).to.equal(422);
      expect(regexRegisterRes.body)
        .to.have.property("message")
        .equal(
          "Password must contain at least 8 characters and must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character."
        );
    });

    it("should return 422 if password was found in database breach", async function () {
      const regexRegisterRes = await chai.request(app).post("/register").send({
        username: "myPasswordWasBreached",
        password: "Password!2",
      });
      expect(regexRegisterRes.status).to.equal(422);
      expect(regexRegisterRes.body)
        .to.have.property("message")
        .equal("Password has been found in database breach.");
    });
    /** PASSWORD VALIDATION TESTS END **/
  });

  describe("POST /login", function () {
    it("should return 200 and user's id if user successfully logs in", async function () {
      try {
        const successLoginRes = await chai
          .request(app)
          .post("/login")
          .send(seed.existingUser);

        expect(successLoginRes.status).to.equal(200);
        expect(successLoginRes.body).to.have.property("userId");

        await chai.request(app).get("/logout");
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 401 if user does not exist or credentials are invalid", async function () {
      try {
        const credInvalidLoginRes = await chai
          .request(app)
          .post("/login")
          .send(seed.doesNotExistUser);
        expect(credInvalidLoginRes.status).to.be.equal(401);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 200 and a message if user tries to login while authenticated", async function () {
      try {
        const agent = await chai.request.agent(app);
        await agent.post("/login").send(seed.existingUser);

        const loginWhileAuthRes = await agent
          .post("/login")
          .send(seed.existingUser);
        expect(loginWhileAuthRes.status).to.equal(200);
        expect(loginWhileAuthRes.body)
          .to.have.property("message")
          .equal("Already authenticated.");

        await agent.get("/logout");
      } catch (error) {
        console.log(error);
      }
    });
  });

  // Utilize .request.agent from chai-http to authenticate user and perform requests as an authenticated user
  const agent = chai.request.agent(app);

  describe("GET /home to test user session", function () {
    it("should return 200 if user session exists", async function () {
      try {
        await agent.post("/login").send(seed.existingUser);
        const authenticatedResponse = await agent.get("/home");
        expect(authenticatedResponse).to.have.status(200);
      } catch (error) {
        console.log(error);
      }
    });

    it("should return 401 if user session does not exist", async function () {
      try {
        const unauthenticatedResponse = await chai.request(app).get("/home");
        expect(unauthenticatedResponse.status).to.equal(401);
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe("GET /logout to test logout", function () {
    it("should return 200 and 'Unauthenticated' if user logs out", async function () {
      try {
        await agent.post("/login").send(seed.existingUser);
        const authenticatedResponse = await agent.get("/logout");
        expect(authenticatedResponse).to.have.status(200);
        expect(authenticatedResponse).to.have.property("body");
        expect(authenticatedResponse.body)
          .to.have.property("message")
          .equal("Unauthenticated.");
      } catch (error) {
        console.log(error);
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
    }
  });
});
