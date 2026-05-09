import * as core from '@actions/core';

export interface ProjectCheckerConfig {
  enabled: boolean;
  requireProject: boolean;
  allowedProjects: string[];
}

export function loadProjectCheckerConfig(): ProjectCheckerConfig {
  const enabled = core.getInput('project_check_enabled').toLowerCase() !== 'false';
  const requireProject = core.getInput('project_require').toLowerCase() === 'true';
  const allowedProjectsRaw = core.getInput('project_allowed');

  const allowedProjects = allowedProjectsRaw
    ? allowedProjectsRaw.split(',').map((p) => p.trim()).filter(Boolean)
    : [];

  return {
    enabled,
    requireProject,
    allowedProjects,
  };
}

export function buildProjectCheckerSummary(config: ProjectCheckerConfig): string {
  const lines: string[] = ['**Project Checker Configuration:**'];

  lines.push(`- Enabled: ${config.enabled}`);
  lines.push(`- Require Project: ${config.requireProject}`);

  if (config.allowedProjects.length > 0) {
    lines.push(`- Allowed Projects: ${config.allowedProjects.join(', ')}`);
  } else {
    lines.push('- Allowed Projects: (any)');
  }

  return lines.join('\n');
}
