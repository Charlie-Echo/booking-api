Kritayot Predalumpaburt's Booking API

## Installation

```bash
$ npm install
```

## Running the API

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev
```

## Before trying the API
- Please make sure to import the 3 CSV files into the respective PostgreSQL tables after their generations (right after you hit the run command above). e.g. import location.csv to the location table.
- Please make sure that you have Redis up and running in your machine. The author set up Redis with the following package: https://github.com/microsoftarchive/redis/releases
- You can try sending requests to endpoints with the provided Postman collection.
- The CSV files and the Postman collection are located in the miscellaneous folder.
