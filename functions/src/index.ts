import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

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
  { secrets: [anthropicApiKey] },
  async (request): Promise<GenerateEvaluationResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in required.');
    }

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

    const prompt = `You are helping a teacher write report card commentary for a student named ${studentName}, based only on the classroom observations recorded below.

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

    return response.parsed_output;
  }
);
