'use strict'

const defaultPersisters = ['s3', 'local']

class Persister {

  /**
   * Creates persisters for saving and loading
   *
   * @param  {Object} opts Description of persisters
   * @return {Persist}     Persister
   */

  constructor(services) {
    this.persisters = []

    services.forEach((service) => {
      if (defaultPersisters.indexOf(service.type) > -1) {
        const PersisterModule = require(`./lib/persisters/${service.type}`)

        this.persisters.push(new PersisterModule(service))
      } else {
        this.persisters.push(service.implementation)
      }
    })
  }

  /**
   * Saves given value to the created persisters
   *
   * @param  {String} name  Name of file to save
   * @param  {String} value Value of the file
   * @return {Promise}      Promise which resolves to statuses of save
   */

  save(value) {
    const savePromises = []

    this.persisters.forEach((persister) => {
      savePromises.push(persister.save(value))
    })

    return Promise.all(savePromises)
  }

  /**
   * Loads all files from persisters, checks they are all equal
   *
   * @param  {String} name Name of file to load
   * @return {Promise}     Promise which resolves to value
   */

  load() {
    const loadPromises = []

    this.persisters.forEach((persister) => {
      loadPromises.push(persister.load())
    })

    return new Promise((resolve, reject) => {
      Promise.all(loadPromises)
        .then((values) => {

          // Creates set from all values to uniqify
          // Converts to Array
          // Filters all empty values (because who cares.)

          const uniques = Array.from(new Set(values)).filter(item => item !== '')

          if (uniques.length > 1) {
            return reject(new Error(`File contents differ between sources! Aborting... ${JSON.stringify({ values })}`))
          }

          return resolve(uniques[0])
        })
        .catch(reject)
    })
  }
}

module.exports = Persister
