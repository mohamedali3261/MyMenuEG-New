/**
 * Custom Metrics Service
 * Tracks RED metrics (Request rate, Error rate, Duration) in-memory
 * Exposes them in Prometheus-compatible format.
 */

type MetricEntry = {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  timestamp: number;
};

class MetricsService {
  private entries: MetricEntry[] = [];
  private readonly MAX_ENTRIES = 10000; // Keep last 10k requests for aggregation

  record(method: string, path: string, status: number, durationMs: number) {
    // Normalize path to prevent high cardinality (strip IDs)
    const normalizedPath = this.normalizePath(path);
    
    this.entries.push({
      method,
      path: normalizedPath,
      status,
      durationMs,
      timestamp: Date.now()
    });

    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries.shift();
    }
  }

  private normalizePath(path: string): string {
    return path
      .split('?')[0] // Remove query params
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid') // UUIDs
      .replace(/\/adm-[0-9]+/g, '/:adminId') // Admin IDs
      .replace(/\/ord-[0-9]+/g, '/:orderId') // Order IDs
      .replace(/\/cat-[0-9]+/g, '/:categoryId') // Category IDs
      .replace(/\/prod-[0-9]+/g, '/:productId') // Product IDs
      .replace(/\/page-[0-9]+/g, '/:pageId') // Page IDs
      .replace(/\/slide-[0-9]+/g, '/:slideId') // Slide IDs
      .replace(/\/\d+/g, '/:id'); // Generic IDs
  }

  getPrometheusMetrics(): string {
    const counts: Record<string, number> = {};
    const durations: Record<string, number[]> = {};
    
    this.entries.forEach(e => {
      const key = `method="${e.method}",path="${e.path}",status="${e.status}"`;
      counts[key] = (counts[key] || 0) + 1;
      
      const durKey = `method="${e.method}",path="${e.path}"`;
      if (!durations[durKey]) durations[durKey] = [];
      durations[durKey].push(e.durationMs);
    });

    let output = '# HELP http_requests_total Total number of HTTP requests\n';
    output += '# TYPE http_requests_total counter\n';
    for (const [labels, count] of Object.entries(counts)) {
      output += `http_requests_total{${labels}} ${count}\n`;
    }

    output += '\n# HELP http_request_duration_ms_sum Sum of HTTP request durations\n';
    output += '# TYPE http_request_duration_ms_sum counter\n';
    for (const [labels, durs] of Object.entries(durations)) {
      const sum = durs.reduce((a, b) => a + b, 0);
      output += `http_request_duration_ms_sum{${labels}} ${sum}\n`;
    }

    output += '\n# HELP http_request_duration_ms_count Count of HTTP request durations\n';
    output += '# TYPE http_request_duration_ms_count counter\n';
    for (const [labels, durs] of Object.entries(durations)) {
      output += `http_request_duration_ms_count{${labels}} ${durs.length}\n`;
    }

    return output;
  }
}

export const metricsService = new MetricsService();
