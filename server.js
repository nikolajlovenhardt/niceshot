const express = require('express')
const queue = require('./queue')

const config = require('./niceshot.options')

const port = config.api.port

const app = new express()

// Form body
const bodyParser = require('body-parser');
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Your server is running')
})

app.post('/queue', (req, res) => {
  console.log('Pushed to queue')

  const { url, selector} = req.body

  queue.push({
      url,
      selector
  })

  res.status(201).end();
})

app.listen(port, () => {
    console.log(`Listening at ${port}`)
})
