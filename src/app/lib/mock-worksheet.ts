export interface WorksheetQuestion {
  type: 'multiple-choice' | 'short-answer' | 'problem' | 'fill-blank' | 'matching';
  prompt: string;
  options?: string[];
  answer?: string;
  lines?: number;
}

export interface WorksheetSection {
  title: string;
  instructions: string;
  questions: WorksheetQuestion[];
}

export interface Worksheet {
  title: string;
  subject: string;
  grade: string;
  objective: string;
  learningGoal: string;
  estimatedTime: string;
  sections: WorksheetSection[];
  challenge: WorksheetQuestion;
  reflection: string;
}

type ObjectiveMap = Record<string, Record<string, Worksheet>>;

const worksheetContent: ObjectiveMap = {
  Mathematics: {
    'Problem Solving': {
      title: 'Multi-Step Problem Solving',
      subject: 'Mathematics',
      grade: '5',
      objective: 'Problem Solving',
      learningGoal: 'I can solve multi-step math problems by selecting and applying appropriate strategies, checking my work, and explaining my reasoning.',
      estimatedTime: '30–40 minutes',
      sections: [
        {
          title: 'Part A — Warm Up',
          instructions: 'Solve each problem. Show your thinking.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'A bookshelf has 6 shelves. Each shelf holds 24 books. How many books fit on the entire bookshelf?',
              lines: 3,
            },
            {
              type: 'short-answer',
              prompt: 'A bag of apples weighs 4.5 kg. A bag of oranges weighs 2.75 kg. How much do both bags weigh together?',
              lines: 3,
            },
          ],
        },
        {
          title: 'Part B — Practice',
          instructions: 'Read each problem carefully. Identify what you know, what you need to find, and show all steps.',
          questions: [
            {
              type: 'problem',
              prompt: 'Emma saved $18.50 per week for 8 weeks. She then spent $47.25 on a gift. How much money does she have left? Show each step.',
              lines: 5,
            },
            {
              type: 'problem',
              prompt: 'A school orders 15 boxes of pencils. Each box contains 144 pencils. If 9 classes share the pencils equally, how many pencils does each class receive?',
              lines: 5,
            },
            {
              type: 'multiple-choice',
              prompt: 'A train travels 360 km in 4 hours. At the same speed, how far will it travel in 7 hours?',
              options: ['A) 540 km', 'B) 630 km', 'C) 720 km', 'D) 810 km'],
              answer: 'B',
            },
            {
              type: 'multiple-choice',
              prompt: 'Which strategy would be MOST useful for solving: "How many minutes are in 3 days?"',
              options: ['A) Guess and check', 'B) Draw a diagram', 'C) Break into smaller steps', 'D) Work backwards'],
              answer: 'C',
            },
          ],
        },
        {
          title: 'Part C — Word Problems',
          instructions: 'Solve the following real-world problems. Explain how you know your answer makes sense.',
          questions: [
            {
              type: 'problem',
              prompt: 'A recipe needs 2¼ cups of flour for one batch of cookies. Ms. Chen wants to make 4 batches. She has 8 cups of flour. Does she have enough? How much extra or how much more does she need?',
              lines: 6,
            },
            {
              type: 'problem',
              prompt: 'The school library has 1,248 books. Each student is allowed to borrow up to 3 books. If 156 students each borrow 3 books, how many books remain in the library?',
              lines: 6,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: Create your own two-step word problem using multiplication and subtraction. Solve it and write the answer.',
        lines: 8,
      },
      reflection: 'Which problem-solving strategy did you find most helpful today? Circle one: Draw a picture · Break into steps · Work backwards · Make a table · Guess and check',
    },

    'Algebraic Thinking': {
      title: 'Patterns, Expressions & Algebraic Thinking',
      subject: 'Mathematics',
      grade: '5',
      objective: 'Algebraic Thinking',
      learningGoal: 'I can identify, extend, and describe patterns, write algebraic expressions, and solve simple equations using variables.',
      estimatedTime: '30–40 minutes',
      sections: [
        {
          title: 'Part A — Patterns',
          instructions: 'Identify and extend the patterns below.',
          questions: [
            {
              type: 'fill-blank',
              prompt: 'Complete the pattern: 3, 7, 11, 15, ____, ____, ____\nDescribe the rule: ________________________________',
              lines: 2,
            },
            {
              type: 'fill-blank',
              prompt: 'Complete the pattern: 256, 128, 64, ____, ____, ____\nDescribe the rule: ________________________________',
              lines: 2,
            },
          ],
        },
        {
          title: 'Part B — Expressions & Equations',
          instructions: 'Write expressions and solve for the unknown.',
          questions: [
            {
              type: 'multiple-choice',
              prompt: 'Which expression means "5 more than a number n"?',
              options: ['A) 5 − n', 'B) n + 5', 'C) 5 × n', 'D) n − 5'],
              answer: 'B',
            },
            {
              type: 'short-answer',
              prompt: 'Solve for n: n + 14 = 31\nn = _______\nHow did you find n? ________________________________',
              lines: 3,
            },
            {
              type: 'short-answer',
              prompt: 'Solve for n: 7 × n = 84\nn = _______',
              lines: 2,
            },
            {
              type: 'multiple-choice',
              prompt: 'A bag has b marbles. After adding 12 more, there are 30. Which equation represents this?',
              options: ['A) b − 12 = 30', 'B) b × 12 = 30', 'C) b + 12 = 30', 'D) 12 − b = 30'],
              answer: 'C',
            },
          ],
        },
        {
          title: 'Part C — Application',
          instructions: 'Use algebraic thinking to solve real-world problems.',
          questions: [
            {
              type: 'problem',
              prompt: 'Tickets to a school play cost $6 each. The drama club collected $162 in ticket sales. Write an equation using the variable t for number of tickets, then solve it.',
              lines: 5,
            },
            {
              type: 'problem',
              prompt: 'A plumber charges a flat fee plus $45 per hour. After 3 hours the total bill is $185. Write and solve an equation to find the flat fee (f).',
              lines: 5,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: Write a word problem that can be solved using the equation 4 × n + 8 = 36. Then solve it.',
        lines: 7,
      },
      reflection: 'How confident do you feel about using variables? Circle: Not yet · Getting there · I can do it · I can teach it',
    },

    'Number Sense': {
      title: 'Number Sense — Place Value, Rounding & Estimation',
      subject: 'Mathematics',
      grade: '5',
      objective: 'Number Sense',
      learningGoal: 'I can read, write, compare, and round whole numbers and decimals, and use estimation to judge the reasonableness of answers.',
      estimatedTime: '25–35 minutes',
      sections: [
        {
          title: 'Part A — Place Value',
          instructions: 'Answer the following place value questions.',
          questions: [
            {
              type: 'fill-blank',
              prompt: 'Write the value of the underlined digit in 3,4_7_,829:\nThe 7 is in the ______________ place. Its value is ______________.',
              lines: 2,
            },
            {
              type: 'multiple-choice',
              prompt: 'In the number 0.845, the digit 4 represents:',
              options: ['A) 4 ones', 'B) 4 tenths', 'C) 4 hundredths', 'D) 4 thousandths'],
              answer: 'C',
            },
          ],
        },
        {
          title: 'Part B — Rounding & Comparing',
          instructions: 'Round and compare numbers.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'Round 47,382 to the nearest thousand: ______________\nRound 3.764 to the nearest tenth: ______________',
              lines: 2,
            },
            {
              type: 'fill-blank',
              prompt: 'Use <, >, or = to compare:\n4.09 ___ 4.9\n0.250 ___ 0.25\n12,400 ___ 12,399 + 2',
              lines: 3,
            },
            {
              type: 'multiple-choice',
              prompt: 'Which number is closest to 8,000?',
              options: ['A) 7,489', 'B) 7,699', 'C) 8,312', 'D) 8,501'],
              answer: 'C',
            },
          ],
        },
        {
          title: 'Part C — Estimation',
          instructions: 'Use estimation to solve and check your work.',
          questions: [
            {
              type: 'problem',
              prompt: 'Estimate, then calculate: 4,187 + 2,956\nMy estimate: ______________\nExact answer: ______________\nIs my answer reasonable? Yes / No — because: ____________________________',
              lines: 4,
            },
            {
              type: 'problem',
              prompt: 'A store sells 348 items per day. Estimate how many items it sells in a 30-day month. Show your thinking.',
              lines: 4,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: Write the largest possible 6-digit number using the digits 3, 7, 1, 9, 0, 5 (each used once). Then write the smallest. Find the difference.',
        lines: 5,
      },
      reflection: 'Write one thing you understand well about number sense and one thing you would like more practice with.',
    },
  },

  Science: {
    'Scientific Inquiry': {
      title: 'Scientific Inquiry & the Inquiry Process',
      subject: 'Science',
      grade: '5',
      objective: 'Scientific Inquiry',
      learningGoal: 'I can ask scientific questions, form a hypothesis, design a fair test, record observations, and draw evidence-based conclusions.',
      estimatedTime: '30–40 minutes',
      sections: [
        {
          title: 'Part A — The Scientific Method',
          instructions: 'Put the steps of scientific inquiry in the correct order (1–6) and describe what each step involves.',
          questions: [
            {
              type: 'matching',
              prompt: 'Match each step to its description:\nA. Communicate results   B. Form a hypothesis   C. Ask a question\nD. Conduct the experiment   E. Analyze data   F. Design a procedure\n\n____ Predict the outcome based on prior knowledge\n____ Share findings with others\n____ Identify a problem or wonder\n____ Collect and record results\n____ Evaluate what the data means\n____ Plan materials and steps',
              lines: 3,
            },
          ],
        },
        {
          title: 'Part B — Reading an Experiment',
          instructions: 'Read the scenario below, then answer the questions.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'Scenario: A student wants to know if plants grow taller with more sunlight. They plant 3 identical seeds in the same soil. One plant gets 2 hours of sunlight, one gets 4 hours, and one gets 8 hours. Everything else stays the same.\n\n1. What is the question being tested? ____________________________\n2. What is the variable being changed (independent variable)? ____________________________\n3. What is being measured (dependent variable)? ____________________________\n4. What stays the same (controlled variables)? List two: ________________________',
              lines: 6,
            },
            {
              type: 'multiple-choice',
              prompt: 'Why is it important to keep all other variables the same?',
              options: [
                'A) To make the experiment go faster',
                'B) So we know that only one thing caused the results',
                'C) To use less materials',
                'D) So all plants grow at the same rate',
              ],
              answer: 'B',
            },
          ],
        },
        {
          title: 'Part C — Design Your Own',
          instructions: 'Plan a simple investigation.',
          questions: [
            {
              type: 'problem',
              prompt: 'You wonder: "Does the temperature of water affect how fast sugar dissolves?"\n\nWrite a hypothesis: If __________________ then __________________ because __________________\n\nList the materials you would need: ____________________________\n\nDescribe ONE change you would make to keep it a fair test: ____________________________',
              lines: 7,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: A classmate says "My hypothesis was wrong, so my experiment failed." Do you agree? Explain why a hypothesis can be wrong and the experiment still be a success.',
        lines: 6,
      },
      reflection: 'Which step of the scientific inquiry process do you find most challenging? Why?',
    },

    'Critical Thinking': {
      title: 'Critical Thinking in Science',
      subject: 'Science',
      grade: '5',
      objective: 'Critical Thinking',
      learningGoal: 'I can evaluate evidence, identify bias, ask deeper questions, and support my conclusions with reasoning.',
      estimatedTime: '30–35 minutes',
      sections: [
        {
          title: 'Part A — Fact, Opinion, or Inference?',
          instructions: 'Label each statement F (Fact), O (Opinion), or I (Inference).',
          questions: [
            {
              type: 'fill-blank',
              prompt: '____ Water boils at 100°C at sea level.\n____ Science is the most important subject in school.\n____ Since the sky is dark and cloudy, it will probably rain soon.\n____ Plants need sunlight to make food.\n____ This experiment would be more fun with a partner.',
              lines: 2,
            },
          ],
        },
        {
          title: 'Part B — Evaluating Evidence',
          instructions: 'Read the claim and evidence, then evaluate.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'Claim: "Eating carrots improves your eyesight."\nEvidence presented: "My grandmother eats carrots every day and she has great eyesight."\n\n1. Is this strong or weak evidence? ____________________\n2. Why? _______________________________________________\n3. What kind of evidence would be stronger? _______________________________________________',
              lines: 5,
            },
            {
              type: 'multiple-choice',
              prompt: 'A scientist tests a new fertilizer on 3 plants. All 3 grow taller. The BEST conclusion is:',
              options: [
                'A) The fertilizer always makes every plant grow taller',
                'B) The fertilizer may help plant growth, but more testing is needed',
                'C) All fertilizers are the same',
                'D) Plants don\'t need fertilizer',
              ],
              answer: 'B',
            },
          ],
        },
        {
          title: 'Part C — Questioning & Reasoning',
          instructions: 'Develop questions and support your reasoning.',
          questions: [
            {
              type: 'problem',
              prompt: 'Read this headline: "New study shows kids who eat breakfast get better grades."\n\nWrite TWO questions a critical thinker would ask before accepting this claim:\n1. _______________________________________________\n2. _______________________________________________\n\nWhat additional information would help you decide if this claim is valid?',
              lines: 6,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: "Scientists say screen time is harmful for children." Identify two types of bias that could affect this research and explain how each could change the results.',
        lines: 7,
      },
      reflection: 'Describe a time when you changed your mind about something because of new evidence. What made you change your thinking?',
    },
  },

  'Language Arts': {
    'Reading Comprehension': {
      title: 'Reading Comprehension Strategies',
      subject: 'Language Arts',
      grade: '5',
      objective: 'Reading Comprehension',
      learningGoal: 'I can use comprehension strategies (visualizing, inferring, connecting, questioning) to understand texts at a deeper level.',
      estimatedTime: '35–45 minutes',
      sections: [
        {
          title: 'Part A — Read & Respond',
          instructions: 'Read the passage below, then answer the questions.',
          questions: [
            {
              type: 'short-answer',
              prompt: `Passage:\n"Maya stared at the empty stage. The auditorium hummed with quiet chatter. She had rehearsed her lines a thousand times in her bedroom mirror, but now her hands trembled and her mouth felt dry. When her name was called, she took one deep breath, thought of her grandmother\'s voice saying 'courage is not the absence of fear,' and stepped into the light."\n\n1. What problem is Maya facing? ________________________________\n2. What does the phrase "stepped into the light" suggest about Maya\'s action? ________________________________\n3. What inference can you make about Maya\'s relationship with her grandmother? ________________________________`,
              lines: 6,
            },
            {
              type: 'multiple-choice',
              prompt: 'The main theme of this passage is best described as:',
              options: [
                'A) Acting is a dangerous hobby',
                'B) Courage means doing something even when you\'re afraid',
                'C) Grandmothers always give the best advice',
                'D) Rehearsing guarantees success',
              ],
              answer: 'B',
            },
          ],
        },
        {
          title: 'Part B — Comprehension Strategies',
          instructions: 'Practise using specific reading strategies.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'MAKING CONNECTIONS — Write a text-to-self connection to the passage above:\n"This reminds me of a time when I ________________________________ because ________________________________"',
              lines: 3,
            },
            {
              type: 'short-answer',
              prompt: 'VISUALIZING — Describe the mental image you created while reading the passage. Include at least 3 specific details.',
              lines: 4,
            },
            {
              type: 'short-answer',
              prompt: 'QUESTIONING — Write one question you had BEFORE reading and one question you still have AFTER reading.',
              lines: 4,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: Rewrite the last sentence of the passage from Maya\'s grandmother\'s point of view. What might she be thinking or feeling as she watches Maya walk on stage?',
        lines: 7,
      },
      reflection: 'Which reading strategy (visualizing, inferring, connecting, questioning) helps you most when you read a difficult text? Why?',
    },

    'Written Expression': {
      title: 'Written Expression — Structure, Voice & Craft',
      subject: 'Language Arts',
      grade: '5',
      objective: 'Written Expression',
      learningGoal: 'I can write with a clear structure (introduction, body, conclusion), use precise vocabulary, vary my sentence structure, and express my ideas with a strong voice.',
      estimatedTime: '40–50 minutes',
      sections: [
        {
          title: 'Part A — Sentence Craft',
          instructions: 'Improve the sentences below.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'Combine these two sentences into one using a conjunction (and, but, so, because, although):\n"The dog barked loudly. The neighbours didn\'t wake up."\nCombined: ________________________________',
              lines: 2,
            },
            {
              type: 'short-answer',
              prompt: 'Rewrite this dull sentence using more precise and vivid language:\n"The dog was big and loud."\nRevised: ________________________________',
              lines: 2,
            },
            {
              type: 'multiple-choice',
              prompt: 'Which sentence has the strongest voice?',
              options: [
                'A) The sunset was nice.',
                'B) The sky turned colours.',
                'C) Streaks of amber and violet blazed across the horizon as the sun melted below the lake.',
                'D) It was getting dark outside.',
              ],
              answer: 'C',
            },
          ],
        },
        {
          title: 'Part B — Paragraph Writing',
          instructions: 'Write a well-structured paragraph using the TEEL method (Topic sentence, Evidence, Explanation, Link).',
          questions: [
            {
              type: 'problem',
              prompt: 'Topic: "Having recess is important for learning."\nWrite a TEEL paragraph. Label each sentence with T, E, E, or L in the margin.',
              lines: 8,
            },
          ],
        },
        {
          title: 'Part C — Editing',
          instructions: 'Find and correct the errors in the paragraph below.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'Correct all errors (spelling, punctuation, grammar) in the following paragraph and rewrite it:\n\n"last saterday me and my frend went to the park we played soccer for to hours. it was so funny but then it started too rain so we runned home. my mom made us hot chocolate witch was delicous."',
              lines: 6,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: Write a 6-sentence mini-story that begins with: "Nobody believed her when she said she had found it." Use at least two different types of sentences (simple, compound, complex).',
        lines: 9,
      },
      reflection: 'What is one writing skill you are proud of and one skill you want to improve?',
    },

    'Oral Communication': {
      title: 'Oral Communication — Speaking & Active Listening',
      subject: 'Language Arts',
      grade: '5',
      objective: 'Oral Communication',
      learningGoal: 'I can communicate ideas clearly when speaking, use appropriate volume and body language, and listen actively to understand and respond to others.',
      estimatedTime: '25–30 minutes',
      sections: [
        {
          title: 'Part A — Listening Skills',
          instructions: 'Answer the following questions about active listening.',
          questions: [
            {
              type: 'multiple-choice',
              prompt: 'Which is the BEST example of active listening?',
              options: [
                'A) Looking at your phone while someone talks',
                'B) Nodding, making eye contact, and asking a follow-up question',
                'C) Waiting for your turn to talk while planning what you will say',
                'D) Repeating everything the speaker says',
              ],
              answer: 'B',
            },
            {
              type: 'fill-blank',
              prompt: 'Fill in the blanks using the word bank: [eye contact · tone of voice · body language · paraphrase · clarify]\n\nWhen listening, you can __________________ what someone said to show you understood. If you don\'t understand, ask questions to __________________. Speakers use __________________ to show emotion or emphasis.',
              lines: 2,
            },
          ],
        },
        {
          title: 'Part B — Speaking Strategies',
          instructions: 'Plan and evaluate effective oral communication.',
          questions: [
            {
              type: 'short-answer',
              prompt: 'You are asked to present your science project to the class. List THREE strategies you would use to communicate your ideas clearly and confidently.\n1. ________________________________\n2. ________________________________\n3. ________________________________',
              lines: 4,
            },
            {
              type: 'problem',
              prompt: 'Your partner just finished their presentation. Write TWO specific pieces of feedback using the "glow and grow" format:\n🌟 Glow (something they did well): ________________________________\n🌱 Grow (one thing to improve): ________________________________',
              lines: 4,
            },
          ],
        },
        {
          title: 'Part C — Discussion Preparation',
          instructions: 'Prepare to participate in a class discussion.',
          questions: [
            {
              type: 'problem',
              prompt: 'Discussion topic: "Should students have more say in what they learn at school?"\n\nWrite your position statement (what you think): ________________________________\nWrite ONE piece of evidence or reason to support it: ________________________________\nWrite ONE question you could ask another student to extend the discussion: ________________________________',
              lines: 6,
            },
          ],
        },
      ],
      challenge: {
        type: 'problem',
        prompt: '🌟 Challenge: A classmate says something in a group discussion that you disagree with. Write out exactly what you would say to respectfully disagree and share your own view. Use sentence starters like "I see it differently because..." or "I understand your point, however..."',
        lines: 7,
      },
      reflection: 'Rate yourself (1–4) on: Speaking clearly ____ Listening actively ____ Asking good questions ____\nWhat is one goal you can set for your next group discussion?',
    },
  },
};

export interface GeneratedWorksheet extends Worksheet {
  generatedAt: string;
  atRiskCount: number;
}

export async function generateWorksheet(
  subject: string,
  objective: string,
  grade: string,
  atRiskCount: number
): Promise<GeneratedWorksheet> {
  await new Promise(resolve => setTimeout(resolve, 2200));

  const subjectMap = worksheetContent[subject] || worksheetContent['Mathematics'];
  const worksheet = subjectMap?.[objective] || Object.values(subjectMap)[0];

  return {
    ...worksheet,
    grade,
    generatedAt: new Date().toISOString(),
    atRiskCount,
  };
}
