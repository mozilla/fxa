import { getJestProjects } from '@nx/jest';

export default {
  projects: getJestProjects(),
  globals: {
    fetch: global.fetch,
  },
};
