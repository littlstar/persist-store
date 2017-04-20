## persist

`persist` enables you to persist files across data stores (locally, S3, custom data store).

## Install
```bash
npm install persist-store --save
```

## Quick Example
```javascript
const Persist = require('persist-store')

class LogIt {
  save(name, value) {
    console.log("this does nothing: ", name, value)
  }
  load(name) {
    console.log("shh, act like i loaded something", name)
  }
}

// example options
const persist = new Persist({
  services: {
    local: {
      dir: '../data'
    },
    s3: [{
      bucket: 'data'
    },
    {
      bucket: 'also-here'
    }],
    log: new LogIt()
  }
})

persist.save('file', '2017-04-04T12:00:00Z')
```

If no services are given, only a local persister is created and files are saved in $HOME/.persist

## Methods

### save
save(name, contents)

Saves a file across all stores
```javascript
persist.save('file', '2017-04-04T12:00:00Z')
```

### load
load(name)

Checks all data stores for the file, makes sure they are all equal, then returns the value
```javascript
persist
  .load('file')
  .then((file) => {
    console.log(`Here is the file: ${file}`)
  })
  .catch((error) => {
    console.error(`Something happened:`, { error: String(error.stack || error) })
  })
```
