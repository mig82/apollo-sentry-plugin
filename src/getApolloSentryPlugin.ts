import * as Sentry from "@sentry/node"
import "@sentry/tracing"
import { Transaction, TransactionContext } from "@sentry/types"
import { ApolloServerPlugin, GraphQLRequestContext } from 'apollo-server-plugin-base'
import { ApolloError } from 'apollo-server'

import { initSentry } from "./initSentry"

export function getApolloSentryPlugin(name: String = 'Server', timeout: number = 2000): ApolloServerPlugin {

	const apolloSentryPlugin: ApolloServerPlugin = {
		async serverWillStart() {
			console.log(`1. ${name} starting up...`)
			initSentry()
			console.log(`2. ${name} Sentry intitialised!`)
		},

		async requestDidStart(ctx: GraphQLRequestContext) {

			// console.log(`3. startTransaction`)
			const transaction: Transaction = Sentry.startTransaction({
				op: 'gql',
				name: ctx.request.operationName || '',
				data: ctx.request.variables
			})

			// console.log(`4. tx: %s`, transaction.traceId)

			// Set transaction as the span of the scope, so that if an error happens during the transaction,
			// the transaction context will be attached to the error event.
			Sentry.configureScope(scope => {
				scope.setSpan(transaction);
			})

			return {
				async willSendResponse(ctx) {
					transaction.finish()
					console.log(`trasaction sent`)
					await Sentry.flush(timeout)
				},

				// TODO: Generate a span for each resolver for granular monitoring. See https://blog.sentry.io/2021/08/31/guest-post-performance-monitoring-in-graphql
				// async executionDidStart() {
				// 	return {
				// 		willResolveField({context: any, info: any}) { // hook for each new resolver
				// 			// const span = context.transaction.startChild({
				// 			const span = transaction.startChild({
				// 				op: "resolver",
				// 				description: `${info.parentType.name}.${info.fieldName}`,
				// 			})
				// 			return () => { // this will execute once the resolver is finished
				// 				span.finish()
				// 			}
				// 		}
				// 	}
				// },

				async didEncounterErrors(ctx: GraphQLRequestContext) {

					// Ignore if operation could not be resolved, including validation errors.
					if (!ctx.operation) {
						return
					}
					// Iterate over the errors found and capture each.
					for (const error of ctx.errors || []) {
						console.error(error)

						// Report internal server errors only.
						if (error instanceof ApolloError) {
							// TODO: Use a feature flag to control whether to log all errors or not.
							console.warn(`This seems to be a validation error. Won't send it to Sentry.. %o`, error)
							continue
						}

						Sentry.configureScope(scope => {
							// Annotate whether failing operation was query/mutation/subscription
							scope.setTag("kind", ctx.operation?.operation)

							// Log query resolver and variables.
							scope.setExtra('resolver', ctx.operationName)
							scope.setExtra("query", ctx.request.query)
							scope.setExtra('variables', ctx.request?.variables)
							scope.setExtra('context', ctx)
							if (error.path) {
								// Add the path as breadcrumb
								scope.addBreadcrumb({
									category: "query-path",
									message: error.path.join(" > "),
									// level: Sentry.Severity.Debug
								})
							}
						})

						// TODO: Sentry complains that this is not a proper error. Must transform it into one.
						Sentry.captureException(error)
					}

					// await Sentry.flush(timeout)
				}
			}
		},
	}

	return apolloSentryPlugin
}

