# Pomodomo API
A backend exposing an API for [pomodomo-frontend](https://github.com/khoaHyh/pomodomo-frontend)

## Local development   

#### `Setup`
```shell
$ git clone https://github.com/khoaHyh/pomodomo-api.git

$ cd pomodomo-api

$ npm i
```

#### `.env file`
> The method you use to come up with the session secret is up to your preference. You can set up your own MongoDB cluster using MongoAtlas for free.
```shell
SESSION_SECRET=createYourOwnSessionSecret
MONGO_URI='mongodb+srv://<username>:<password>@clusterName.somethingElseHere.mongodb.net/databaseNameHere?retryWrites=true&w=majority'

```
#### `Run server`
```shell
$ npm run dev
```
#### `Test`
```shell
$ npm test
```

## Features
  * Endpoints with Unit/Integration testing
      * User registration using unique username  and password
      * User login (including session maintenance)

## Tech/framework used
#### Built with:                                                                 
  * MongoDB
  * Express
  * Node.js
  * Mocha
  * Chai
  * Passport.js
