import { WriteStream, createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { Readable, Transform } from 'node:stream'
import csvtojson from 'csvtojson'
import { setTimeout } from 'node:timers/promises'
import optionsHandler from './handlers/options'

const port = 3000


const getHandler = async (req, res) => {
  const abortController = new AbortController()
  req.once('close', _ => {
    console.log('connection was closed')
    abortController.abort()
  })
  
  res.writeHead(200, headers)
  await Readable.toWeb(createReadStream('./animeflv.csv'))
    .pipeThrough(Transform.toWeb(csvtojson()))
    .pipeThrough(new TransformStream({
      transform(chunk, controller) {
        const data = JSON.parse(Buffer.from(chunk))
        const mappedData = {
          title: data.title,
          description: data.description,
          url: data.url_anime
        }
        controller.enqueue(JSON.stringify(mappedData).concat('\n'))
      }
    }))
    .pipeTo(new WritableStream({
      async write(chunk) {
        await setTimeout(200)
        res.write(chunk)
      },
      close() {
        res.end()
      }

    }), {
      signal: abortController.signal
    })  
}

createServer(async (req, res) => {
  const method = req.method

  switch(method) {
    case 'OPTIONS':
      optionsHandler(req, res)
    default:
      getHandler(req, res)
  }
})
  .listen(port)
  .on('listening', _ => console.log(`server is running at ${port}`))
