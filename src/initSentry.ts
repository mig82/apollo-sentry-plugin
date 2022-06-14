import * as Sentry from "@sentry/node"
import {ApolloSentryPluginError} from './ApolloSentryPluginError'

const defaultTracesSampleRate = 0.1
const sentryDsnRegex = /https:\/\/[0-9a-f]{32}@[a-z][0-9]{7}\.ingest\.sentry\.io\/[0-9]{7}/gmi;

export function validateEnv(){
	if(typeof process.env.SENTRY_DSN === 'undefined') {
		throw new ApolloSentryPluginError(`Missing env var SENTRY_DSN: Sentry needs a DSN to be initialised.`)
	}
	else if(!sentryDsnRegex.test(process.env.SENTRY_DSN)){
		throw new ApolloSentryPluginError(`Env var SENTRY_DSN does not look like a valid Sentry DSN URL: '${process.env.SENTRY_DSN}'`)
	}
	console.log(`SENTRY_DSN set to '%s'`, process.env.SENTRY_DSN)

	if(typeof process.env.SENTRY_TRACES_SAMPLE_RATE == 'undefined') {
		console.warn(`Missing env var SENTRY_TRACES_SAMPLE_RATE: Will use default ${defaultTracesSampleRate}.`)
	}
	else{
		console.log(`Env var SENTRY_TRACES_SAMPLE_RATE: %s`, process.env.SENTRY_TRACES_SAMPLE_RATE)
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
