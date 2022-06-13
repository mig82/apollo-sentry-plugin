import { validateEnv } from '../src/initSentry' // this will be your custom import
import { expect } from 'chai'

import * as Sentry from "@sentry/node"
import { ApolloSentryPluginError } from '../src/ApolloSentryPluginError'

xdescribe('Test init', () => { // the tests container
	it('without SENTRY_DSN env var', () => { // the single test
		
		expect(validateEnv()).to.throw()
	})


	it(`with SENTRY_DSN env var`, () => {
		process.env.SENTRY_DSN = 'foo'
		expect(validateEnv()).to.not.throw()
	})
})
