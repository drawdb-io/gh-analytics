import { Octokit } from "octokit";
import fs from "node:fs";
import path from "node:path";
import { parseReportData } from "./utils/parseReportData.js";
import config from "./config.js";
import "dotenv/config";

function ensurereportOutputDir() {
  const dirPath = path.resolve(config.reportOutputDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveToCsv(repoData) {
  const header = [
    "repo_name",
    "date",
    "stars",
    "forks",
    "stars_gained",
    "forks_gained",
  ];
  let rowData = [
    repoData.name,
    new Date().toISOString(),
    repoData.stars,
    repoData.forks,
  ];
  const pathname = path.resolve(config.reportOutputDir, `${repoData.name}.csv`);

  try {
    let existingData = "";

    if (fs.existsSync(pathname)) {
      existingData = fs.readFileSync(pathname, "utf8");
    }

    const rows = parseReportData(existingData);

    console.log(rows);

    if (rows.length < 1) {
      rowData = [...rowData, 0, 0];
    } else {
      rowData = [
        ...rowData,
        repoData.stars - rows[rows.length - 1][2],
        repoData.forks - rows[rows.length - 1][3],
      ];
    }

    if (rows.length < config.trackedPeriod) {
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
    fs.writeFileSync(pathname, header.join(",") + "\n" + rowData.join(","));
  }
}

async function getOrganizationRepos() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    const res = await octokit.request(
      `GET /orgs/${config.organization}/repos`,
      {
        org: "ORG",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    ensurereportOutputDir();

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
