import type { Category } from './types';

export * from './types';

export const CATEGORY_IDS: Category[] = [
  'ai-agents',
  'ai-integration',
  'frontend',
  'angular',
  'react',
  'vue-svelte',
  'backend',
  'spring-boot',
  'nestjs',
  'node',
  'javascript',
  'typescript',
  'devops',
  'medium',
];

export function isCategory(value: string): value is Category {
  return (CATEGORY_IDS as string[]).includes(value);
}
