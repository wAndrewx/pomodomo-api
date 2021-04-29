const faker = require("faker");

// This password meets our regex checks and hasn't been found in a database breach
const validatedPassword = "Password!)10";

// Generate a random username and password to user for test cases
const newUser = {
  username: faker.internet.userName(),
  password: validatedPassword,
};
// This user will never exist in the database
const doesNotExistUser = {
  username: faker.internet.userName(),
  password: validatedPassword,
};
// Use existing account credentials for test cases
const existingUser = {
  username: "test3",
  password: validatedPassword,
};

// Second existing account to send DMs to
const anotherUser = {
  username: "anotherUser",
  password: validatedPassword,
};

// User account that has no messages associated
const ghostUser = {
  username: "ghost",
  password: validatedPassword,
};

// Request body for new create message with valid recipient and text
const validRecipientTextMsg = {
  recipient: "anotherUser",
  text: "Valid recipient and text field message.",
};

// 1001 character length string used to test direct message limit
const thousandOneCharString =
  "A3B1cHYLRrorUGIm3WYokp2SIg26BYJFc4tHJBLU0qJtLMQI8ecnaacKbB8gnb51HSrZ2kugtMTJQvJQs1LpD4RzKQiJ5cE4Bi45vSYHfO0jRrXnScaR0ujiqdDW5BvydFTZqQRuukXANMJeCYkFWjEYo0igJDICHwIVqJ6L9t1wemywY2bQNI0wlEgLVRQZtW0vFyXJ1qcwVEvJc7JJcZyPdHTtHnLZk710VMCtm9qt3YNnxsUeJ3sFKv6FG52YBIZH9cg6hzOCL2c4rQdlg5bjwUoBvqpm7TSmjTmf7eqVSLtvwQgjfs01rwtDtaKcIdTgXhkMLjv7eJSPrETvoJqtB9dnPFu2fY1Q0jwK2VOKlJ1IMrJ82TXqw4WlCGbEu2HBbPfJJBshK0CIL3trBLW8Wkb679LVG17ycjXuwPxf5ztN5RhejvKPdtt54EAPqBdGk4KVH1OzxSSWVcHWWsJb8K1TGtv5i51sxo68fHSTFQXAPUQZ4U7mHXk2sZNJGuLvcoxEIf8GVU3r71uu5RzOn5uHgqCYtzVso978LDUnBuJAO2ZuhN7BylMCFnulYMSae45O29WfeTczitrmMUpTXsldpwCQ5sgtnNQaXVu2AyHYd76huMb0Bun1HXjD0dfXkXSCqKg84CsTCmBK20dQSHObivWFo1G1ByoPZO3jF1I4GBoMfRbZ8ShjCv3ZDs9KMZXmfJZ2f1uInpZiGE12DqG3D5Lminjl9zWB83rl6JmcCVwOfYHl9uZ25AjmIl9sqzcxBj7bjkHdDlD3eM9entf79ceze3q8AF3uII22LUVjqFZDsXMNMwarplqBfHhtg8zeHptZhLYaPFVjp1HljRUKD7cAcvUH2dy04vxBht1WxYObpsH8h53O8LGlC6pZVZakKCa41aHaSXI7CthEE4IHQUhyWDIV226HArs3nFm6NYFPjM0L0lDvEvq4UFNTNWgTTMzhvBMpabNBF5X3Hl1hwK2zzWrmi7GiX";

module.exports = {
  validatedPassword,
  newUser,
  doesNotExistUser,
  existingUser,
  anotherUser,
  ghostUser,
  validRecipientTextMsg,
  thousandOneCharString,
};
