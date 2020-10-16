const BeeQueue = require('bee-queue')
const queue = new BeeQueue('niceshot')

const niceshot = require('./niceshot')

const storage = require('./storage')

const axios = require('axios')

function push(data) {
    const job = queue.createJob(data)
    job.timeout(1000 * 60 * 4)
    job.retries(2)
    job.save()
}

function uniqid() {
    const ts = String(new Date().getTime())
    let out = ''

    for(let i = 0; i < ts.length; i += 2) {
        out += Number(ts.substr(i, 2)).toString(36)
    }
    return 'niceshot_' + out;
}

async function process(job, done) {
    console.log(`Processing job ${job.id}`)

    const filename = `${uniqid()}.png`

    const options = {...job.data, filename}

    const { url, selector, callback } = job.data
    const niceshotOptions = { url, selector, filename }

    await niceshot.capture(options.url, niceshotOptions)

    storage.upload(filename)
        .then(uploadedFile => {
            done(null, {success: true, filename: uploadedFile})
        })
        .catch(err => {
            done(null, {success: false})
        })

    if (callback !== undefined) {
        axios.post(callback, {
            body: {
                filename
            }
        })
    }

    return done(null, {
        filename
    })
}

function run() {
    queue.process(process)
}

module.exports = {
    push,
    run
}
