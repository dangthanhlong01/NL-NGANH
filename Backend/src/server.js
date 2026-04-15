import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"

import connectDB from "./config/connectDB"
import configViewEngine from "./config/viewEngine"
import initWebRoutes from "./route/web"
import { sendMessage } from "./services/messageService"

dotenv.config()

// APP
const app = express()

// MIDDLEWARE
// app.use(cors({
//    origin: [
//     'http://localhost:5000',
//     '' // ← thêm cái này
//   ]
// }))
app.use(cors())
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))

// VIEW ENGINE
configViewEngine(app)

// ROUTES
initWebRoutes(app)

// HTTP + SOCKET
const server = http.createServer(app)
const socketIo = new Server(server, {
  cors: { origin: "*" }
})


socketIo.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("sendDataClient", async function (data) {  
    await sendMessage(data)
    socketIo.emit("sendDataServer", { data });
  })

  socket.on("loadRoomClient",  function (data) {
    console.log("data nhận được:", data)
    if (!data || !data.roomId) {
    console.log("Thiếu roomId!")
    return  
  }
    socket.join(data.roomId)
    socketIo.to(data.roomId).emit("loadRoomServer", { data });
  })
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});


// START SERVER
const PORT = process.env.PORT || 6969

  ; (async () => {
    try {
      await connectDB()
      server.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`)
      })
    } catch (error) {
      console.error("Cannot start server:", error)
    }
  })()