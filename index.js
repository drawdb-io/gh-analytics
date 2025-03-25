import { Octokit } from "octokit";
import "dotenv/config";
import * as csv from "csv";
import fs from "node:fs";

const config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

const ghconfig = {
  organization: "drawdb-io",
  reportFilename: "report",
};

async function getOrganizationRepos() {
  const octokit = new Octokit({
    auth: config.GITHUB_TOKEN,
  });

  try {
    const res = await octokit.request(
      `GET /orgs/${ghconfig.organization}/repos`,
      {
        org: "ORG",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    console.log(
      res.data
        .filter((x) => !x.private)
        .map((repo) => ({
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          name: repo.full_name,
        }))
    );
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
}

try {
  const data = fs.readFileSync(ghconfig.reportFilename + ".csv", "utf8");
  console.log(data);
} catch (err) {
  console.error(err);
}
