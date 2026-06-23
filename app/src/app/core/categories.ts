import { CATEGORY_IDS } from '@shared/index';
import type { Category } from '@shared/index';

export interface CategoryMeta {
  id: Category;
  label: string;
}

const LABELS: Record<Category, string> = {
  'ai-agents': 'AI & Agents',
  'ai-integration': 'AI Integration',
  frontend: 'Frontend',
  angular: 'Angular',
  react: 'React',
  'vue-svelte': 'Vue & Svelte',
  backend: 'Backend',
  'spring-boot': 'Spring Boot',
  nestjs: 'NestJS',
  node: 'Node.js',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  devops: 'DevOps',
  medium: 'Medium',
};

export const CATEGORY_META: CategoryMeta[] = CATEGORY_IDS.map((id) => ({ id, label: LABELS[id] }));

export function categoryLabel(id: Category): string {
  return LABELS[id];
}
