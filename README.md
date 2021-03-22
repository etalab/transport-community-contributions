# transport-community-contributions

transport.data.gouv.fr provides some "national" databases that are managed by the platform team. Those databases are the result of many individual contributions, concatenated in a single file.

An example of such a database is the [Base Nationale des Lieux de Covoiturage](https://transport.data.gouv.fr/datasets/base-nationale-des-lieux-de-covoiturage/), a list of carsharing areas in France.

The goal of this project is to allow anyone to update a national database, with the following constraints :
- the database is hosted on github
- anybody should be able to propose a change on it
- no github account is needed
- the transport.data.gouv.fr team review and validate each new proposal manually
- contributors contact or name should not appear publicly, but the transport team need to know them
- use of the tool should be easy
  
The deployed website is available at contribuer.transport.data.gouv.fr.

For the moment, the tool is only available for the national carsharing database, but may be extended to other datasets if it seems useful.

## Project setup
Install dependencies with
```
npm install
```

### Run the project locally
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Run tests
Run unit tests with
```
npm run test:unit
```

Run end to end tests with
```
npm run test:e2e
```

## Technical overview
The project is coded in javascript using the [vue.js framework](https://vuejs.org/).

The parsing of the csv file in the browser is done using [Papa Parse](https://www.papaparse.com/).

The computation of the diffs between the proposed file and the original one is done using [diff-match-patch](https://github.com/google/diff-match-patch).

When a user submits a change proposal, a pull request is created on the [database github repo](https://github.com/etalab/transport-base-nationale-covoiturage/). The anonymous PR is created using [octokit](https://github.com/octokit/rest.js). The PR contains no personal information, but the contributor name and contact is sent by email to the transport team along with the corresponding PR number.

When the transport team reviews and validate the PR, the database is automatically updated.
