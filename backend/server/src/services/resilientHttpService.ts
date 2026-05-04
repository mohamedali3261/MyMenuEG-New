import axios, { Method } from 'axios';
import { AppError } from '../utils/appError';

type CircuitState = {
  failures: number;
  openedAt: number | null;
};

type ResilientRequestOptions = {
  service: string;
  url: string;
  method?: Method;
  headers?: Record<string, string>;
  data?: unknown;
  timeoutMs?: number;
};

type ResilientResponse<T> = {
  status: number;
  data: T;
};

const DEFAULT_TIMEOUT_MS = Number(process.env.OUTBOUND_HTTP_TIMEOUT_MS || 8000);
const FAILURE_THRESHOLD = Number(process.env.OUTBOUND_CIRCUIT_FAILURES || 5);
const RESET_TIMEOUT_MS = Number(process.env.OUTBOUND_CIRCUIT_RESET_MS || 30000);

const circuits = new Map<string, CircuitState>();

const getCircuit = (service: string): CircuitState => {
  if (!circuits.has(service)) {
    circuits.set(service, { failures: 0, openedAt: null });
  }
  return circuits.get(service)!;
};

const isCircuitOpen = (service: string): boolean => {
  const state = getCircuit(service);
  if (state.openedAt === null) return false;
  if (Date.now() - state.openedAt >= RESET_TIMEOUT_MS) {
    state.openedAt = null;
    state.failures = 0;
    return false;
  }
  return true;
};

const registerFailure = (service: string) => {
  const state = getCircuit(service);
  state.failures += 1;
  if (state.failures >= FAILURE_THRESHOLD) {
    state.openedAt = Date.now();
  }
};

const registerSuccess = (service: string) => {
  const state = getCircuit(service);
  state.failures = 0;
  state.openedAt = null;
};

export const resilientRequest = async <T>(opts: ResilientRequestOptions): Promise<ResilientResponse<T>> => {
  const service = opts.service;
  if (isCircuitOpen(service)) {
    throw new AppError(503, 'CIRCUIT_OPEN', `Upstream circuit is open for ${service}`);
  }

  try {
    const response = await axios.request<T>({
      url: opts.url,
      method: opts.method || 'GET',
      headers: opts.headers,
      data: opts.data,
      timeout: opts.timeoutMs || DEFAULT_TIMEOUT_MS,
      validateStatus: () => true,
    });

    if (response.status >= 500) {
      registerFailure(service);
    } else {
      registerSuccess(service);
    }

    return { status: response.status, data: response.data };
  } catch (err: any) {
    registerFailure(service);
    if (err?.code === 'ECONNABORTED') {
      throw new AppError(504, 'UPSTREAM_TIMEOUT', `Timeout while calling ${service}`);
    }
    throw new AppError(503, 'UPSTREAM_UNAVAILABLE', `Failed to reach ${service}`, {
      message: err?.message || 'Unknown error',
    });
  }
};

export const resilientRequestOrThrow = async <T>(opts: ResilientRequestOptions): Promise<T> => {
  const response = await resilientRequest<T>(opts);
  if (response.status < 200 || response.status >= 300) {
    throw new AppError(502, 'UPSTREAM_BAD_RESPONSE', `Unexpected ${opts.service} response`, {
      status: response.status,
      data: response.data,
    });
  }
  return response.data;
};
