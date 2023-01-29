import headers from '../config/headers.js'

const optionsHandler = async (req, res) => {
  res.writeHead(204, headers)
  res.end()
}

export default optionsHandler