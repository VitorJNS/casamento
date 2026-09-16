type RequestMetricContext = {
  route: string;
  method: string;
  requestId: string | null;
  start: number;
};

export function startRequestMetric(route: string, method: string, request?: Request) {
  const context: RequestMetricContext = {
    route,
    method,
    requestId: request?.headers.get("x-vercel-id") ?? null,
    start: Date.now(),
  };

  console.log(
    JSON.stringify({
      level: "info",
      msg: "request_start",
      route: context.route,
      method: context.method,
      requestId: context.requestId,
    }),
  );

  return context;
}

export function finishRequestMetric(context: RequestMetricContext, status: number) {
  console.log(
    JSON.stringify({
      level: "info",
      msg: "request_done",
      route: context.route,
      method: context.method,
      status,
      ms: Date.now() - context.start,
      requestId: context.requestId,
    }),
  );
}

export function failRequestMetric(context: RequestMetricContext, error: unknown, status = 500) {
  console.error(
    JSON.stringify({
      level: "error",
      msg: "request_failed",
      route: context.route,
      method: context.method,
      status,
      ms: Date.now() - context.start,
      requestId: context.requestId,
      error: error instanceof Error ? error.message : String(error),
    }),
  );
}
