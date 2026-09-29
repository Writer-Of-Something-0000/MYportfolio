/**
 * Education — ported from FrontPage/src/app/MAIN/education/education.html, where
 * it was hardcoded markup. On the timeline every course is a keyframe placed at
 * its real dates.
 *
 * The old site labelled every course "Bachelor's degree"; `kind` replaces that
 * with what each one actually is.
 */

export interface Course {
  name: string;
  kind: string;
  start: Date;
  end: Date;
  grade: string;
  /** shown as a badge when the course came with a paper */
  credential?: 'Certificate' | 'Diploma';
}

export interface School {
  name: string;
  logo: string;
  courses: Course[];
  skills: string[];
}

const d = (year: number, month: number) => new Date(year, month - 1, 1);

export const schools: School[] = [
  {
    name: 'Academy of Digital Industries',
    logo: '/digital-industries.png',
    courses: [
      { name: 'UI / UX Design', kind: 'Certificate course', start: d(2026, 1), end: d(2026, 3), grade: 'A' },
      { name: 'Motion Design', kind: 'Certificate course', start: d(2025, 11), end: d(2026, 1), grade: 'A+', credential: 'Certificate' },
      { name: 'Graphic Design', kind: 'Certificate course', start: d(2025, 11), end: d(2026, 1), grade: 'A', credential: 'Certificate' },
      { name: 'Video Editing', kind: 'Certificate course', start: d(2025, 9), end: d(2025, 10), grade: 'A++', credential: 'Certificate' },
    ],
    skills: ['Adobe Premiere Pro', 'Adobe After Effects', 'Adobe Photoshop', 'Adobe Illustrator', 'Figma'],
  },
  {
    name: 'IT Academy Step',
    logo: '/it-academy-step.jpg',
    courses: [
      { name: 'Full-Stack Web Development', kind: 'Diploma program', start: d(2023, 9), end: d(2025, 9), grade: 'A+', credential: 'Diploma' },
      { name: 'Frontend', kind: 'Program module', start: d(2023, 9), end: d(2024, 8), grade: 'A+', credential: 'Certificate' },
      { name: 'Backend', kind: 'Program module', start: d(2024, 8), end: d(2025, 9), grade: 'A', credential: 'Certificate' },
    ],
    skills: [
      'HTML5', 'CSS3', 'SCSS', 'Bootstrap', 'JavaScript', 'Angular 16+', 'C#', '.NET',
      'Entity Framework', 'SQL', 'Docker', 'Azure Data Studio', 'Git', 'GitHub / GitHub Desktop',
    ],
  },
  {
    name: 'Udemy',
    logo: '/udemy.webp',
    courses: [
      { name: 'Angular 19, 20', kind: 'Online course', start: d(2025, 10), end: d(2025, 11), grade: 'A++' },
      { name: 'C#', kind: 'Online course', start: d(2025, 10), end: d(2025, 11), grade: 'A' },
      { name: 'ASP.NET', kind: 'Online course', start: d(2025, 10), end: d(2025, 11), grade: 'A' },
      { name: 'Entity Framework', kind: 'Online course', start: d(2025, 10), end: d(2025, 11), grade: 'A' },
    ],
    skills: ['Angular', 'C#', 'APIs', 'HTTP Requests', 'Web Communication', 'Authentication & Security'],
  },
];
