import * as Sentry from "@sentry/node"
import * as Tracing from "@sentry/tracing"
import { TransactionContext } from "@sentry/types"
import { ApolloServerPlugin, GraphQLRequestContext } from 'apollo-server-plugin-base'

import { initSentry } from "./initSentry"

export function getApolloSentryPlugin(name: String = 'Server', timeout: number = 2000): ApolloServerPlugin {

	const apolloSentryPlugin: ApolloServerPlugin = {

		async serverWillStart() {
			console.log(`${name} starting up...`)
			initSentry()
		},
	
		async requestDidStart(requestContext: GraphQLRequestContext) {
	
			const txContext: TransactionContext = {
				op: requestContext.request.operationName,
				name: requestContext.request.operationName || '',
				data: requestContext.request.variables
			}
			const transaction = Sentry.startTransaction(txContext)
			// console.log('Request started!')
	
			return {
				async willSendResponse(requestContext) {
					transaction.finish()
				},
	
				async didEncounterErrors(requestContext: GraphQLRequestContext){
					// Iterate over the errors found and capture each.
					requestContext.errors?.forEach(error => {
						console.error(error)
						Sentry.configureScope(scope => {
							scope.setExtra('resolver', requestContext.operationName)
							scope.setExtra('variables', requestContext.request && requestContext.request.variables)
							scope.setExtra('context', requestContext)
						})

						// TODO: Sentry complains that this is not a proper error. Must transform it into one.
						Sentry.captureException(error)
					})

					await Sentry.flush(timeout)
				}
			}
		},
	}

	return apolloSentryPlugin
}

