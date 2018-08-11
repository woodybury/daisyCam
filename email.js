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

module.exports.sendMail = (image) => {
  fs.readFile('mail-list.json', 'utf8', function readFileCallback(err, data){
    if (err){
      console.log(err);
    } else {
      let obj = JSON.parse(data);
      let emails = [];
      for (let key in obj) {
        emails.push(obj[key]);
      }
      for (let i = 0; i < emails.length; i++) {
        let text = 'Hi ' + Object.keys(obj)[i] +', check out the doobin!';
        let mailOptions = {
          from: env.emailAddress,
          to: emails[i],
          subject: 'Daisy is LIVE 🐶',
          html: "<p>" + text + "<br><a href='http://d4isy.com'>D4isy.com</a><br><img src='http://d4isy.com/api/images/files/" + image +"'>"
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

module.exports.addEmail = (name,email) => {
  fs.readFile('mail-list.json', 'utf8', function readFileCallback(err, data){
    if (err){
      console.log(err);
    } else {
      let obj = JSON.parse(data);
      obj[name] = email;
      let json = JSON.stringify(obj);
      fs.writeFile('mail-list.json', json, 'utf8', function writeFileCallback(err){
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