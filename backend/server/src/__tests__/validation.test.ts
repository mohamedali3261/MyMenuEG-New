import { describe, it, expect } from 'vitest';
import { VALID_STATUSES, validateStatus, requireFields, validateId } from '../middleware/validation';
import { Request, Response } from 'express';

describe('VALID_STATUSES', () => {
  it('should contain expected status values', () => {
    expect(VALID_STATUSES).toContain('active');
    expect(VALID_STATUSES).toContain('draft');
    expect(VALID_STATUSES).toContain('pending');
    expect(VALID_STATUSES).toContain('processing');
    expect(VALID_STATUSES).toContain('shipped');
    expect(VALID_STATUSES).toContain('delivered');
    expect(VALID_STATUSES).toContain('cancelled');
  });
});

describe('requireFields', () => {
  it('should call next when all fields are present', () => {
    const req = { body: { name: 'test', email: 'test@test.com' } } as Request;
    const res = {} as Response;
    let called = false;
    const next = () => { called = true; };

    const middleware = requireFields('name', 'email');
    middleware(req, res, next);

    expect(called).toBe(true);
  });

  it('should return 400 when fields are missing', () => {
    const req = { body: { name: 'test' } } as Request;
    const json = (data: any) => data;
    const status = (code: number) => ({ json });
    const res = { status } as unknown as Response;
    let called = false;
    const next = () => { called = true; };

    const middleware = requireFields('name', 'email');
    const result = middleware(req, res, next);

    expect(called).toBe(false);
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('missing');
  });
});

describe('validateId', () => {
  it('should call next for valid ID', () => {
    const req = { params: { id: 'test-id-123' } } as unknown as Request;
    const res = {} as Response;
    let called = false;
    const next = () => { called = true; };

    validateId(req, res, next);

    expect(called).toBe(true);
  });

  it('should return 400 for invalid ID with special characters', () => {
    const req = { params: { id: 'test; DROP TABLE users;' } } as unknown as Request;
    const json = (data: any) => data;
    const status = (code: number) => ({ json });
    const res = { status } as unknown as Response;
    let called = false;
    const next = () => { called = true; };

    const result = validateId(req, res, next);

    expect(called).toBe(false);
    expect(result).toHaveProperty('error');
  });
});
