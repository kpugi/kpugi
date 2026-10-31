export function generateHtmlReport(data) {
  const metrics = data.metrics || {};
  const httpDuration = metrics.http_req_duration ? metrics.http_req_duration.values : {};
  const httpFailed = metrics.http_req_failed ? metrics.http_req_failed.values : {};
  const reqTotal = metrics.http_reqs ? metrics.http_reqs.values.count : 0;
  const reqRate = metrics.http_reqs ? metrics.http_reqs.values.rate.toFixed(2) : 0;

  const errorRate = httpFailed.rate !== undefined ? (httpFailed.rate * 100).toFixed(2) : '0.00';
  const p95 = httpDuration['p(95)'] !== undefined ? httpDuration['p(95)'].toFixed(2) : '0.00';
  const p99 = httpDuration['p(99)'] !== undefined ? httpDuration['p(99)'].toFixed(2) : '0.00';
  const avg = httpDuration.avg !== undefined ? httpDuration.avg.toFixed(2) : '0.00';
  const med = httpDuration.med !== undefined ? httpDuration.med.toFixed(2) : '0.00';
  const max = httpDuration.max !== undefined ? httpDuration.max.toFixed(2) : '0.00';

  // Extract custom metrics / tags
  const metricRows = Object.keys(metrics)
    .filter((k) => k.startsWith('http_req_duration{'))
    .map((k) => {
      const tag = k.replace('http_req_duration{', '').replace('}', '');
      const vals = metrics[k].values;
      return `<tr>
        <td style="padding:10px;border-bottom:1px solid #334155;font-family:monospace;font-size:13px;color:#38bdf8;">${tag}</td>
        <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;">${vals.avg ? vals.avg.toFixed(2) : '-'}ms</td>
        <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;">${vals.med ? vals.med.toFixed(2) : '-'}ms</td>
        <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;font-weight:bold;color:#facc15;">${vals['p(95)'] ? vals['p(95)'].toFixed(2) : '-'}ms</td>
        <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;">${vals.max ? vals.max.toFixed(2) : '-'}ms</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Kpugi - k6 Production Load Test Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 32px; }
    .container { max-width: 1000px; margin: 0 auto; }
    .header { border-bottom: 2px solid #1e293b; padding-bottom: 20px; margin-bottom: 28px; }
    .badge { background: #0284c7; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .card-title { font-size: 13px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; font-weight: 600; }
    .card-val { font-size: 28px; font-weight: 800; color: #f8fafc; }
    .status-ok { color: #4ade80; }
    .status-warn { color: #facc15; }
    .status-bad { color: #f87171; }
    table { width: 100%; border-collapse: collapse; background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #334155; margin-bottom: 32px; }
    th { background: #0f172a; text-align: left; padding: 12px 10px; font-size: 12px; text-transform: uppercase; color: #94a3b8; border-bottom: 2px solid #334155; }
    th.right, td.right { text-align: right; }
    .footer { text-align: center; color: #64748b; font-size: 13px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Production Load Test Report</span>
      <h1 style="margin: 12px 0 6px 0; font-size: 28px;">Kpugi Platform (kpugi.com)</h1>
      <p style="margin: 0; color: #94a3b8; font-size: 14px;">Executed on: ${new Date().toUTCString()} | Engine: Grafana k6</p>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Total Requests</div>
        <div class="card-val">${reqTotal.toLocaleString()}</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">${reqRate} req/sec</div>
      </div>
      <div class="card">
        <div class="card-title">HTTP Error Rate</div>
        <div class="card-val ${parseFloat(errorRate) < 1.0 ? 'status-ok' : 'status-bad'}">${errorRate}%</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">Target: &lt; 1.00%</div>
      </div>
      <div class="card">
        <div class="card-title">p95 Latency</div>
        <div class="card-val ${parseFloat(p95) < 800 ? 'status-ok' : 'status-warn'}">${p95}ms</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">Target: &lt; 800ms</div>
      </div>
      <div class="card">
        <div class="card-title">p99 Latency</div>
        <div class="card-val">${p99}ms</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:4px;">Avg: ${avg}ms | Med: ${med}ms</div>
      </div>
    </div>

    <h2 style="font-size: 20px; margin-bottom: 14px;">Endpoint & Scenario Latency Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Metric / Tag</th>
          <th class="right">Avg</th>
          <th class="right">Med</th>
          <th class="right">p95</th>
          <th class="right">Max</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px;border-bottom:1px solid #334155;font-weight:bold;color:#38bdf8;">Overall (All Requests)</td>
          <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;">${avg}ms</td>
          <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;">${med}ms</td>
          <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;font-weight:bold;color:#4ade80;">${p95}ms</td>
          <td style="padding:10px;border-bottom:1px solid #334155;text-align:right;">${max}ms</td>
        </tr>
        ${metricRows}
      </tbody>
    </table>

    <div class="footer">
      Generated automatically by k6 runner for Kpugi platform load evaluation.
    </div>
  </div>
</body>
</html>`;
}

