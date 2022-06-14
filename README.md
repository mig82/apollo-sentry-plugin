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

## Disclaimer

This is just a rough idea at the moment. It is *not* well tested yet. Use at your own risk.
