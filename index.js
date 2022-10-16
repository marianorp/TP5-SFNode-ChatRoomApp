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



app.use(express.static(path.join(__dirname, 'public')))

const chatName = 'El Chat de Robertito'

//Run when a clint connect
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

    //emit is used for only the user concerned
    socket.emit('message', formatMessage(chatName, 'Welcome to Chat Room'))

    // Broadcast when a user connects , it's for all other users expet the
    // original user
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(chatName, `${username} has joined the chat`)
      )

    // Send users and room info
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

        // Send users and room info
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

  // use io.emit to notify all users together
})

// Server
server.listen(process.env.PORT || 3000, () =>
  console.log('Server Running on port 3000')
)


// app.listen(PORT, () => {
// 	console.log(`Server on port ${PORT}`)
// })