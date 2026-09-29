/** Skills — ported from FrontPage/src/app/MAIN/skills/skills.html. */

export interface SkillGroup {
  icon: string;
  title: string;
  items: string[];
}

/** the four cards: how Luka works */
export const skillGroups: SkillGroup[] = [
  { icon: '🎯', title: 'Mindset', items: ['High-pressure environments', 'Purpose-driven execution', 'Creative ideal–driven mindset'] },
  { icon: '🤝', title: 'Collaboration', items: ['Team-based collaboration', 'Leadership & ownership', 'Independent execution'] },
  { icon: '🎬', title: 'Storytelling', items: ['Narrative structure', 'Emotional flow', 'Visual rhythm'] },
  { icon: '✂️', title: 'Editing', items: ['Cinematic editing', 'Rhythm & pacing', 'Emotion-driven cuts'] },
];

export interface Tool {
  /** short mark, as on an app icon */
  short: string;
  name: string;
}

/** "Video & Design" tools, in the order the old site showed them */
export const tools: Tool[] = [
  { short: 'Pr', name: 'Adobe Premiere Pro' },
  { short: 'DaVinci', name: 'DaVinci Resolve' },
  { short: 'Ae', name: 'Adobe After Effects' },
  { short: 'Ps', name: 'Adobe Photoshop' },
  { short: 'Ai', name: 'Adobe Illustrator' },
  { short: 'CapCut', name: 'CapCut' },
  { short: 'Video Star', name: 'Video Star' },
];

export const beyondWork: SkillGroup = {
  icon: '🌌',
  title: 'Beyond Work',
  items: ['Tech enthusiast', 'Music-focused workflow', 'Video experimentation'],
};

export const languages: { name: string; level: string }[] = [
  { name: 'Georgian', level: 'Native' },
  { name: 'English', level: 'Working proficiency' },
];
