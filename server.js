const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const index = require("./routes");
const app = express();
app.use(index);
const server = http.createServer(app);
const io = socketIo(server, {
  upgrade: false,
});

io.on("connection", (socket) => {
  socket.on("data", function (data) {
    getApiAndEmit(socket, data);
  });

  socket.on("disconnect", () => console.log("Client disconnected"));
});

const getApiAndEmit = async (socket, symbols) => {
  symbols.forEach(async (symbol) => {
    try {
      const res = await axios.get(
        `https://api.stocktwits.com/api/2/streams/symbol/${symbol}.json`
      );
      socket.emit("FromAPI", res.data);
    } catch (error) {
      console.error(`Error: ${error.code}`);
    }
  });
};
server.listen(port, () => console.log(`Listening on port ${port}`));
