import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Supabase Client Setup ---
const SUPABASE_URL = 'https://uzfitbbzaygvbtymhhy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_K1A4mbX26rz2Vlhhb2v3YA_gburu2rO';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Telegram WebApp Type Definitions ---
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
        openTelegramLink?: (url: string) => void;
        ready?: () => void;
      };
    };
  }
}

interface Question {
  id: number;
  section: 'Quantitative' | 'Verbal & Analytical';
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// --- Complete 100-Question Dataset ---
const mockQuestions: Question[] = [
  // --- QUANTITATIVE REASONING (45 QUESTIONS) ---
  {
    id: 1,
    section: 'Quantitative',
    question: 'A car travels 240 km at 60 km/h and returns at 40 km/h. What is the average speed for the entire trip?',
    options: ['48 km/h', '50 km/h', '52 km/h', '54 km/h'],
    correct: 0,
    explanation: 'Time 1 = 240/60 = 4h. Time 2 = 240/40 = 6h. Total distance = 480 km, total time = 10h. Average speed = 480 / 10 = 48 km/h.'
  },
  {
    id: 2,
    section: 'Quantitative',
    question: 'If 3x + 2y = 18 and x - y = 1, what is the value of x + y?',
    options: ['4', '5', '7', '8'],
    correct: 2,
    explanation: 'From x - y = 1, x = y + 1. Substituting into 3x + 2y = 18 gives 3(y + 1) + 2y = 18 => 5y = 15 => y = 3 and x = 4. Therefore, x + y = 4 + 3 = 7.'
  },
  {
    id: 3,
    section: 'Quantitative',
    question: 'A store offers a 20% discount on an item originally priced at $150. If a sales tax of 10% is applied to the discounted price, what is the final cost?',
    options: ['$120', '$132', '$135', '$138'],
    correct: 1,
    explanation: 'Discounted price = $150 × 0.80 = $120. Final cost with 10% tax = $120 × 1.10 = $132.'
  },
  {
    id: 4,
    section: 'Quantitative',
    question: 'What is the next number in the sequence: 3, 7, 15, 31, 63, ...?',
    options: ['95', '115', '127', '128'],
    correct: 2,
    explanation: 'Pattern: (x × 2) + 1. Next number = (63 × 2) + 1 = 127.'
  },
  {
    id: 5,
    section: 'Quantitative',
    question: 'The ratio of two numbers is 3:5. If their sum is 160, what is the larger number?',
    options: ['60', '80', '100', '120'],
    correct: 2,
    explanation: '3x + 5x = 160 => 8x = 160 => x = 20. Larger number = 5 × 20 = 100.'
  },
  {
    id: 6,
    section: 'Quantitative',
    question: 'If a worker can complete a task in 12 hours and an assistant can complete it in 24 hours, how long will it take them working together?',
    options: ['6 hours', '8 hours', '10 hours', '18 hours'],
    correct: 1,
    explanation: 'Combined rate = 1/12 + 1/24 = 3/24 = 1/8. Time taken = 8 hours.'
  },
  {
    id: 7,
    section: 'Quantitative',
    question: 'A bag contains 5 red, 3 blue, and 2 green balls. What is the probability of picking a blue ball?',
    options: ['1/5', '3/10', '1/2', '3/7'],
    correct: 1,
    explanation: 'Total balls = 5 + 3 + 2 = 10. Probability = 3/10.'
  },
  {
    id: 8,
    section: 'Quantitative',
    question: 'Solve for y: log₂(y) + log₂(4) = 5.',
    options: ['4', '6', '8', '16'],
    correct: 2,
    explanation: 'log₂(4y) = 5 => 4y = 2⁵ = 32 => y = 8.'
  },
  {
    id: 9,
    section: 'Quantitative',
    question: 'A right triangle has a base of 6 cm and a hypotenuse of 10 cm. What is its area?',
    options: ['24 cm²', '30 cm²', '48 cm²', '60 cm²'],
    correct: 0,
    explanation: 'Height = √(10² - 6²) = 8 cm. Area = (1/2) × 6 × 8 = 24 cm².'
  },
  {
    id: 10,
    section: 'Quantitative',
    question: 'A sum of $1,000 is invested at an annual simple interest rate of 6% for 4 years. What is the total interest earned?',
    options: ['$140', '$240', '$300', '$1,240'],
    correct: 1,
    explanation: 'Interest = P × r × t = 1000 × 0.06 × 4 = $240.'
  },
  {
    id: 11,
    section: 'Quantitative',
    question: 'If f(x) = 2x² - 3x + 1, what is f(-2)?',
    options: ['3', '7', '15', '19'],
    correct: 2,
    explanation: 'f(-2) = 2(-2)² - 3(-2) + 1 = 2(4) + 6 + 1 = 8 + 6 + 1 = 15.'
  },
  {
    id: 12,
    section: 'Quantitative',
    question: 'The mean of five numbers is 18. If one number is removed, the mean of the remaining four numbers becomes 16. What number was removed?',
    options: ['20', '24', '26', '28'],
    correct: 2,
    explanation: 'Sum of 5 numbers = 5 × 18 = 90. Sum of 4 numbers = 4 × 16 = 64. Removed number = 90 - 64 = 26.'
  },
  {
    id: 13,
    section: 'Quantitative',
    question: 'What is the simplified form of (x² - 9) / (x - 3) for x ≠ 3?',
    options: ['x - 3', 'x + 3', 'x² + 3', '3'],
    correct: 1,
    explanation: '(x - 3)(x + 3) / (x - 3) = x + 3.'
  },
  {
    id: 14,
    section: 'Quantitative',
    question: 'If 2^(x+1) = 32, what is the value of x?',
    options: ['3', '4', '5', '6'],
    correct: 1,
    explanation: '32 = 2⁵ => x + 1 = 5 => x = 4.'
  },
  {
    id: 15,
    section: 'Quantitative',
    question: 'A train length of 150 meters passes a telephone pole in 9 seconds. What is the speed of the train in m/s?',
    options: ['12.5 m/s', '15 m/s', '16.67 m/s', '20 m/s'],
    correct: 2,
    explanation: 'Speed = Distance / Time = 150 / 9 = 16.67 m/s.'
  },
  {
    id: 16,
    section: 'Quantitative',
    question: 'What is the perimeter of a rectangle with an area of 36 m² and a length of 9 m?',
    options: ['13 m', '26 m', '36 m', '40 m'],
    correct: 1,
    explanation: 'Width = 36 / 9 = 4 m. Perimeter = 2(9 + 4) = 26 m.'
  },
  {
    id: 17,
    section: 'Quantitative',
    question: 'If a = 3 and b = -2, evaluate a² - 2ab + b².',
    options: ['1', '13', '25', '31'],
    correct: 2,
    explanation: 'a² - 2ab + b² = (a - b)² = (3 - (-2))² = 5² = 25.'
  },
  {
    id: 18,
    section: 'Quantitative',
    question: 'A container is 4/5 full. When 20 liters are removed, it becomes 1/2 full. What is the total capacity?',
    options: ['50 liters', '60 liters', '66.6 liters', '70 liters'],
    correct: 2,
    explanation: '4/5 - 1/2 = 3/10. 3/10 C = 20 => C = 200/3 ≈ 66.6 liters.'
  },
  {
    id: 19,
    section: 'Quantitative',
    question: 'Identify the missing term: 2, 6, 12, 20, 30, ...',
    options: ['38', '40', '42', '46'],
    correct: 2,
    explanation: 'Differences increase by +2: +4, +6, +8, +10, +12. Next term = 30 + 12 = 42.'
  },
  {
    id: 20,
    section: 'Quantitative',
    question: 'A person buys an item for $80 and sells it for $100. What is the profit percentage?',
    options: ['15%', '20%', '25%', '30%'],
    correct: 2,
    explanation: 'Profit = $20. Profit % = (20 / 80) × 100 = 25%.'
  },
  {
    id: 21,
    section: 'Quantitative',
    question: 'What is the midpoint of the line segment connecting points (2, 4) and (6, 10)?',
    options: ['(4, 7)', '(3, 5)', '(4, 6)', '(8, 14)'],
    correct: 0,
    explanation: 'Midpoint = ((2+6)/2, (4+10)/2) = (4, 7).'
  },
  {
    id: 22,
    section: 'Quantitative',
    question: 'If 5x - 7 = 3x + 9, then x = ?',
    options: ['4', '6', '8', '16'],
    correct: 2,
    explanation: '2x = 16 => x = 8.'
  },
  {
    id: 23,
    section: 'Quantitative',
    question: 'How many combinations of 2 items can be selected from a set of 5 unique items?',
    options: ['5', '10', '15', '20'],
    correct: 1,
    explanation: '5C2 = (5 × 4) / 2 = 10.'
  },
  {
    id: 24,
    section: 'Quantitative',
    question: 'A wheel has a radius of 7 cm. How far does it roll in one complete rotation? (π ≈ 22/7)',
    options: ['22 cm', '44 cm', '88 cm', '154 cm'],
    correct: 1,
    explanation: 'Circumference = 2 × π × r = 2 × (22/7) × 7 = 44 cm.'
  },
  {
    id: 25,
    section: 'Quantitative',
    question: 'If the perimeter of a square is 48 cm, what is its area?',
    options: ['96 cm²', '120 cm²', '144 cm²', '196 cm²'],
    correct: 2,
    explanation: 'Side length = 48 / 4 = 12 cm. Area = 12² = 144 cm².'
  },
  {
    id: 26,
    section: 'Quantitative',
    question: 'Solve the inequality: 2x + 5 > 13.',
    options: ['x > 4', 'x < 4', 'x > 9', 'x < 9'],
    correct: 0,
    explanation: '2x > 8 => x > 4.'
  },
  {
    id: 27,
    section: 'Quantitative',
    question: 'Find the value of √144 + √81.',
    options: ['19', '21', '23', '25'],
    correct: 1,
    explanation: '12 + 9 = 21.'
  },
  {
    id: 28,
    section: 'Quantitative',
    question: 'The sum of three consecutive integers is 72. What is the smallest integer?',
    options: ['22', '23', '24', '25'],
    correct: 1,
    explanation: 'x + (x+1) + (x+2) = 72 => 3x + 3 = 72 => 3x = 69 => x = 23.'
  },
  {
    id: 29,
    section: 'Quantitative',
    question: 'If x/4 = 9/x, what is the positive value of x?',
    options: ['4', '5', '6', '9'],
    correct: 2,
    explanation: 'x² = 36 => x = 6.'
  },
  {
    id: 30,
    section: 'Quantitative',
    question: 'A product price increases by 10% and then decreases by 10%. What is the net change?',
    options: ['No change', '1% decrease', '1% increase', '2% decrease'],
    correct: 1,
    explanation: '1.10 × 0.90 = 0.99 => 1% net decrease.'
  },
  {
    id: 31,
    section: 'Quantitative',
    question: 'If tan(θ) = 1, what is the angle θ in degrees (for 0° ≤ θ ≤ 90°)?',
    options: ['30°', '45°', '60°', '90°'],
    correct: 1,
    explanation: 'tan(45°) = 1.'
  },
  {
    id: 32,
    section: 'Quantitative',
    question: 'Complete the sequence: 1, 4, 9, 16, 25, ...',
    options: ['30', '35', '36', '49'],
    correct: 2,
    explanation: 'Square numbers sequence: 1², 2², 3², 4², 5², 6² = 36.'
  },
  {
    id: 33,
    section: 'Quantitative',
    question: 'A tank can be filled by Pipe A in 4 hours and emptied by Pipe B in 6 hours. How long to fill if both are open?',
    options: ['10 hours', '12 hours', '14 hours', '16 hours'],
    correct: 1,
    explanation: 'Net rate = 1/4 - 1/6 = 1/12. Time = 12 hours.'
  },
  {
    id: 34,
    section: 'Quantitative',
    question: 'What is the surface area of a cube with edge length 3 cm?',
    options: ['27 cm²', '36 cm²', '54 cm²', '72 cm²'],
    correct: 2,
    explanation: 'Surface area = 6 × s² = 6 × 9 = 54 cm².'
  },
  {
    id: 35,
    section: 'Quantitative',
    question: 'Evaluate 3! + 4!.',
    options: ['14', '24', '30', '48'],
    correct: 2,
    explanation: '3! = 6, 4! = 24. 6 + 24 = 30.'
  },
  {
    id: 36,
    section: 'Quantitative',
    question: 'If a:b = 2:3 and b:c = 4:5, what is a:c?',
    options: ['2:5', '8:15', '6:15', '8:10'],
    correct: 1,
    explanation: 'a/c = (a/b) × (b/c) = (2/3) × (4/5) = 8/15.'
  },
  {
    id: 37,
    section: 'Quantitative',
    question: 'Find the roots of x² - 5x + 6 = 0.',
    options: ['x = 2, 3', 'x = -2, -3', 'x = 1, 6', 'x = -1, -6'],
    correct: 0,
    explanation: '(x - 2)(x - 3) = 0 => x = 2, 3.'
  },
  {
    id: 38,
    section: 'Quantitative',
    question: 'A test has 50 questions. A student answers 80% correctly. How many questions were incorrect?',
    options: ['8', '10', '12', '15'],
    correct: 1,
    explanation: 'Incorrect % = 20%. 20% of 50 = 10.'
  },
  {
    id: 39,
    section: 'Quantitative',
    question: 'The slope of the line passing through points (1, 2) and (3, 10) is:',
    options: ['2', '3', '4', '5'],
    correct: 2,
    explanation: 'Slope m = (10 - 2) / (3 - 1) = 8 / 2 = 4.'
  },
  {
    id: 40,
    section: 'Quantitative',
    question: 'If x% of 250 = 50, what is x?',
    options: ['10', '15', '20', '25'],
    correct: 2,
    explanation: '(x / 100) × 250 = 50 => 2.5x = 50 => x = 20.'
  },
  {
    id: 41,
    section: 'Quantitative',
    question: 'What is the median of the dataset: 5, 2, 9, 1, 7, 4, 8?',
    options: ['4', '5', '6', '7'],
    correct: 1,
    explanation: 'Ordered dataset: 1, 2, 4, 5, 7, 8, 9. Middle element = 5.'
  },
  {
    id: 42,
    section: 'Quantitative',
    question: 'What is the value of (2³)²?',
    options: ['16', '32', '64', '128'],
    correct: 2,
    explanation: '(8)² = 64.'
  },
  {
    id: 43,
    section: 'Quantitative',
    question: 'An angle measures 35°. What is its complementary angle?',
    options: ['55°', '65°', '145°', '155°'],
    correct: 0,
    explanation: 'Complementary angle = 90° - 35° = 55°.'
  },
  {
    id: 44,
    section: 'Quantitative',
    question: 'A person walks 3 km North and then 4 km East. How far is the person from the starting point?',
    options: ['5 km', '6 km', '7 km', '8 km'],
    correct: 0,
    explanation: 'Distance = √(3² + 4²) = √(9 + 16) = 5 km.'
  },
  {
    id: 45,
    section: 'Quantitative',
    question: 'If a + b = 10 and ab = 21, find a² + b².',
    options: ['42', '58', '79', '100'],
    correct: 1,
    explanation: 'a² + b² = (a + b)² - 2ab = 100 - 42 = 58.'
  },

  // --- VERBAL REASONING & ANALYTICAL ABILITY (55 QUESTIONS) ---
  {
    id: 46,
    section: 'Verbal & Analytical',
    question: 'Architect is to Building as Sculptor is to:',
    options: ['Canvas', 'Statue', 'Chisel', 'Gallery'],
    correct: 1,
    explanation: 'An architect creates a building; a sculptor creates a statue.'
  },
  {
    id: 47,
    section: 'Verbal & Analytical',
    question: 'All programmers log into system servers daily. Henok is a programmer. What must be logically true?',
    options: ['Henok logs into system servers daily.', 'Anyone who logs into system servers daily is a programmer.', 'Henok only works on backend systems.', 'Henok never logs out of the server.'],
    correct: 0,
    explanation: 'Direct modus ponens deduction.'
  },
  {
    id: 48,
    section: 'Verbal & Analytical',
    question: 'Although the team faced initial setbacks, their continuous effort eventually led to a ________ victory.',
    options: ['negligible', 'triumphant', 'hesitant', 'terminal'],
    correct: 1,
    explanation: 'Triumphant fits the positive contrast after setbacks.'
  },
  {
    id: 49,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to CANDID.',
    options: ['Deceptive', 'Frank', 'Secretive', 'Ambiguous'],
    correct: 1,
    explanation: 'Candid means honest or frank.'
  },
  {
    id: 50,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to EXPAND.',
    options: ['Contract', 'Extend', 'Broaden', 'Inflate'],
    correct: 0,
    explanation: 'Contract means to shrink or decrease in size.'
  },
  {
    id: 51,
    section: 'Verbal & Analytical',
    question: 'Doctor is to Hospital as Teacher is to:',
    options: ['Office', 'School', 'Library', 'Laboratory'],
    correct: 1,
    explanation: 'A doctor works in a hospital; a teacher works in a school.'
  },
  {
    id: 52,
    section: 'Verbal & Analytical',
    question: 'All valid certificates bear an official seal. Document A does not have an official seal. What can be concluded?',
    options: ['Document A is a valid certificate.', 'Document A is not a valid certificate.', 'Document A was issued recently.', 'Document A is pending approval.'],
    correct: 1,
    explanation: 'Modus tollens logical deduction.'
  },
  {
    id: 53,
    section: 'Verbal & Analytical',
    question: 'The professor\'s lecture was so ________ that even complex theoretical topics became clear to students.',
    options: ['obscure', 'lucid', 'redundant', 'tedious'],
    correct: 1,
    explanation: 'Lucid means clear and easy to understand.'
  },
  {
    id: 54,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to PRAGMATIC.',
    options: ['Practical', 'Theoretical', 'Idealistic', 'Impractical'],
    correct: 0,
    explanation: 'Pragmatic means dealing with things sensibly and realistically.'
  },
  {
    id: 55,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to ABUNDANT.',
    options: ['Plentiful', 'Scarce', 'Generous', 'Ample'],
    correct: 1,
    explanation: 'Scarce means in insufficient quantity.'
  },
  {
    id: 56,
    section: 'Verbal & Analytical',
    question: 'Pen is to Paper as Paintbrush is to:',
    options: ['Ink', 'Canvas', 'Wall', 'Color'],
    correct: 1,
    explanation: 'A pen writes on paper; a paintbrush paints on canvas.'
  },
  {
    id: 57,
    section: 'Verbal & Analytical',
    question: 'No mammals have gills. Whales are mammals. Therefore:',
    options: ['Whales have gills.', 'Whales do not have gills.', 'Some whales have gills.', 'Animals with gills are mammals.'],
    correct: 1,
    explanation: 'Direct logical conclusion.'
  },
  {
    id: 58,
    section: 'Verbal & Analytical',
    question: 'Strict adherence to safety guidelines is ________ for preventing laboratory accidents.',
    options: ['optional', 'mandatory', 'incidental', 'superficial'],
    correct: 1,
    explanation: 'Mandatory fits the necessity implied by safety adherence.'
  },
  {
    id: 59,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to METICULOUS.',
    options: ['Careless', 'Precise', 'Fast', 'Sloppy'],
    correct: 1,
    explanation: 'Meticulous means showing great attention to detail.'
  },
  {
    id: 60,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to OBSOLETE.',
    options: ['Ancient', 'Modern', 'Outdated', 'Extinct'],
    correct: 1,
    explanation: 'Obsolete means outdated; modern is its antonym.'
  },
  {
    id: 61,
    section: 'Verbal & Analytical',
    question: 'Thermometer is to Temperature as Barometer is to:',
    options: ['Humidity', 'Pressure', 'Wind', 'Rainfall'],
    correct: 1,
    explanation: 'A barometer measures atmospheric pressure.'
  },
  {
    id: 62,
    section: 'Verbal & Analytical',
    question: 'If it rains, the ground gets wet. The ground is wet. Which conclusion is valid?',
    options: ['It definitely rained.', 'It did not rain.', 'It might have rained, or water was poured on it.', 'The ground is never dry.'],
    correct: 2,
    explanation: 'Affirming the consequent is a logical fallacy; other causes could wet the ground.'
  },
  {
    id: 63,
    section: 'Verbal & Analytical',
    question: 'Despite the limited budget, the project was executed with remarkable ________.',
    options: ['inefficiency', 'competence', 'negligence', 'hostility'],
    correct: 1,
    explanation: 'Competence provides the positive contrast needed after "despite".'
  },
  {
    id: 64,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to ADVERSITY.',
    options: ['Prosperity', 'Hardship', 'Luck', 'Harmony'],
    correct: 1,
    explanation: 'Adversity means difficulties or misfortune.'
  },
  {
    id: 65,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to ARTIFICIAL.',
    options: ['Synthetic', 'Fake', 'Natural', 'Manufactured'],
    correct: 2,
    explanation: 'Natural is the direct antonym of artificial.'
  },
  {
    id: 66,
    section: 'Verbal & Analytical',
    question: 'Engine is to Car as CPU is to:',
    options: ['Monitor', 'Keyboard', 'Computer', 'Software'],
    correct: 2,
    explanation: 'The CPU is the primary functional core of a computer.'
  },
  {
    id: 67,
    section: 'Verbal & Analytical',
    question: 'All items in standard tier are blue. Box X is red. Therefore:',
    options: ['Box X is in standard tier.', 'Box X is not in standard tier.', 'Box X is empty.', 'All red boxes are in standard tier.'],
    correct: 1,
    explanation: 'Contrapositive logical deduction.'
  },
  {
    id: 68,
    section: 'Verbal & Analytical',
    question: 'The developer attempted to ________ the error by revising the source code logic.',
    options: ['rectify', 'aggravate', 'ignore', 'duplicate'],
    correct: 0,
    explanation: 'Rectify means to correct or fix.'
  },
  {
    id: 69,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to INNOVATIVE.',
    options: ['Novel', 'Traditional', 'Old', 'Standard'],
    correct: 0,
    explanation: 'Novel means original and new.'
  },
  {
    id: 70,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to TRANSPARENT.',
    options: ['Clear', 'Opaque', 'Lucent', 'Glassy'],
    correct: 1,
    explanation: 'Opaque means not transparent.'
  },
  {
    id: 71,
    section: 'Verbal & Analytical',
    question: 'Library is to Books as Repository is to:',
    options: ['Code', 'Shelves', 'Buildings', 'Pages'],
    correct: 0,
    explanation: 'A code repository stores software code, like a library stores books.'
  },
  {
    id: 72,
    section: 'Verbal & Analytical',
    question: 'Some students are tutors. All tutors are seniors. Therefore:',
    options: ['All students are seniors.', 'Some students are seniors.', 'No students are seniors.', 'Tutors are not students.'],
    correct: 1,
    explanation: 'The intersection of students and tutors falls within seniors.'
  },
  {
    id: 73,
    section: 'Verbal & Analytical',
    question: 'The report contained ________ details that had no direct connection to the main research objective.',
    options: ['essential', 'irrelevant', 'critical', 'vital'],
    correct: 1,
    explanation: 'Irrelevant means not connected or pertinent.'
  },
  {
    id: 74,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to OPTIMIZE.',
    options: ['Degrade', 'Enhance', 'Stop', 'Slow'],
    correct: 1,
    explanation: 'Optimize means to make as effective or functional as possible.'
  },
  {
    id: 75,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to DILIGENT.',
    options: ['Lazy', 'Hardworking', 'Attentive', 'Serious'],
    correct: 0,
    explanation: 'Diligent means hardworking; lazy is its opposite.'
  },
  {
    id: 76,
    section: 'Verbal & Analytical',
    question: 'Clock is to Time as Compass is to:',
    options: ['Speed', 'Distance', 'Direction', 'Altitude'],
    correct: 2,
    explanation: 'A clock measures time; a compass indicates direction.'
  },
  {
    id: 77,
    section: 'Verbal & Analytical',
    question: 'Due to the clear instructions provided, the assembly process was surprisingly ________.',
    options: ['straightforward', 'confusing', 'ambiguous', 'tedious'],
    correct: 0,
    explanation: 'Straightforward fits the positive outcome of clear instructions.'
  },
  {
    id: 78,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to AUTHENTIC.',
    options: ['Genuine', 'Counterfeit', 'Copy', 'Doubtful'],
    correct: 0,
    explanation: 'Authentic means real or genuine.'
  },
  {
    id: 79,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to PERMANENT.',
    options: ['Fixed', 'Temporary', 'Constant', 'Durable'],
    correct: 1,
    explanation: 'Temporary means lasting for a limited time.'
  },
  {
    id: 80,
    section: 'Verbal & Analytical',
    question: 'Every mobile app requires a deployment configuration. App Y does not have a deployment configuration.',
    options: ['App Y is ready for deployment.', 'App Y cannot be deployed properly.', 'App Y is a desktop application.', 'App Y was deployed yesterday.'],
    correct: 1,
    explanation: 'Modus tollens logical conclusion.'
  },
  {
    id: 81,
    section: 'Verbal & Analytical',
    question: 'Kilogram is to Weight as Meter is to:',
    options: ['Volume', 'Length', 'Area', 'Speed'],
    correct: 1,
    explanation: 'Kilogram measures weight; meter measures length.'
  },
  {
    id: 82,
    section: 'Verbal & Analytical',
    question: 'To maintain system stability, administrators must ________ perform system updates.',
    options: ['rarely', 'regularly', 'never', 'randomly'],
    correct: 1,
    explanation: 'Regularly fits routine system maintenance.'
  },
  {
    id: 83,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to COMPREHENSIVE.',
    options: ['Partial', 'Thorough', 'Narrow', 'Limited'],
    correct: 1,
    explanation: 'Comprehensive means complete or thorough.'
  },
  {
    id: 84,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to OPTIMISTIC.',
    options: ['Hopeful', 'Pessimistic', 'Positive', 'Confident'],
    correct: 1,
    explanation: 'Pessimistic is the antonym of optimistic.'
  },
  {
    id: 85,
    section: 'Verbal & Analytical',
    question: 'Triangle is to Three as Hexagon is to:',
    options: ['Five', 'Six', 'Seven', 'Eight'],
    correct: 1,
    explanation: 'A triangle has 3 sides; a hexagon has 6 sides.'
  },
  {
    id: 86,
    section: 'Verbal & Analytical',
    question: 'All network connections require authentication. Connection Z did not request authentication.',
    options: ['Connection Z is valid.', 'Connection Z is not authenticated.', 'Connection Z is secure.', 'Connection Z is the main server.'],
    correct: 1,
    explanation: 'Without authentication, Connection Z lacks validity under the rule.'
  },
  {
    id: 87,
    section: 'Verbal & Analytical',
    question: 'The sudden drop in system latency was a direct result of performance ________.',
    options: ['reduction', 'optimization', 'corruption', 'degradation'],
    correct: 1,
    explanation: 'A drop in latency indicates improved speed due to optimization.'
  },
  {
    id: 88,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to EVALUATE.',
    options: ['Assess', 'Ignore', 'Discard', 'Assume'],
    correct: 0,
    explanation: 'To evaluate means to assess or judge.'
  },
  {
    id: 89,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to RIGID.',
    options: ['Flexible', 'Hard', 'Stiff', 'Solid'],
    correct: 0,
    explanation: 'Flexible is the opposite of rigid.'
  },
  {
    id: 90,
    section: 'Verbal & Analytical',
    question: 'Keyboard is to Input as Screen is to:',
    options: ['Processing', 'Storage', 'Output', 'Memory'],
    correct: 2,
    explanation: 'A keyboard is an input device; a screen is an output device.'
  },
  {
    id: 91,
    section: 'Verbal & Analytical',
    question: 'If a candidate scores above 50%, they pass the assessment. Candidate B scored 61.42%.',
    options: ['Candidate B failed the assessment.', 'Candidate B passed the assessment.', 'Candidate B must retake the test.', 'Candidate B scored below average.'],
    correct: 1,
    explanation: '61.42% > 50%, so Candidate B passed.'
  },
  {
    id: 92,
    section: 'Verbal & Analytical',
    question: 'The results of the experiment were ________ across all trial runs, yielding identical data points every time.',
    options: ['erratic', 'consistent', 'unpredictable', 'fluctuating'],
    correct: 1,
    explanation: 'Consistent means showing steady or identical performance.'
  },
  {
    id: 93,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to PERSISTENT.',
    options: ['Temporary', 'Tenacious', 'Yielding', 'Reluctant'],
    correct: 1,
    explanation: 'Tenacious means persistent or firm.'
  },
  {
    id: 94,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to CONCISE.',
    options: ['Brief', 'Wordy', 'Succinct', 'Short'],
    correct: 1,
    explanation: 'Wordy means using too many words; the opposite of concise.'
  },
  {
    id: 95,
    section: 'Verbal & Analytical',
    question: 'Solar is to Sun as Lunar is to:',
    options: ['Earth', 'Moon', 'Stars', 'Orbit'],
    correct: 1,
    explanation: 'Solar relates to the Sun; lunar relates to the Moon.'
  },
  {
    id: 96,
    section: 'Verbal & Analytical',
    question: 'Before publishing the application build, developers must thoroughly ________ the code for bugs.',
    options: ['inspect', 'hide', 'erase', 'duplicate'],
    correct: 0,
    explanation: 'Inspect means to carefully examine.'
  },
  {
    id: 97,
    section: 'Verbal & Analytical',
    question: 'Choose the word most similar in meaning to FEASIBLE.',
    options: ['Achievable', 'Impossible', 'Unlikely', 'Far-fetched'],
    correct: 0,
    explanation: 'Feasible means possible or achievable.'
  },
  {
    id: 98,
    section: 'Verbal & Analytical',
    question: 'Choose the word most opposite in meaning to VOLUNTARY.',
    options: ['Optional', 'Compulsory', 'Willing', 'Unforced'],
    correct: 1,
    explanation: 'Compulsory means mandatory or required.'
  },
  {
    id: 99,
    section: 'Verbal & Analytical',
    question: 'Root is to Tree as Foundation is to:',
    options: ['Roof', 'Building', 'Wall', 'Window'],
    correct: 1,
    explanation: 'A root supports a tree; a foundation supports a building.'
  },
  {
    id: 100,
    section: 'Verbal & Analytical',
    question: 'All items registered in the database have a unique identifier. Record 101 is registered in the database.',
    options: ['Record 101 has a unique identifier.', 'Record 101 lacks an identifier.', 'Record 101 is duplicate data.', 'Record 101 cannot be found.'],
    correct: 0,
    explanation: 'Direct modus ponens deduction.'
  }
];

// --- React Inline Styling Definitions ---
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '16px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#333'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  border: '1px solid #e1e8ed',
  marginBottom: '16px'
};

const primaryButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#0088cc',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '8px'
};

const secondaryButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  backgroundColor: '#f1f5f9',
  color: '#334155',
  border: '1px solid #cbd5e1'
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<'intro' | 'exam' | 'results' | 'review'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(9000); // 2 hours 30 mins
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [userName, setUserName] = useState('Candidate');
  const [savedScore, setSavedScore] = useState<number | null>(null);

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  // Initialize Telegram User and check Supabase for prior attempt
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready?.();
      if (telegramUser?.first_name) {
        setUserName(telegramUser.first_name);
      } else if (telegramUser?.username) {
        setUserName(`@${telegramUser.username}`);
      }
    }

    async function checkExistingAttempt() {
      if (!telegramUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_attempts')
          .select('*')
          .eq('user_id', telegramUser.id)
          .maybeSingle();

        if (error) {
          console.error("Error querying Supabase:", error);
        } else if (data) {
          setAnswers(data.answers || {});
          setSavedScore(data.score);
          setScreen('results');
        }
      } catch (err) {
        console.error("Unexpected error checking attempt:", err);
      } finally {
        setLoading(false);
      }
    }

    checkExistingAttempt();
  }, [telegramUser]);

  // Exam Countdown Timer
  useEffect(() => {
    if (screen !== 'exam') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [screen]);

  const handleSelectOption = (optIdx: number) => {
    setAnswers({ ...answers, [currentIdx]: optIdx });
  };

  const toggleFlag = (idx: number) => {
    setFlagged({ ...flagged, [idx]: !flagged[idx] });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const calculateResults = () => {
    let quantCorrect = 0;
    let verbalCorrect = 0;

    mockQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) {
        if (q.section === 'Quantitative') quantCorrect++;
        else verbalCorrect++;
      }
    });

    const totalCorrect = quantCorrect + verbalCorrect;
    const scorePct = Math.round((totalCorrect / mockQuestions.length) * 100);

    return { totalCorrect, scorePct, quantCorrect, verbalCorrect };
  };

  const handleFinalSubmit = async () => {
    setShowSubmitModal(false);
    const { totalCorrect } = calculateResults();
    setSavedScore(totalCorrect);

    if (telegramUser?.id) {
      const { error } = await supabase
        .from('user_attempts')
        .insert([
          {
            user_id: telegramUser.id,
            score: totalCorrect,
            answers: answers
          }
        ]);

      if (error && error.code !== '23505') {
        console.error("Failed to persist score to Supabase:", error);
      }
    }

    setScreen('results');
  };

  const handleShareScore = () => {
    const { totalCorrect, scorePct } = calculateResults();
    const shareText = encodeURIComponent(
      `🎯 I completed the UAT Model Exam!\n\n👤 Candidate: ${userName}\n📊 Score: ${totalCorrect}/${mockQuestions.length} (${scorePct}%)\n⏱️ Time Spent: ${formatTime(9000 - timeLeft)}`
    );
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/')}&text=${shareText}`;
    
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const totalQs = mockQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQs - answeredCount;

  const quantCount = mockQuestions.filter(q => q.section === 'Quantitative').length;
  const verbalCount = mockQuestions.filter(q => q.section === 'Verbal & Analytical').length;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
        <h3>Loading examination portal...</h3>
      </div>
    );
  }

  // --- 1. INTRO SCREEN ---
  if (screen === 'intro') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2>👋 Hello, {userName}!</h2>
          <p style={{ color: '#64748b' }}>Welcome to the Final UAT Model examination simulation.</p>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />
          <p><strong>Total Questions:</strong> {totalQs} ({quantCount} Quantitative, {verbalCount} Verbal & Analytical)</p>
          <p><strong>Duration:</strong> 2 Hours 30 Minutes</p>
          <p><strong>Pass Mark:</strong> 50%</p>
          <button style={primaryButtonStyle} onClick={() => setScreen('exam')}>
            🚀 Start Examination
          </button>
        </div>
      </div>
    );
  }

  // --- 2. RESULTS SCREEN ---
  if (screen === 'results') {
    const { totalCorrect, quantCorrect, verbalCorrect } = calculateResults();
    const displayScore = savedScore !== null ? savedScore : totalCorrect;
    const displayPct = Math.round((displayScore / totalQs) * 100);

    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h2>🎓 Exam Completed!</h2>
          <p style={{ color: '#64748b' }}>Candidate: {userName}</p>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#0088cc', margin: '10px 0' }}>
            {displayPct}%
          </div>
          <p style={{ color: '#22c55e', fontWeight: 'bold' }}>{displayScore} Correct</p>
          <p style={{ color: '#ef4444' }}>{totalQs - displayScore} Wrong</p>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />

          <h3 style={{ textAlign: 'left', fontSize: '16px' }}>Section Performance</h3>
          <div style={{ textAlign: 'left', fontSize: '14px', lineHeight: '2' }}>
            <div>🔢 Quantitative: {quantCorrect} / {quantCount} ({Math.round((quantCorrect / quantCount) * 100)}%)</div>
            <div>📖 Verbal & Analytical: {verbalCorrect} / {verbalCount} ({Math.round((verbalCorrect / verbalCount) * 100)}%)</div>
          </div>

          <button style={primaryButtonStyle} onClick={() => setScreen('review')}>
            🔍 Review Answers & Explanations
          </button>
          <button style={secondaryButtonStyle} onClick={handleShareScore}>
            📤 Share Your Score
          </button>
        </div>
      </div>
    );
  }

  // --- 3. QUESTION REVIEW SCREEN ---
  if (screen === 'review') {
    const q = mockQuestions[currentIdx];
    const userAns = answers[currentIdx];

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Review Question {currentIdx + 1} of {totalQs}</span>
          <button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ccc', cursor: 'pointer' }} onClick={() => setScreen('results')}>
            Exit Review
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '12px', color: '#0088cc', fontWeight: 'bold', marginBottom: '8px' }}>
            {q.section.toUpperCase()}
          </div>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>{q.question}</h3>

          {q.options.map((opt, optIdx) => {
            const isCorrect = optIdx === q.correct;
            const isSelected = userAns === optIdx;

            let bgColor = '#f8fafc';
            let borderColor = '#e2e8f0';

            if (isCorrect) {
              bgColor = '#dcfce7';
              borderColor = '#22c55e';
            } else if (isSelected && !isCorrect) {
              bgColor = '#fee2e2';
              borderColor = '#ef4444';
            }

            return (
              <div key={optIdx} style={{ padding: '10px 14px', margin: '8px 0', borderRadius: '8px', border: `1px solid ${borderColor}`, backgroundColor: bgColor, fontSize: '14px' }}>
                {opt}
                {isCorrect && ' ✅ (Correct Answer)'}
                {isSelected && !isCorrect && ' ❌ (Your Answer)'}
              </div>
            );
          })}

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #0088cc', fontSize: '13px' }}>
            <strong>Explanation:</strong> {q.explanation}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={secondaryButtonStyle} disabled={currentIdx === 0} onClick={() => setCurrentIdx((p) => p - 1)}>
            Previous
          </button>
          <button style={primaryButtonStyle} disabled={currentIdx === totalQs - 1} onClick={() => setCurrentIdx((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    );
  }

  // --- 4. ACTIVE EXAMINATION SCREEN ---
  const currentQ = mockQuestions[currentIdx];

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
        <span>Question {currentIdx + 1} of {totalQs}</span>
        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⏱️ {formatTime(timeLeft)}</span>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: '12px', color: '#0088cc', fontWeight: 'bold', marginBottom: '8px' }}>
          {currentQ.section.toUpperCase()}
        </div>
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>{currentQ.question}</h3>

        {currentQ.options.map((opt, optIdx) => (
          <button
            key={optIdx}
            onClick={() => handleSelectOption(optIdx)}
            style={{
              width: '100%',
              padding: '12px',
              margin: '6px 0',
              textAlign: 'left',
              borderRadius: '8px',
              cursor: 'pointer',
              border: answers[currentIdx] === optIdx ? '2px solid #0088cc' : '1px solid #cbd5e1',
              backgroundColor: answers[currentIdx] === optIdx ? '#e0f2fe' : '#ffffff',
              fontSize: '14px'
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Question Navigation Grid */}
      <div style={cardStyle}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>Question Navigation</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
          {mockQuestions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              style={{
                padding: '6px 2px',
                fontSize: '11px',
                borderRadius: '4px',
                border: currentIdx === idx ? '2px solid #0088cc' : '1px solid #cbd5e1',
                backgroundColor: answers[idx] !== undefined ? '#0088cc' : flagged[idx] ? '#f59e0b' : '#f8fafc',
                color: answers[idx] !== undefined || flagged[idx] ? '#ffffff' : '#334155',
                fontWeight: currentIdx === idx ? 'bold' : 'normal',
                cursor: 'pointer'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={secondaryButtonStyle} disabled={currentIdx === 0} onClick={() => setCurrentIdx((p) => p - 1)}>
          Previous
        </button>
        <button
          style={{ ...secondaryButtonStyle, backgroundColor: flagged[currentIdx] ? '#fef3c7' : '#f1f5f9' }}
          onClick={() => toggleFlag(currentIdx)}
        >
          {flagged[currentIdx] ? '🚩 Flagged' : 'Flag'}
        </button>
        <button style={primaryButtonStyle} onClick={() => setCurrentIdx((p) => Math.min(totalQs - 1, p + 1))}>
          Next
        </button>
      </div>

      <button style={{ ...primaryButtonStyle, backgroundColor: '#059669', marginTop: '12px' }} onClick={() => setShowSubmitModal(true)}>
        Submit Examination
      </button>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 1000
        }}>
          <div style={{ ...cardStyle, width: '100%', maxWidth: '400px', marginBottom: 0 }}>
            <h3 style={{ marginTop: 0 }}>Submit Exam?</h3>
            <p>You've answered <strong>{answeredCount} of {totalQs}</strong> questions.</p>
            {unansweredCount > 0 && (
              <p style={{ color: '#b45309', backgroundColor: '#fef3c7', padding: '8px', borderRadius: '6px', fontSize: '13px' }}>
                ⚠️ {unansweredCount} questions unanswered. You cannot change answers after submitting.
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button style={secondaryButtonStyle} onClick={() => setShowSubmitModal(false)}>
                Keep Going
              </button>
              <button style={primaryButtonStyle} onClick={handleFinalSubmit}>
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
