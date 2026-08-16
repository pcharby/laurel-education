interface CurriculumTemplate {
  strands: string[];
  rubrics: string[];
}

// Starter suggestions offered once, when a subject (at a given grade/school
// combo) has no strands or rubrics yet - every subject otherwise has to be
// built from scratch, every year. Purely a starting point: applying a
// template just calls the normal addStrand/addRubric flow, so every item
// can be renamed or removed exactly like a manually-added one. Matched by
// exact subject name, case-insensitive - no fuzzy/alias matching, so a
// teacher only ever sees suggestions for a subject they actually typed.
const CURRICULUM_TEMPLATES: Record<string, CurriculumTemplate> = {
  mathematics: {
    strands: ['Number Sense', 'Algebra', 'Data', 'Spatial Sense'],
    rubrics: ['Problem Solving', 'Reasoning and Proving', 'Reflecting', 'Communicating'],
  },
  math: {
    strands: ['Number Sense', 'Algebra', 'Data', 'Spatial Sense'],
    rubrics: ['Problem Solving', 'Reasoning and Proving', 'Reflecting', 'Communicating'],
  },
  science: {
    strands: ['Life Systems', 'Structures and Mechanisms', 'Matter and Energy', 'Earth and Space Systems'],
    rubrics: ['Scientific Inquiry', 'Critical Thinking', 'Observation Skills'],
  },
  'language arts': {
    strands: ['Reading', 'Writing', 'Oral Communication', 'Media Literacy'],
    rubrics: ['Reading Comprehension', 'Written Expression', 'Oral Communication'],
  },
  english: {
    strands: ['Reading', 'Writing', 'Oral Communication', 'Media Literacy'],
    rubrics: ['Reading Comprehension', 'Written Expression', 'Oral Communication'],
  },
  french: {
    strands: ['Listening', 'Speaking', 'Reading', 'Writing'],
    rubrics: ['Oral Communication', 'Reading Comprehension', 'Written Expression'],
  },
  'social studies': {
    strands: ['Heritage and Identity', 'People and Environments'],
    rubrics: ['Application', 'Inquiry', 'Communication'],
  },
  history: {
    strands: ['Communities, Conflict and Cooperation', 'Heritage and Identity'],
    rubrics: ['Historical Thinking', 'Communication'],
  },
  geography: {
    strands: ['People and Environments', 'Natural Resources'],
    rubrics: ['Spatial Skills', 'Inquiry', 'Communication'],
  },
  'physical education': {
    strands: ['Active Living', 'Movement Competence', 'Healthy Living'],
    rubrics: ['Participation', 'Skill Development', 'Personal and Social Skills'],
  },
  'health and physical education': {
    strands: ['Active Living', 'Movement Competence', 'Healthy Living'],
    rubrics: ['Participation', 'Skill Development', 'Personal and Social Skills'],
  },
  music: {
    strands: ['Creating and Performing', 'Reflecting, Responding and Analysing'],
    rubrics: ['Musical Technique', 'Creativity', 'Participation'],
  },
  art: {
    strands: ['Creating and Presenting', 'Reflecting, Responding and Analysing'],
    rubrics: ['Creativity', 'Technique', 'Reflection'],
  },
  'the arts': {
    strands: ['Creating and Presenting', 'Reflecting, Responding and Analysing'],
    rubrics: ['Creativity', 'Technique', 'Reflection'],
  },
};

export function getCurriculumTemplate(subject: string): CurriculumTemplate | undefined {
  return CURRICULUM_TEMPLATES[subject.trim().toLowerCase()];
}
