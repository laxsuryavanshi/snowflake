import { Octokit } from '@octokit/core';
import { Endpoints } from '@octokit/types';

export type User = Endpoints['GET /user']['response']['data'];

export type Repo = Endpoints['GET /user/repos']['response']['data'][number];

export type Branch = Endpoints['GET /repos/{owner}/{repo}/branches']['response']['data'][number];

class GitHubService {
  readonly X_GITHUB_API_VERSION = '2022-11-28';

  readonly octokit: Octokit;

  constructor(private _pat: string) {
    this.octokit = new Octokit({ auth: this._pat });
  }

  async getUser(): Promise<User> {
    return await this.octokit
      .request('GET /user', {
        'X-GitHub-Api-Version': this.X_GITHUB_API_VERSION,
      })
      .then(response => response.data);
  }

  async getRepos(): Promise<Repo[]> {
    return await this.octokit
      .request('GET /user/repos', {
        'X-GitHub-Api-Version': this.X_GITHUB_API_VERSION,
      })
      .then(response => response.data);
  }

  async getBranches(owner: string, repo: string): Promise<Branch[]> {
    return await this.octokit
      .request('GET /repos/{owner}/{repo}/branches', {
        owner,
        repo,
        'X-GitHub-Api-Version': this.X_GITHUB_API_VERSION,
      })
      .then(response => response.data);
  }
}

const github = new GitHubService(import.meta.env['VITE_GITHUB_PERSONAL_ACCESS_TOKEN'] as string);

export default github;
