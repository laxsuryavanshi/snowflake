import type { Experience, Project } from '$lib/types';
import type { PageLoad } from './$types';

const experiences: Experience[] = [
  {
    company: 'Infosys Limited',
    position: 'Specialist Programmer',
    duration: 'Aug 2021 - Present',
    description: [
      'Collaborated with cross-functional teams to deliver a high-performing supply chain management ' +
        'platform, upholding strong code quality standards and ensuring alignment with organizational best practices.',
      'Designed and implemented an intuitive onboarding workflow that streamlined complex data entry ' +
        'processes, improving usability and reducing manual effort.',
      'Enhanced the report generation system by optimizing data processing, achieving a 72% faster ' +
        'turnaround and maintaining seamless user experience even with large datasets.',
      'Improved the performance of a data-heavy request tracking dashboard, cutting initial load time by ' +
        '60% and enabling smoother real-time interaction for end-users.',
      'Led the creation of a shared UI component library, promoting design consistency and reducing ' +
        'duplicate code by 30% across multiple application modules.',
    ],
  },
];

const projects: Project[] = [
  {
    title: 'IDMS - Identity Management System',
    description:
      'A robust identity management system to handle user authentication and authorization across ' +
      'multiple tenants, featuring SSO, multi-factor authentication, and user provisioning.',
    tags: ['React', 'Spring Boot', 'PostgreSQL', 'Docker'],
    github: 'https://github.com/laxsuryavanshi/idms',
    demo: undefined,
    featured: true,
  },
  {
    title: 'BitVolt',
    description:
      'A modern cloud storage platform similar to Dropbox with secure file upload, sharing, and ' +
      'management. Features real-time synchronization and scalable storage using AWS S3.',
    tags: ['Next.js', 'AWS S3', 'React', 'TailwindCSS'],
    github: 'https://github.com/laxsuryavanshi/snowflake/tree/main/projects/bitvolt',
    demo: undefined,
    featured: true,
  },
  {
    title: 'Boids Simulation',
    description:
      'A real-time flocking simulation with cross-window communication. Watch boids fly seamlessly ' +
      'between browser windows with synchronized settings and smooth animations.',
    tags: ['JavaScript', 'BroadcastChannel API', 'HTML5 Canvas'],
    github: 'https://github.com/laxsuryavanshi/snowflake/tree/main/projects/boids',
    demo: 'https://laxsuryavanshi.me/projects/boids-simulation/',
    featured: false,
  },
  {
    title: '@turtleby/workerhive',
    description:
      'A TypeScript library for parallel processing with Web Workers. Simplifies worker management ' +
      'and task distribution for compute-intensive operations in the browser.',
    tags: ['TypeScript', 'Web Workers', 'Comlink', 'Library'],
    github: 'https://github.com/laxsuryavanshi/snowflake/tree/main/packages/workerhive',
    demo: 'https://hashlab.turtleby.com',
    featured: false,
  },
  {
    title: 'Skylr',
    description:
      'A peer-to-peer video call application built on WebRTC. Enables direct browser-to-browser ' +
      'communication for real-time video conferencing without server intermediaries.',
    tags: ['Svelte', 'WebRTC', 'SvelteKit', 'TailwindCSS'],
    github: 'https://github.com/laxsuryavanshi/snowflake/tree/main/projects/skylr',
    demo: 'https://skylr.turtleby.com',
    featured: false,
  },
];

export const load: PageLoad = () => {
  const email = 'laxsuryavanshi@gmail.com';
  return {
    author: 'Laxmikant Suryavanshi',
    email,
    introduction:
      'A passionate software engineer who loves building innovative solutions, learning new technologies ' +
      'and collaborating with global communities.',

    heroImage: '/undraw/programming.svg',
    cvLink:
      'https://www.dropbox.com/scl/fi/sdq1yeawzxd4xwitu3omw/LaxmikantSuryavanshi_Resume_v1.pdf?rlkey=1lnh91e9jpt5youxknm8c311f&st=8oxctv6e&dl=0',

    experiences,
    projects,

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
          { type: 'skill', label: 'Java', icon: 'openjdk', color: '#ed8b00' },
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
          { type: 'skill', label: 'Git', icon: 'git', color: '#f05032' },
          { type: 'skill', label: 'Linux', icon: 'linux', color: '#fcc624' },
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
