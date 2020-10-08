const fs = require('fs')
const config = require('./niceshot.options')

const aws = require('aws-sdk')

function local(filename) {
  console.log('Storing locally')

  return new Promise((resolve, reject) => {
      resolve(filename)
  })
}

function s3 (filename) {
  const options = config.storage.options

  const client = new aws.S3({
      accessKeyId: options.access_key_id,
      secretAccessKey: options.access_key_secret,
  })

  const temporaryPath = `tmp/${filename}`
  const content = fs.readFileSync(temporaryPath)
  const directory = options.directory || ''

  return new Promise((resolve, reject) => {
    client.upload({
        Bucket: options.bucket,
        Key: `${directory}${filename}`,
        Body: content
    }, (err, data) => {
      // Unlink tmp file
      try {
          fs.unlink(temporaryPath)
      } catch (exception) {
      }

      if (err) {
          reject(err)
          return
      }

      return resolve(data.Location)
    })
  })
}

function upload(filename) {
    switch (config.storage.adapter) {
        case 's3':
            return s3(filename)

        default:
            return local(filename)
    }
}

module.exports = {
  upload
}
