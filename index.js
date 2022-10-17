const fs = require('fs');
const path = require('path')
const formatMessage = require('./utils/messages')
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./utils/users')

const PORT = process.env.PORT || 3000

const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const bodyParser = require('body-parser')

const router = express.Router()




const email = require("./email")
app.use(bodyParser.json({ type: "application/json" }))

app.use("/email" , email)

server.listen(process.env.PORT || 3000, () =>
  console.log('Server Running on port 3000')
)



app.use(express.static(path.join(__dirname, 'public')))

const chatName = 'El Chat de Robertito'

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)



    socket.join(user.room)

    var nuevoHistorial = {
      user : username , 
      createdAT : new Date()
    }

    if(fs.existsSync("users.json")){
      var userHistorial = JSON.parse(fs.readFileSync("users.json","utf-8"))
      const registrado = userHistorial.find(index => index.user === username)
      console.log(registrado)
      if (registrado === undefined) {
        userHistorial.push(nuevoHistorial)
        fs.writeFileSync("users.json" , JSON.stringify(userHistorial))
      }
    }else {
      fs.writeFileSync("users.json" , JSON.stringify([nuevoHistorial]))
    } 


    socket.emit('message', formatMessage(chatName, 'Welcome to Chat Room'))


    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(chatName, `${username} has joined the chat`)
      )


    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    })

    socket.on('disconnect', () => {
      const user = userLeave(socket.id)
      if (user) {
        io.to(user.room).emit(
          'message',
          formatMessage(chatName, `${user.username} has left the chat`)
        )


        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room),
        })
      }
    })

    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id)
      
      
        io.to(user.room).emit(
          'message',
          formatMessage(user.username, msg)
          )
          
          var nuevoMensaje = `[${new Date()}] ${username} : ${msg} (${user.room}) \n `

        if(fs.existsSync("historialChat.txt")){
          var historial = fs.readFileSync("historialChat.txt","utf-8")
          historial += nuevoMensaje
          fs.writeFileSync("historialChat.txt" , historial)
        }else {
          fs.writeFileSync("historialChat.txt" , nuevoMensaje)
        } 
      
    })
  })


})



