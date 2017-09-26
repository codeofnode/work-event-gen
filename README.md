# work-event-generator
> The work event generator

## How to start
```
$ npm install
$ npm start
```

## How to use with options
```
$ npm start -- -- [-d=report] [-p=<current60days>]
```
* Keep a `input.json` file in process cwd directory
* -d=report directory (can be configured with -d), where the file will be written
* -p=<startdate-enddate>

# Directory structure
* index.js - the main entry file
* lib - the independent liraries like `request`, `util` etc
* src - the source code in form of modules (classes). There are two classes
  * Service (that's the main service)
  * Generator (that's main event generator)

## How to test
```
$ npm test
```

## How to test, finding coverage, build, running lint, docs everything
```
$ npm run all
```

## License
MIT © [Ramesh Kumar](codeofnode-at-the-rate-gmail-dot-com)
