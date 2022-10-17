const nodemailer = require("nodemailer");
const fs = require('fs');

const express = require('express')
const router = express.Router()




router
    .get("/", (req,res)=> res.send("Haga un POST para enviar un mail"))
    .post('/', (req,res) => {
      console.log(req.body.text)
      var message = {
        from: '"Avalith TP5 👻" <foo@example.com>', // sender address
        to: `${req.body.to}`, // list of receivers
        subject: `${req.body.subject}`, // Subject line
       html: `<b>${req.body.text}</b>`, // html body
      };
      main(message);
      res.status(202).json({message : "Enviado correctamente"})

    } )






async function main(msg) {

  let testAccount = await nodemailer.createTestAccount();


  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
      user: "", // INGRESAR MAIL DE GOOGLE !!!!!
      pass: "", // INGRESAR CONTRASEÑA GENERADA POR GOOGLE !!!!!!
    },
  });





  var date = new Date();

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



  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(mail));

}


module.exports=router