import { describe, it, expect, beforeEach, vi } from 'vitest';
// Mock prisma
vi.mock('../lib/prisma', () => ({
    default: {
        settings: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
        },
        notifications: {
            create: vi.fn(),
        },
    },
}));
// Import after mocking
const { submitContact } = await import('../controllers/contactController');
describe('Contact Controller', () => {
    let mockReq;
    let mockRes;
    let mockJson;
    let mockStatus;
    beforeEach(() => {
        mockJson = vi.fn();
        mockStatus = vi.fn().mockReturnThis();
        mockRes = {
            json: mockJson,
            status: mockStatus,
        };
        vi.clearAllMocks();
    });
    describe('submitContact', () => {
        it('should return 400 for empty fields', async () => {
            mockReq = {
                body: {
                    name: '',
                    email: '',
                    phone: '',
                    subject: '',
                    message: ''
                }
            };
            await submitContact(mockReq, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                error: 'Validation failed'
            }));
        });
        it('should return 400 for invalid email', async () => {
            mockReq = {
                body: {
                    name: 'Test',
                    email: 'invalid-email',
                    phone: '01234567890',
                    subject: 'Test subject',
                    message: 'Test message content'
                }
            };
            await submitContact(mockReq, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(400);
        });
        it('should return 400 for invalid phone', async () => {
            mockReq = {
                body: {
                    name: 'Test',
                    email: 'test@example.com',
                    phone: '123',
                    subject: 'Test subject',
                    message: 'Test message content'
                }
            };
            await submitContact(mockReq, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(400);
        });
        it('should return 400 for short message', async () => {
            mockReq = {
                body: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '+20 123 456 7890',
                    subject: 'Test Subject',
                    message: 'short'
                }
            };
            await submitContact(mockReq, mockRes);
            expect(mockStatus).toHaveBeenCalledWith(400);
        });
    });
});
