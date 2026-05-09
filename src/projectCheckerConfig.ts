import * as core from '@actions/core';
import { parseCommaSeparated } from './config';
import { ProjectCheckerConfig } from './projectChecker';

export function loadProjectCheckerConfig(): ProjectCheckerConfig {
  const requireProject =
    core.getInput('require_project').toLowerCase() === 'true';
  const allowedProjects = parseCommaSeparated(
    core.getInput('allowed_projects')
  );
  const allowedColumns = parseCommaSeparated(
    core.getInput('allowed_project_columns')
  );

  return {
    requireProject,
    allowedProjects,
    allowedColumns,
  };
}

export function buildProjectCheckerSummary(
  config: ProjectCheckerConfig
): string {
  const lines: string[] = ['**Project Checker Config:**'];

  lines.push(`- Require project: ${config.requireProject}`);

  if (config.allowedProjects.length > 0) {
    lines.push(`- Allowed projects: ${config.allowedProjects.join(', ')}`);
  } else {
    lines.push('- Allowed projects: any');
  }

  if (config.allowedColumns.length > 0) {
    lines.push(`- Allowed columns: ${config.allowedColumns.join(', ')}`);
  } else {
    lines.push('- Allowed columns: any');
  }

  return lines.join('\n');
}
