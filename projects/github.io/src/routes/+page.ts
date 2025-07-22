import type { PageLoad } from './$types';

export const load: PageLoad = () => {
  const email = 'laxsuryavanshi@gmail.com';
  return {
    currentYear: new Date().getFullYear(),

    author: 'Laxmikant Suryavanshi',
    email,
    introduction:
      'A passionate software engineer who loves building innovative solutions, ' +
      'learning new technologies and collaborating with global communities.',

    heroImage: '/undraw/programming.svg',
    cvLink:
      'https://www.dropbox.com/scl/fi/9h6lnnhm5i0uqohg4qf6f/AWS-Certified-Developer-Associate-certificate.pdf?rlkey=54nq593aay7hhy3rh5o7ffv32&st=gcgg4oji&dl=0',

    skills: [
      {
        type: 'skillgroup',
        label: 'Frontend',
        skills: [
          // { type: 'skill', label: 'JavaScript', icon: 'javascript', color: '#f7df1e' },
          { type: 'skill', label: 'TypeScript', icon: 'typescript', color: '#3178C6' },
          { type: 'skill', label: 'Angular', icon: 'angular', color: '#dd0031' },
          { type: 'skill', label: 'React', icon: 'react', color: '#61dafb' },
          // { type: 'skill', label: 'NextJS', icon: 'nextjs', color: '#e5e5e5' },
          { type: 'skill', label: 'Svelte', icon: 'svelte', color: '#ff3e00' },
        ],
      },
      {
        type: 'skillgroup',
        label: 'Backend & Database',
        skills: [
          // { type: 'skill', label: 'Java', icon: 'openjdk', color: '#ed8b00' },
          { type: 'skill', label: 'Springboot', icon: 'springboot', color: '#6db33f' },
          { type: 'skill', label: 'Node.js', icon: 'nodejs', color: '#5fa04e' },
          { type: 'skill', label: 'PostgreSQL', icon: 'postgresql', color: '#4169e1' },
          { type: 'skill', label: 'MongoDB', icon: 'mongodb', color: '#47a248' },
        ],
      },
      {
        type: 'skillgroup',
        label: 'Tools & Platforms',
        skills: [
          { type: 'skill', label: 'AWS', icon: 'task', color: '#ff9900' },
          { type: 'skill', label: 'Kubernetes', icon: 'kubernetes', color: '#326ce5' },
          { type: 'skill', label: 'Docker', icon: 'docker', color: '#2496ed' },
          // { type: 'skill', label: 'Git', icon: 'git', color: '#f05032' },
          // { type: 'skill', label: 'Linux', icon: 'linux', color: '#fcc624' },
        ],
      },
    ],

    socialLinks: [
      {
        name: 'Mail',
        url: `mailto:${email}`,
        icon: 'mail',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/laxsuryavanshi/',
        icon: 'linkedin',
      },
      {
        name: 'GitHub',
        url: 'https://github.com/laxsuryavanshi',
        icon: 'github',
      },
    ],
  };
};
