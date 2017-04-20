## persist

`persist` enables you to persist files across data stores (locally, S3, custom data store).


## Install
```bash
npm install persist --save
```

## Quick Example
```javascript
const Persist = require('persist')

// example options
const persist = Persist({
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
    custom: {
      context: {}
      save: function (name, contents, context) {},
      load: function (name, context) {}
    }
  }
})

persist.save('file', '2017-04-04T12:00:00Z')
```

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
