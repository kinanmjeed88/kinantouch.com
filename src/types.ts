
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
  category: 'Tech' | 'Apps' | 'Games' | 'Sports';
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}
