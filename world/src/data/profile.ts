/** Who Luka is and where to reach him — ported from the old hero, nav and chat. */

export const profile = {
  name: 'Luka Gengashvili',
  role: 'Video Editor & Post-Production Specialist',
  location: 'Tbilisi, Georgia',
  photo: '/profileIMGearpods.png',
  cv: { href: '/Video-Editor-CV.docx', filename: 'Luka Gengashvili — Video Editor CV.docx' },
  youtube: '@lukagengashvili',
};

/** The hero paragraphs; `years` comes from totalYears() so it never drifts. */
export function heroParagraphs(years: number): string[] {
  return [
    `I’m Luka, a Post-Production Specialist with over ${years} years of experience in video editing, motion graphics, and AI-powered content creation. I’m skilled in Adobe Premiere Pro, After Effects, Illustrator, Photoshop, Lightroom, DaVinci Resolve, Sony Vegas Pro, and modern AI tools that help streamline and scale production workflows. I love working with Sony cameras and I’m crazy about drones.`,
    'Over the past few years, I’ve successfully delivered a wide range of projects across different companies and teams, from AI-generated video trailers and cinematic short-form content to brand-focused commercial work.',
  ];
}

export interface Social {
  label: string;
  href: string;
  /** Font Awesome brand class */
  icon: string;
}

export const socials: Social[] = [
  { label: 'Upwork', href: 'https://www.upwork.com/freelancers/~01302173bf6de06e93', icon: 'fa-brands fa-upwork' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/luka-gengashvili-652a18345/', icon: 'fa-brands fa-linkedin-in' },
  { label: 'Telegram', href: 'https://t.me/+995558722027', icon: 'fa-brands fa-telegram' },
  { label: 'WhatsApp', href: 'https://wa.me/995558722027', icon: 'fa-brands fa-whatsapp' },
  { label: 'YouTube', href: 'https://www.youtube.com/@lukagengashvili', icon: 'fa-brands fa-youtube' },
];

/** The hero pills — each one opens the projects page pre-filtered. */
export const workFilters: { label: string; query: string }[] = [
  { label: 'Video Storytelling', query: '' },
  { label: '2D Stickman', query: 'category=stickman' },
  { label: '16:9', query: 'ratio=169' },
  { label: '9:16', query: 'ratio=916' },
  { label: 'Long Form', query: 'length=long' },
  { label: 'Short Form', query: 'length=short' },
];
