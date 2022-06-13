import * as Sentry from "@sentry/node"
import * as Tracing from "@sentry/tracing"
import { TransactionContext } from "@sentry/types"
import { ApolloServerPlugin, GraphQLRequestContext } from 'apollo-server-plugin-base'
import { ApolloError } from 'apollo-server'

import { initSentry } from "./initSentry"

export function getApolloSentryPlugin(name: String = 'Server', timeout: number = 2000): ApolloServerPlugin {

	const apolloSentryPlugin: ApolloServerPlugin = {

		async serverWillStart() {
			console.log(`${name} starting up...`)
			initSentry()
		},

		async requestDidStart(ctx: GraphQLRequestContext) {

			const txContext: TransactionContext = {
				op: ctx.request.operationName,
				name: ctx.request.operationName || '',
				data: ctx.request.variables
			}
			const transaction = Sentry.startTransaction(txContext)
			// console.log('Request started!')

			return {
				async willSendResponse(ctx) {
					transaction.finish()
				},

				async didEncounterErrors(ctx: GraphQLRequestContext) {

					// Ignore if operation could not be resolved, including validation errors.
					if (!ctx.operation) {
						return;
					}
					// Iterate over the errors found and capture each.
					for (const error of ctx.errors || []){
						console.error(error)

						// Report internal server errors only.
						if(error instanceof ApolloError){
							// TODO: Use a feature flag to control whether to log all errors or not.
							// continue
						}

						Sentry.configureScope(scope => {
							// Annotate whether failing operation was query/mutation/subscription
							scope.setTag("kind", ctx.operation?.operation)

							// Log query resolver and variables.
							scope.setExtra('resolver', ctx.operationName)
							scope.setExtra("query", ctx.request.query)
							scope.setExtra('variables', ctx.request?.variables)
							scope.setExtra('context', ctx)
							if(error.path) {
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

					await Sentry.flush(timeout)
				}
			}
		},
	}

	return apolloSentryPlugin
}

