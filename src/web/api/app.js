#!/usr/bin/env node
// @flow
import express from 'express'
import graphqlHTTP from 'express-graphql'
import { schema, root } from './graphql/schema'
import path from 'path'

const app = express()

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}))

app.use('/(*/)?scripts', express.static(path.join(__dirname, '../client/scripts')))

app.use('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
