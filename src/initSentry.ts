import * as Sentry from "@sentry/node"
import {ApolloSentryPluginError} from './ApolloSentryPluginError'

const defaultTracesSampleRate = 0.1

function validateEnv(){
	if(typeof process.env.SENTRY_DSN == 'undefined') {
		throw new ApolloSentryPluginError(`Missing env var SENTRY_DSN: Sentry needs a DSN to be initialised.`)
	}
	console.log(`SENTRY_DSN set to %s`, process.env.SENTRY_DSN)

	if(typeof process.env.SENTRY_TRACES_SAMPLE_RATE == 'undefined') {
		console.warn(`Missing env var SENTRY_TRACES_SAMPLE_RATE: Will use default ${defaultTracesSampleRate}.`)
	}
}

export function initSentry(): void{
	// Load .env file if present.
	require('dotenv').config()
	validateEnv()
	
	Sentry.init({
		dsn: process.env.SENTRY_DSN || "",
		// Set tracesSampleRate to 1.0 to capture 100% for performance monitoring. Adjust in production
		tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? +process.env.SENTRY_TRACES_SAMPLE_RATE : defaultTracesSampleRate
	})
}
