import { createReadStream } from 'node:fs'
import { setTimeout } from 'node:timers/promises'
import { Readable, Transform } from 'node:stream'

import querystring from 'node:querystring'
import csvtojson from 'csvtojson'
import headers from '../config/headers.js'

const parseQuery = (req) => {
  const rawQuery = RegExp('[^\?]*$').exec(req.url)[0]
  return querystring.parse(rawQuery)
}

const registerAbortController = (req) => {
  const abortController = new AbortController()
  req.once('close', _ => {
    console.log(`connection was closed!`)
    abortController.abort()
  })
  return abortController
}

const sentStatusResponse = (res) => {
  res.writeHead(200, headers)
}

const transformData = (chunk, controller) => {
  const data = JSON.parse(Buffer.from(chunk))
  const mappedData = {
    title: data.title,
    description: data.description,
    url: data.url_anime
  }
  controller.enqueue(JSON.stringify(mappedData).concat('\n'))
}

const createWritable = (res, chunks) => {
  return new WritableStream({
    async write(chunk) {
      chunks++
      console.log(`sends a new chunk: ${chunks}`)
      await setTimeout(1000)
      res.write(chunk)
    },
    close() {
      res.end()
    }
  })
}

const createReadable = async (chunks, offset = 0) => {
  const stream = createReadStream('./resources/animeflv.csv')
  
  return Readable.toWeb(stream)
    .pipeThrough(Transform.toWeb(csvtojson()))
    .pipeThrough(new TransformStream({transformData}))
    
}

const getHandler = async (req, res) => {
  try {
    let chunks = 0
    const query = parseQuery(req)
    const abortController = registerAbortController(req)
    sentStatusResponse(res)
    const readable = await createReadable(chunks, query.offset)
    await readable.pipeTo(
      createWritable(res, chunks), 
      { signal: abortController.signal }
    )
  } catch (e) {
    if (!e.message.includes('abort')) throw e
  }
}

export default getHandler
