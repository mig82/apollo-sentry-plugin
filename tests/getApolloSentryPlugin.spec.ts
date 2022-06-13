import { getApolloSentryPlugin } from '../src/getApolloSentryPlugin'
import { expect } from 'chai'

import * as Sentry from "@sentry/node"
import ApolloServerPlugin from 'apollo-server-plugin-base'

describe('Get a plugin instance', () => { // the tests container
	it('getApolloSentryPlugin', () => { // the single test
		const sentryPlugin = getApolloSentryPlugin("Test", 2000)
		expect(sentryPlugin).to.haveOwnProperty('serverWillStart')
		expect(sentryPlugin).to.haveOwnProperty('requestDidStart')
	})
})
