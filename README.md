# @resonatehq/opentelemetry

`@resonatehq/opentelemetry` adds [OpenTelemetry](https://opentelemetry.io) tracing to the [Resonate](https://github.com/resonatehq/resonate) TypeScript SDK, propagating distributed trace context across durable function invocations and resumptions.

## Installation

```bash
npm install @resonatehq/opentelemetry
```

You will also need an OpenTelemetry SDK configured in your application. For Node.js, the [`@opentelemetry/sdk-node`](https://www.npmjs.com/package/@opentelemetry/sdk-node) package is a good starting point.

## Usage

Pass an `OpenTelemetryTracer` to the `Resonate` constructor via the `tracer` option:

```ts
import { Resonate, type Context } from "@resonatehq/sdk";
import { OpenTelemetryTracer } from "@resonatehq/opentelemetry";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";

// Initialize the OpenTelemetry SDK
const sdk = new NodeSDK({ traceExporter: new ConsoleSpanExporter() });
sdk.start();

// Wire up the Resonate tracer
const tracer = new OpenTelemetryTracer("my-resonate-app");

const resonate = new Resonate({ tracer });

resonate.register("checkout", function* checkout(ctx: Context, orderId: string): Generator {
  // Each rpc and run call will be captured as a child span
  yield* ctx.rpc("processPayment", orderId);
  yield* ctx.rpc("fulfillOrder", orderId);
});

await resonate.run("checkout.order-123", "checkout", "order-123");
```

`OpenTelemetryTracer` accepts either a tracer name (and optional version) or an existing `Tracer` instance from `@opentelemetry/api`:

```ts
// By name
const tracer = new OpenTelemetryTracer("my-service", "1.0.0");

// From an existing Tracer
import { trace } from "@opentelemetry/api";
const otelTracer = trace.getTracer("my-service");
const tracer = new OpenTelemetryTracer(otelTracer);
```

## Examples

- [Resonate Server Observability Example](https://github.com/resonatehq-examples/example-resonate-server-observability)

## Documentation

Full documentation: [docs.resonatehq.io](https://docs.resonatehq.io)
