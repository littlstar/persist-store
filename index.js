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
    let services = opts.services || { 'local': [defaultLocal], 's3': [defaultS3] }

    this.persisters = []

    Object.keys(services).forEach(service => {
      if (Array.isArray(service)) {
        service.forEach(persister => {
          this.persisters.push(require(`./lib/persisters/${service}`)(persister))
        })
      } else {
        this.persisters.push(require(`./lib/persisters/${service}`)(services[service]))
      }
    })
  }

  save(name, value) {
    let savePromises = []

    this.persisters.forEach(persister => {
      savePromises.push(persister.save(name, value))
    })

    return Promise.all(savePromises)
  }

  load(name) {
    let loadPromises = []

    this.persisters.forEach(persister => {
      loadPromises.push(persister.load(name))
    })

    return new Promise((resolve, reject) => {
      Promise.all(loadPromises)
        .then((values) => {
          const uniques = Array.from(new Set(values)).filter(item => item !== '')

          if (uniques.length > 1) {
            console.error('File contents differ between sources! Aborting...', { values })

            return reject('Could not resolve stored values...')
          }

          return resolve(uniques[0])
        })
        .catch(reject)
    })
  }
}

module.exports = Persist