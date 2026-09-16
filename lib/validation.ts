import { z } from 'zod';

// Session schemas
export const CreateSessionSchema = z.object({
  anonymous_id: z.string().min(1, 'anonymous_id is required').max(255),
  scan_type: z.enum(['quick', 'deep'], { errorMap: () => ({ message: 'scan_type must be "quick" or "deep"' }) }),
});

export const GetSessionSchema = z.object({
  session_id: z.string().uuid('Invalid session_id format'),
});

// Answer schemas
export const UpsertAnswersSchema = z.object({
  session_id: z.string().uuid('Invalid session_id format'),
  answers: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export const GetAnswersSchema = z.object({
  session_id: z.string().uuid('Invalid session_id format'),
});

// Lead schemas
export const CreateLeadSchema = z.object({
  session_id: z.string().uuid('Invalid session_id format'),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(1, 'Phone number is required').max(50),
  qualification_score: z.number().int().min(0).max(100).optional(),
  qualification_tier: z.enum(['education', 'future_icp', 'qualified', 'high_priority']).optional(),
});

// Report schemas
export const CreateReportSchema = z.object({
  session_id: z.string().uuid('Invalid session_id format'),
  result_json: z.record(z.unknown()),
});

export const GetReportSchema = z.object({
  session_id: z.string().uuid('Invalid session_id format'),
});
