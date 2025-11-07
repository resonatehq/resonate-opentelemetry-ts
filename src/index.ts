import {
	type Context,
	context,
	propagation,
	type Span,
	type Tracer,
	trace,
} from "@opentelemetry/api";

export class OpenTelemetryTracer {
	private t: Tracer;

	constructor(name: string, version?: string) {
		this.t = trace.getTracer(name, version);
	}

	startSpan(id: string, startTime: number): OpenTelemetrySpan {
		const span = this.t.startSpan(id, { startTime: startTime });
		const ctx = trace.setSpan(context.active(), span);

		return new OpenTelemetrySpan(this.t, ctx, span);
	}

	decode(headers: Record<string, string>): OpenTelemetrySpan {
		const ctx = propagation.extract(context.active(), headers);
		return new OpenTelemetrySpan(this.t, ctx);
	}
}

export class OpenTelemetrySpan {
	private t: Tracer;
	private c: Context;
	private s?: Span;

	constructor(t: Tracer, c: Context, s?: Span) {
		this.t = t;
		this.c = c;
		this.s = s;
	}

	startSpan(id: string, startTime: number): OpenTelemetrySpan {
		const span = this.t.startSpan(id, { startTime: startTime }, this.c);
		const ctx = trace.setSpan(this.c, span);
		return new OpenTelemetrySpan(this.t, ctx, span);
	}

	encode(): Record<string, string> {
		const headers: Record<string, string> = {};
		propagation.inject(this.c, headers);
		return headers;
	}

	setAttribute(key: string, value: string | number | boolean): void {
		this.s?.setAttribute(key, value);
	}

	end(endTime: number): void {
		this.s?.end(endTime);
	}
}
