export interface Experience {
  company: string;
  position: string;
  duration: string;
  description: string[];
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  github: string;
  demo: string | undefined;
  featured: boolean;
}
