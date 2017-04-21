'use strict'

const mkdirp = require('mkdirp').sync
const rimraf = require('rimraf').sync
const Persist = require('../')
const test = require('tape')
const path = require('path')
const fs = require('fs')

const folderName = 'data'
const bucketName = 'bucket'
const dataPath = path.resolve(__dirname, folderName)
const bucketPath = path.resolve(dataPath, bucketName)

class customPersister {
  constructor(opts) {
    this.values = {}
    opts.initial.forEach(obj => {
      this.values[obj.name] = String(obj.value)
    })
  }

  save(name, value) {
    this.values[name] = value
  }

  load(name) {
    return this.values[name]
  }
}

let persist

function reset(persisters) {
  rimraf(dataPath)
  mkdirp(bucketPath)

  persist = new Persist(persisters)

  fs.writeFileSync(path.resolve(`${bucketPath}/file`), '1234')
}

test('local load', (t) => {
  t.plan(1)

  reset([
    {
      type: 'local',
      path: bucketPath
    }
  ])

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})

test('s3 load', (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath: dataPath,
      bucket: bucketName
    }
  ])

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})

test('s3 + local load', (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath: dataPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: bucketPath
    }
  ])

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})

test('s3 + local + custom load', (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath: dataPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: bucketPath
    },
    {
      type: 'custom',
      implementation: new customPersister({
        initial: [
          { name: 'file', value: 1234 },
          { name: 'test2', value: 3456 }
        ]
      })
    }
  ])

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})

test('differing values load', (t) => {
  t.plan(1)

  const differingPath = path.resolve(__dirname, 'differing')

  reset([
    {
      type: 's3',
      localPath: dataPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: differingPath
    }
  ])

  fs.writeFileSync(path.resolve(`${differingPath}/file`), '4567')

  persist
    .load('file')
    .then(() => {})
    .catch((e) => {
      console.log("EE:", e)
      t.ok(!!e)
    })
})

test('only return non-empty value', (t) => {
  t.plan(1)

  const differingPath = path.resolve(__dirname, 'differing')

  reset([
    {
      type: 's3',
      localPath: dataPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: differingPath
    }
  ])

  fs.writeFileSync(path.resolve(`${differingPath}/file`), '')

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})