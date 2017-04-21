'use strict'

const mkdirp = require('mkdirp').sync
const rimraf = require('rimraf').sync
const Persist = require('../')
const test = require('tape')
const path = require('path')
const fs = require('fs')

const folderName = 'data'
const bucketName = 'bucket'
const localPath = path.resolve(__dirname, folderName)
const bucketPath = path.resolve(localPath, bucketName)

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

function reset(persisters, files) {
  rimraf(localPath)
  mkdirp(bucketPath)

  persist = new Persist(persisters)

  files.forEach(file => {
    fs.writeFileSync(path.resolve(file.path), file.value)
  })
}

test('local load', (t) => {
  t.plan(1)

  reset([
    {
      type: 'local',
      path: localPath
    }
  ], [
    { path: `${localPath}/file`, value: 1234 }
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
      localPath: localPath,
      bucket: bucketName
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' }
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
      localPath: localPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: localPath
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '1234' }
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
      localPath: localPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: localPath
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
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '1234' }
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
      localPath: localPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: localPath
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '4567' }
  ])

  persist
    .load('file')
    .then(() => {})
    .catch((e) => {
      t.ok(!!e)
    })
})

test('only return non-empty value', (t) => {
  t.plan(1)

  reset([
    {
      type: 's3',
      localPath: localPath,
      bucket: bucketName
    },
    {
      type: 'local',
      path: localPath
    }
  ], [
    { path: `${bucketPath}/file`, value: '1234' },
    { path: `${localPath}/file`, value: '' }
  ])

  persist
    .load('file')
    .then((value) => {
      t.equal(value, '1234')
    })
})