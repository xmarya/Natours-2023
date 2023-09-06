const nodemailer = require("nodemailer");
const pug = require("pug");
const { convert } = require('html-to-text');
const { google } = require("googleapis");
const User = require("../models/userModel");


const OAuth2 = google.auth.OAuth2;

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = process.env.EMAIL_USERNAME; 
  }

  async newTransport() {
    // we're going to set different transport whether we're in production which in this case we want a real email or not if we're in development we're going to use mailtrap .
    if (process.env.NODE_ENV === "production") {

      const oauth2Client = new OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN,
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            console.log("*ERR: ", err)
            reject();
          }
          resolve(token); 
        });
      });
          return nodemailer.createTransport({
            service: "gmail",
            // port: 465,
            // secure: true,
            // logger: true,
            // debug: true,
            auth: {
              type: "OAuth2",
              user: process.env.EMAIL_USERNAME,
              pass: process.env.APP_PASSWORD,
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: accessToken
            },
          });

    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.TRAP_USERNAME,
        pass: process.env.TRAP_PASSWORD,
      },
    });
  }

  // this one is going to sen the actual Email.
  async send(template, subject) {
    //1) Rendering the HTML based on pug template :
    // response.render(""); NOTE: we've used render() so far, render creates behind the scene the HTML based on the pug template we pass in,
    // but in our case now we dont want a HTML, so we won't use it here .
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
        // this works exactly like render() so we can pass variables o the template .
        firstName: this.firstName,
        url: this.url,
        subject
    });
    // 2) Defining the email options :
    const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html, {wordwrap: false})
      };

    // 3) Creating a transport and Sending the email :
    const transporter = await this.newTransport();
    await transporter.sendMail(mailOptions);

  }
  
  async sendWelcome() {
    await this.send("welcome","Welcome to the Natours Family!");
  }

  async sendResetPassword() {
    await this.send("resetPassword", "Reset your Password in Natours");
  }
};

/*
const sendEmail = async (options) => {
  // 1- Creating a transporter (the service which sends the email):

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2- Defining the email options:
  const mailOptions = {
      from: "Marya Alharbi <marya.josd@gmail.com>",
      to: options.email,
      subject: options.subject,
      text: options.text,
      // html:
    };
    
    // 3- Sending: (returns a promise)
    //   await transporter.sendMail(mailOptions);
};
*/

/*
const oauth2Client = new OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
          );
   
          oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN,
          });
   
          const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
              if (err) {
                console.log("*ERR: ", err)
                reject();
              }
              resolve(token); 
            });
          });

          + user: process.env.EMAIL_USERNAME,accesstoken 
*/

