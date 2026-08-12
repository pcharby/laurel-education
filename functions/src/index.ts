import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { enforceRateLimit } from './rateLimit.js';
import { REGION } from './region.js';

export { auditStudents, auditObservations, auditEvaluations } from './auditLog.js';
export { cascadeDeleteStudentData } from './cascadeDelete.js';
export { purgeInactiveAccounts } from './purgeInactiveAccounts.js';

const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

interface ObservationInput {
  content: string;
  type: string;
  subject?: string;
  timestamp: string;
  tags: string[];
}

interface GenerateEvaluationRequest {
  studentName: string;
  observations: ObservationInput[];
}

const EvaluationSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
});

type GenerateEvaluationResponse = z.infer<typeof EvaluationSchema>;

export const generateEvaluation = onCall<GenerateEvaluationRequest>(
  { secrets: [anthropicApiKey], region: REGION },
  async (request): Promise<GenerateEvaluationResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }

    await enforceRateLimit(request.auth.uid, 'generateEvaluation');

    const { studentName, observations } = request.data;

    if (!studentName || typeof studentName !== 'string') {
      throw new HttpsError('invalid-argument', 'studentName is required.');
    }
    if (!Array.isArray(observations)) {
      throw new HttpsError('invalid-argument', 'observations must be an array.');
    }

    if (observations.length === 0) {
      return {
        summary: `No observations have been recorded for ${studentName} yet. Add a few observations to generate an evaluation.`,
        strengths: [],
        areasForImprovement: [],
      };
    }

    const client = new Anthropic({ apiKey: anthropicApiKey.value() });

    const observationsText = observations
      .map((obs, i) => {
        const parts = [`${i + 1}. [${obs.type}${obs.subject ? `, ${obs.subject}` : ''}] ${obs.content}`];
        if (obs.tags.length > 0) parts.push(`   Tags: ${obs.tags.join(', ')}`);
        return parts.join('\n');
      })
      .join('\n\n');

    // The student's real name is never sent to the model - only the
    // [STUDENT] placeholder is, and the real name is substituted back in
    // below. This keeps the identifying name from leaving Canadian
    // infrastructure for this call (the Anthropic API itself still
    // processes on US infra, so this reduces but doesn't eliminate the
    // data-residency exposure - free-text observation content a teacher
    // wrote is still sent as-is).
    const prompt = `You are helping a teacher write report card commentary for a student, based only on the classroom observations recorded below. Refer to the student only as "[STUDENT]" throughout your response - never use a real name. Use "[STUDENT]'s" for the possessive form.

Observations:
${observationsText}

Write a professional, encouraging report card evaluation grounded strictly in these observations. Do not invent specifics (grades, incidents, or achievements) that aren't evidenced above. If the observations are sparse, keep the evaluation appropriately brief rather than padding it with generic claims.`;

    const response = await client.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
      output_config: {
        format: zodOutputFormat(EvaluationSchema),
      },
    });

    if (response.stop_reason === 'refusal') {
      throw new HttpsError('failed-precondition', 'Evaluation generation was declined. Please try again.');
    }

    if (!response.parsed_output) {
      throw new HttpsError('internal', 'No response generated.');
    }

    return substitutePlaceholder(response.parsed_output, studentName);
  }
);

const substitutePlaceholder = (
  result: GenerateEvaluationResponse,
  studentName: string
): GenerateEvaluationResponse => ({
  summary: result.summary.split('[STUDENT]').join(studentName),
  strengths: result.strengths.map((s) => s.split('[STUDENT]').join(studentName)),
  areasForImprovement: result.areasForImprovement.map((a) => a.split('[STUDENT]').join(studentName)),
});
