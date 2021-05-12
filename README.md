# Pomodomo API

A backend exposing an API for [pomodomo](https://github.com/khoaHyh/pomodomo)

## Known Issues

  * Testing currently doesn't work for PostgreSQL databases yet

## Local development   

#### `Setup`
```shell
$ git clone https://github.com/khoaHyh/pomodomo-api.git

$ cd pomodomo-api

$ npm i
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
  * PostgreSQL
  * Express
  * Node.js
  * Mocha
  * Chai
  * Passport.js
  * Digital Ocean Ubuntu Droplet
  * Nginx
