const nodemailer = require("nodemailer");
const fs = require('fs');

const express = require('express')
const router = express.Router()




router
    .get("/", (req,res)=> res.send("Haga un POST para enviar un mail"))
    .post('/', (req,res) => {
      console.log(req.body)
      var message = {
       // from: `"${req.body.name}" `, // sender address
        to: `${req.body.to}`, // list of receivers
        subject: `${req.body.subject}`, // Subject line
        text: `${req.body.text}`, // plain text body
        html: `${req.body.html}`,
      };
      main(message);
      res.status(202).json({message : "Enviado correctamente"})

    } )





// async..await is not allowed in global scope, must use a wrapper
async function main(msg) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "", // INGRESAR MAIL DE GOOGLE !!!!!
      pass: "", // INGRESAR CONTRASEÑA GENERADA POR GOOGLE !!!!!!
    },
  });




  // send mail with defined transport object
  
  


  let mail = await transporter.sendMail(msg);
  //
  //HISTORIAL 
  //
  if(mail){
      if(fs.existsSync("historial.json")){
          var mails = JSON.parse(fs.readFileSync("historial.json", "utf-8"))
          mails.push(msg)
          fs.writeFileSync("historial.json" , JSON.stringify(mails))
      }else {
          fs.writeFileSync("historial.json" , JSON.stringify([msg]))
      }
  }

  console.log("Message sent: %s", mail.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(mail));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}


module.exports=router