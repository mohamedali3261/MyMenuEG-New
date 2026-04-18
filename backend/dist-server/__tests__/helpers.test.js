import { describe, it, expect } from 'vitest';
import { getQueryParam, getQueryInt, generateId, slugify, calculatePagination } from '../utils/helpers';
describe('getQueryParam', () => {
    it('should return undefined for undefined input', () => {
        expect(getQueryParam(undefined)).toBeUndefined();
    });
    it('should return undefined for null input', () => {
        expect(getQueryParam(null)).toBeUndefined();
    });
    it('should return string for string input', () => {
        expect(getQueryParam('test')).toBe('test');
    });
    it('should return first element for array input', () => {
        expect(getQueryParam(['first', 'second'])).toBe('first');
    });
    it('should return undefined for empty array', () => {
        expect(getQueryParam([])).toBeUndefined();
    });
    it('should return undefined for object input', () => {
        expect(getQueryParam({ key: 'value' })).toBeUndefined();
    });
});
describe('getQueryInt', () => {
    it('should return default value for undefined input', () => {
        expect(getQueryInt(undefined, 10)).toBe(10);
    });
    it('should parse valid string to integer', () => {
        expect(getQueryInt('42', 0)).toBe(42);
    });
    it('should return default for invalid string', () => {
        expect(getQueryInt('abc', 5)).toBe(5);
    });
    it('should apply min constraint', () => {
        expect(getQueryInt('5', 0, 10)).toBe(10);
    });
    it('should apply max constraint', () => {
        expect(getQueryInt('100', 0, 1, 50)).toBe(50);
    });
    it('should handle negative numbers', () => {
        expect(getQueryInt('-5', 0)).toBe(-5);
    });
});
describe('generateId', () => {
    it('should generate ID with prefix', () => {
        const id = generateId('test');
        expect(id.startsWith('test-')).toBe(true);
    });
    it('should generate unique IDs', () => {
        const id1 = generateId('test');
        const id2 = generateId('test');
        expect(id1).not.toBe(id2);
    });
});
describe('slugify', () => {
    it('should convert to lowercase', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });
    it('should replace spaces with dashes', () => {
        expect(slugify('hello world')).toBe('hello-world');
    });
    it('should remove special characters', () => {
        expect(slugify('hello!@#$%world')).toBe('hello-world');
    });
    it('should trim whitespace', () => {
        expect(slugify('  hello world  ')).toBe('hello-world');
    });
    it('should handle multiple dashes', () => {
        expect(slugify('hello---world')).toBe('hello-world');
    });
});
describe('calculatePagination', () => {
    it('should calculate correct pagination metadata', () => {
        const result = calculatePagination(100, 2, 20);
        expect(result.total).toBe(100);
        expect(result.pages).toBe(5);
        expect(result.currentPage).toBe(2);
        expect(result.hasNext).toBe(true);
        expect(result.hasPrev).toBe(true);
    });
    it('should handle first page', () => {
        const result = calculatePagination(100, 1, 20);
        expect(result.hasPrev).toBe(false);
        expect(result.hasNext).toBe(true);
    });
    it('should handle last page', () => {
        const result = calculatePagination(100, 5, 20);
        expect(result.hasNext).toBe(false);
        expect(result.hasPrev).toBe(true);
    });
    it('should handle empty results', () => {
        const result = calculatePagination(0, 1, 20);
        expect(result.pages).toBe(0);
        expect(result.hasNext).toBe(false);
        expect(result.hasPrev).toBe(false);
    });
});
