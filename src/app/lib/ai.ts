import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';
import { Observation } from './types';

interface GeneratedEvaluation {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}

const callGenerateEvaluation = httpsCallable<
  { studentName: string; observations: Pick<Observation, 'content' | 'type' | 'subject' | 'timestamp' | 'tags'>[] },
  GeneratedEvaluation
>(functions, 'generateEvaluation');

export const generateEvaluation = async (
  observations: Observation[],
  studentName: string
): Promise<GeneratedEvaluation> => {
  const result = await callGenerateEvaluation({
    studentName,
    observations: observations.map(o => ({
      content: o.content,
      type: o.type,
      subject: o.subject,
      timestamp: o.timestamp,
      tags: o.tags,
    })),
  });
  return result.data;
};
