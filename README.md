# Sentry Plugin

A Sentry Plugin for Apollo Server which implements performance and error tracking.

```ts
import { getApolloSentryPlugin } from 'apollo-sentry-plugin'

// Checks that you have an env var SENTRY_DSN and fails if you don't, or if it's of an invalid syntax.
const apolloSentryPlugin = getApolloSentryPlugin(`My Apollo Server`)

const server = new ApolloServer({
	typeDefs,
	resolvers,
	dataSources,
	csrfPrevention: true,
	// Here we go.
	plugins: [apolloSentryPlugin]
})
```

## Why?

Because while there are a few articles on how to do this, somehow I still found it painful to do it the 
first time around, and I'm a fan of fixing every problem once.

## Credits

Took bits and pieces from the following docs and articles:

* [Performance Monitoring for Node.js | Sentry Docs](https://docs.sentry.io/platforms/node/performance/)
* [Adding Sentry to Apollo+Serverless (Lambda)](https://medium.com/@corims/adding-sentry-to-apollo-serverless-lambda-e65e8b9e00cf)
* [Handling GraphQL Errors Using Sentry | Product Blog • Sentry](https://blog.sentry.io/2020/07/22/handling-graphql-errors-using-sentry)
