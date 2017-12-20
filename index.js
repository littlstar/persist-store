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

  async save(file, value) {
    const savePromises = []

    for (const persister of this.persisters) {
      // If `value` is not declared, we presume `file` is the value and use default filename
      if (value) {
        savePromises.push(persister.save(file, value))
      } else {
        savePromises.push(persister.save(file))
      }
    }

    await Promise.all(savePromises)
  }

  /**
   * Loads all files from persisters, checks they are all equal
   *
   * @param  {String} file Name of file to load
   * @return {Promise}     Promise which resolves to value
   */

  async load(file) {
    const loadPromises = []

    for (const persister of this.persisters) {
      // If `file` is not declared, we use the default filename
      loadPromises.push(persister.load(file))
    }

    const files = await Promise.all(loadPromises)

    // Creates set from all values to uniqify
    // Converts to Array
    // Filters all empty values (because who cares.)

    const uniques = Array.from(new Set(files)).filter(loadedFile => loadedFile.replace('\n', '') !== '')

    if (uniques.length > 1) {
      throw new Error(`File contents differ between sources! Aborting... ${JSON.stringify({ files })}`)
    }

    return uniques[0]
  }
}

module.exports = Persister
