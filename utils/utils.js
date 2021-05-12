require("dotenv").config();
const nodemailer = require("nodemailer");

// Middleware to check if a user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Please log in to access this route." });
};

// Don't allow action if authenticated
const prohibitAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  res.status(200).json({ message: "Already authenticated." });
};

//To check a password has at least 8 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character
const passwordRegexCheck = (password) => {
  // https://www.w3resource.com/javascript/form/password-validation.php
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,}$/;

  return regex.test(password);
};

// Send a verification email to the newly registered account's email address
const sendEmail = (email, hash, username) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PW,
    },
  });

  //const link = `http://localhost:3000/confirmation/${hash}`;
  const link = `https://www.pomodomo.ca/verification/${hash}`;

  let mailOptions = {
    from: `"pomodomo 👻" <${process.env.GMAIL_EMAIL}>`, // sender address
    to: email, // list of receivers
    subject: "[CONFIRM] verify account for pomodomo ✔", // Subject line
    html: `Hello ${username},<br> Please click on the link to verify your email.<br><a href="${link}">Click here to verify</a>`, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message:
          "Technical Issue! Please try again later or request assistance.",
      });
    }

    console.log("Email sent.");
    res.status(200).json({
      message: `A verication email has been sent to ${email}. Please check your inbox and click on the link or click resend.`,
    });
  });
};

module.exports = {
  ensureAuthenticated,
  prohibitAuthenticated,
  passwordRegexCheck,
  sendEmail,
};
