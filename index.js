import { Octokit } from "octokit";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

const config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
};

const ghconfig = {
  organization: "drawdb-io",
  outputDir: "reports",
};

const YEAR = 5;

function ensureOutputDir() {
  const dirPath = path.resolve(ghconfig.outputDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseReport(data) {
  return data
    .split("\n")
    .map((x) => x.split(","))
    .slice(1);
}

function saveToCsv(repoData) {
  const header = ["repo_name", "date", "stars", "forks"];
  const rowData = [
    repoData.name,
    new Date().toISOString(),
    repoData.stars,
    repoData.forks,
  ];
  const pathname = path.resolve(ghconfig.outputDir, `${repoData.name}.csv`);

  try {
    let existingData = "";

    if (fs.existsSync(pathname)) {
      existingData = fs.readFileSync(pathname, "utf8");
    }

    const rows = parseReport(existingData);

    if (rows.length < YEAR) {
      if (existingData.trim() === "") {
        fs.appendFileSync(pathname, header.join(","));
      }

      fs.appendFileSync(pathname, "\n" + rowData.join(","));
      return;
    }

    const newRows = [...rows.slice(1), rowData];
    fs.writeFileSync(
      pathname,
      header.join(",") + "\n" + newRows.map((x) => x.join(",")).join("\n")
    );
  } catch (err) {
    fs.writeFileSync(
      pathname,
      header.join(",") + "\n" + rowData.join(",")
    );
  }
}

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

    ensureOutputDir();

    res.data
      .filter((repo) => !repo.private)
      .forEach((repo) => {
        const repoProj = {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          full_name: repo.full_name,
          name: repo.name,
          date: new Date().toISOString(),
        };

        saveToCsv(repoProj);
      });
  } catch (error) {
    console.error("Error fetching repositories:", error);
  }
}

await getOrganizationRepos();
