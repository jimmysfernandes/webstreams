import { createServer } from 'node:http'
import optionsHandler from "./handlers/options.js";
import getHandler from "./handlers/get.js";

const PORT = 3000

createServer(async (req, res) => {
  const method = req.method
  console.log(`a new request [${method}] ${req.url}`)
  switch(method) {
    case 'OPTIONS':
      optionsHandler(req, res)
      .catch
    case 'GET':
      getHandler(req, res)
  }
})
  .listen(PORT)
  .on('listening', _ => console.log(`server is running at ${PORT}`))