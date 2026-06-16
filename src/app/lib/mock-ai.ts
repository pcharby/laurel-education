import { Observation } from './types';

export const generateMockEvaluation = async (
  observations: Observation[],
  studentName: string
): Promise<{
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const subjects = [...new Set(observations.map(o => o.subject).filter(Boolean))];
  const tags = [...new Set(observations.flatMap(o => o.tags))];

  const summary = `${studentName} has demonstrated consistent engagement across ${observations.length} recorded observations${subjects.length > 0 ? ` in ${subjects.join(', ')}` : ''}. Their learning journey shows growth in multiple areas, with particular development noted in ${tags.slice(0, 2).join(' and ') || 'key competencies'}. ${studentName} actively participates in class activities and shows curiosity in exploring new concepts.`;

  const strengths = [
    'Demonstrates strong communication skills during class discussions',
    'Shows creativity and critical thinking in problem-solving tasks',
    'Collaborates effectively with peers in group activities'
  ];

  const areasForImprovement = [
    'Could benefit from additional practice in time management during independent work',
    'Encourage more frequent self-reflection on learning processes',
    'Continue building confidence when presenting work to larger groups'
  ];

  return { summary, strengths, areasForImprovement };
};
