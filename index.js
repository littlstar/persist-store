'use strict'

const path = require('path')

const defaultLocal = {
  dir: '$HOME/.persist/'
}

class Persister {
  /**
   * Creates persisters for saving and loading
   * @param  {Object} opts Description of persisters
   * @return {Persist}     Persister
   */
  constructor(opts) {
    let services = opts.services || { 'local': [defaultLocal] }

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

    return this
  }

  /**
   * Saves given value to the created persisters
   * @param  {String} name  Name of file to save
   * @param  {String} value Value of the file
   * @return {Promise}      Promise which resolves to statuses of save
   */
  save(name, value) {
    let savePromises = []

    this.persisters.forEach(persister => {
      savePromises.push(persister.save(name, value))
    })

    return Promise.all(savePromises)
  }

  /**
   * Loads all files from persisters, checks they are all equal
   * @param  {String} name Name of file to load
   * @return {Promise}     Promise which resolves to value
   */
  load(name) {
    let loadPromises = []

    this.persisters.forEach(persister => {
      loadPromises.push(persister.load(name))
    })

    return new Promise((resolve, reject) => {
      Promise.all(loadPromises)
        .then((values) => {

          // Creates set from all values to uniqify
          // Converts to Array
          // Filters all empty values (because who cares.)

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

module.exports = Persister