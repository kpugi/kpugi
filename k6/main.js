import publicVisitorScenario from './scenarios/public.js';
import creatorScenario from './scenarios/creator.js';
import apiScenario from './scenarios/api.js';
import { THRESHOLDS } from './config.js';
import { generateHtmlReport } from './utils/reporter.js';

const isSmoke = __ENV.TEST_MODE === 'smoke';

const publicStages = isSmoke
  ? [
      { duration: '10s', target: 4 },
      { duration: '15s', target: 7 },
      { duration: '5s', target: 0 },
    ]
  : [
      { duration: '1m', target: 7 },   // Warmup
      { duration: '3m', target: 70 },  // Ramp to 70 VUs
      { duration: '3m', target: 70 },  // Peak soak
      { duration: '1m', target: 0 },   // Cooldown
    ];

const creatorStages = isSmoke
  ? [
      { duration: '10s', target: 1 },
      { duration: '15s', target: 2 },
      { duration: '5s', target: 0 },
    ]
  : [
      { duration: '1m', target: 2 },   // Warmup
      { duration: '3m', target: 20 },  // Ramp to 20 VUs
      { duration: '3m', target: 20 },  // Peak soak
      { duration: '1m', target: 0 },   // Cooldown
    ];

const apiStages = isSmoke
  ? [
      { duration: '10s', target: 1 },
      { duration: '15s', target: 2 },
      { duration: '5s', target: 0 },
    ]
  : [
      { duration: '1m', target: 1 },   // Warmup
      { duration: '3m', target: 10 },  // Ramp to 10 VUs
      { duration: '3m', target: 10 },  // Peak soak
      { duration: '1m', target: 0 },   // Cooldown
    ];

export const options = {
  scenarios: {
    public_visitors: {
      executor: 'ramping-vus',
      exec: 'runPublic',
      startTime: '0s',
      stages: publicStages,
    },
    creator_journey: {
      executor: 'ramping-vus',
      exec: 'runCreator',
      startTime: '0s',
      stages: creatorStages,
    },
    api_probes: {
      executor: 'ramping-vus',
      exec: 'runApi',
      startTime: '0s',
      stages: apiStages,
    },
  },
  thresholds: THRESHOLDS,
};

export function runPublic() {
  publicVisitorScenario();
}

export function runCreator() {
  creatorScenario();
}

export function runApi() {
  apiScenario();
}

// Default entry point when running ad-hoc or CLI-overridden tests (e.g. --vus 5 --duration 15s)
export default function () {
  runPublic();
  runCreator();
  runApi();
}


export function handleSummary(data) {
  const reqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
  const fail = data.metrics.http_req_failed ? (data.metrics.http_req_failed.values.rate * 100).toFixed(2) : 0;
  const p95 = data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(2) : 0;
  const summaryText = `\n=========================================\n Kpugi Load Test Summary\n Total Requests: ${reqs}\n Failed Rate:   ${fail}%\n p95 Latency:   ${p95}ms\n HTML Report:   k6/reports/k6-load-test-report.html\n=========================================\n`;

  return {
    'k6/reports/k6-load-test-report.html': generateHtmlReport(data),
    stdout: summaryText,
  };
}

