import React from 'react';

/**
 * This is the commit message of the last commit before building or running this project
 * @see ./package.json git-info for how to generate this commit
 */
import GitCommit from '../config/_git_commit';

const BuildInfo = () => (
  <div>
    <h1>Commit: {GitCommit.logMessage}</h1>
    <h1>Branch: {GitCommit.branch}</h1>

  </div>
);

export default BuildInfo;