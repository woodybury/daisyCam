const nodemailer = require('nodemailer');
const env = require('./env.json');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailAddress,
    pass: env.emailPassword
  }
});

sendMail = () => {
  fs.readFile('mailList.json', 'utf8', function readFileCallback(err, data){
    if (err){
      console.log(err);
    } else {
      let obj = JSON.parse(data);
      let emails = [];
      for (let key in obj) {
        emails.push(obj[key]);
      }
      // emails = emails.toString();
      for (let i = 0; i < emails.length; i++) {
        let mailOptions = {
          from: env.emailAddress,
          to: emails[i],
          subject: 'Daisy is LIVE 🐶',
          text: 'Hi ' + Object.keys(obj)[i] +', check out the doobin!'
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log(`Email sent: ${info.response}`);
          }
        });
      }
    }
  });
};

addEmail = (name,email) => {
  fs.readFile('mailList.json', 'utf8', function readFileCallback(err, data){
    if (err){
      console.log(err);
    } else {
      let obj = JSON.parse(data);
      obj[name] = email;
      let json = JSON.stringify(obj);
      fs.writeFile('mailList.json', json, 'utf8', function writeFileCallback(err){
        if (err){
          console.log(err);
        }}
      );
    }
  });
};

// addEmail('Cecily','cecily.m.parker@gmail.com');
// addEmail('Carter','carter.m.parker@gmail.com');
// sendMail();