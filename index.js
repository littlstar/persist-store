'use strict'

const path = require('path')

const defaultLocal = {
  dir: path.resolve('./data')
}

const defaultS3 = {
  bucket: 'files',
  prefix: ''
}

class Persist {
  constructor(opts) {
    let services = opts.services || { 'local': defaultLocal, 's3': defaultS3 }

    this.persisters = []

    Object.keys(services).forEach(name => {
      this.persisters.push(require(`./lib/persisters/${name}`)(services[name]))
    })
  }

  save(name, value) {
    let savePromises = []

    this.persisters.forEach(persister => {
      savePromises.push(persister.save(name, value))
    })

    return Promise.all(savePromises)
      .then(() => {
        console.info(`Successfully saved ${name}`)
      })
      .catch((err) => {
        console.error(`Error occurred while saving ${name}`, { error: String(error.stack || error) })
      })
  }

  load(name) {
    let loadPromises = []

    this.persisters.forEach(persister => {
      loadPromises.push(persister.load(name))
    })

    return new Promise((resolve, reject) => {
      Promise.all(loadPromises)
        .then((values) => {
          if (new Set(values).length > 1) {
            console.error('File contents differ between sources! Aborting...', { values })
            return reject('Could not resolve stored values...')
          }

          return resolve(values[0])
        })
        .catch(reject)
    })
  }
}

module.exports = Persist