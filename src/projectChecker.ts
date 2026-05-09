import * as core from '@actions/core';
import { CheckResult } from './reporter';

export interface ProjectCard {
  project: {
    name: string;
  };
  column: {
    name: string;
  };
}

export interface ProjectCheckerConfig {
  requireProject: boolean;
  allowedProjects: string[];
  allowedColumns: string[];
}

export function extractProjectCards(
  context: Record<string, unknown>
): ProjectCard[] {
  try {
    const cards = (context as any)?.payload?.pull_request?.project_cards;
    if (!Array.isArray(cards)) return [];
    return cards as ProjectCard[];
  } catch {
    return [];
  }
}

export function checkProject(
  cards: ProjectCard[],
  config: ProjectCheckerConfig
): CheckResult {
  if (!config.requireProject) {
    return { passed: true, message: 'Project check skipped.' };
  }

  if (cards.length === 0) {
    return {
      passed: false,
      message: 'PR is not assigned to any project.',
    };
  }

  if (config.allowedProjects.length > 0) {
    const projectNames = cards.map((c) => c.project.name);
    const hasAllowed = projectNames.some((name) =>
      config.allowedProjects.includes(name)
    );
    if (!hasAllowed) {
      return {
        passed: false,
        message: `PR project must be one of: ${config.allowedProjects.join(', ')}. Found: ${projectNames.join(', ')}.`,
      };
    }
  }

  if (config.allowedColumns.length > 0) {
    const columnNames = cards.map((c) => c.column.name);
    const hasAllowed = columnNames.some((col) =>
      config.allowedColumns.includes(col)
    );
    if (!hasAllowed) {
      return {
        passed: false,
        message: `PR column must be one of: ${config.allowedColumns.join(', ')}. Found: ${columnNames.join(', ')}.`,
      };
    }
  }

  return { passed: true, message: 'PR project check passed.' };
}
