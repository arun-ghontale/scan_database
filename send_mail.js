const nodemailer = require('nodemailer');
const details = require('./details')

function sendMail(mail) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: details.user,
      pass: details.pass
    }
  });

  var mailOptions = {
    from: details.user,
    to: details.user,
    subject: mail.subject,
    text: mail.text,
    attachments: [{ // utf-8 string as an attachment
      filename: 'Log.txt',
      content: mail.logStatus
    }]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  })
};

module.exports = sendMail