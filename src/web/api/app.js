#!/usr/bin/env node
// @flow
import express from 'express'
import graphqlHTTP from 'express-graphql'
import Schema from './graphql/schema'

const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.use('/graphql', graphqlHTTP({
  schema: Schema,
  graphiql: true
}))

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
