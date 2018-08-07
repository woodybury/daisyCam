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
      emails = emails.toString();

      let mailOptions = {
        from: env.emailAddress,
        to: emails,
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
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

addEmail('woody','whshortridge@gmail.com');
sendMail();