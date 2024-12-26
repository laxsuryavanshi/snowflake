import { Octokit } from '@octokit/core';

export type GitHubUser = Awaited<ReturnType<typeof GitHubService.prototype.getUser>>;

class GitHubService {
  readonly X_GITHUB_API_VERSION = '2022-11-28';

  readonly octokit: Octokit;

  constructor(private _pat: string) {
    this.octokit = new Octokit({ auth: this._pat });
  }

  async getUser() {
    return await this.octokit
      .request('GET /user', {
        'X-GitHub-Api-Version': this.X_GITHUB_API_VERSION,
      })
      .then(response => response.data);
  }
}

const github = new GitHubService(import.meta.env['VITE_GITHUB_PERSONAL_ACCESS_TOKEN'] as string);

export default github;
