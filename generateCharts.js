import fs from "node:fs";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { parseReportData } from "./utils/parseReportData.js";
import path from "node:path";
import config from "./config.js";
import { ensureDirectory } from "./utils/ensureDirectory.js";

const chartJSNodeCanvas = new ChartJSNodeCanvas(config.chartSettings);

async function generateCharts() {
  let existingData = fs.readFileSync("./reports/drawdb.csv", "utf8");
  let { data } = parseReportData(existingData);

  const configuration = {
    type: "bar",
    data: {
      labels: data.map((x) => new Date(x[1]).toLocaleDateString()),
      datasets: [
        {
          label: "drawdb stars gained",
          data: data.map((x) => x[4]),
        },
      ],
    },
  };

  ensureDirectory(config.chartOutputDir);

  try {
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl.replace(/^data:image\/png;base64,/, "");

    const pathname = path.resolve(config.chartOutputDir, "drawdb-stars.png");

    fs.writeFileSync(pathname, base64Image, "base64");
  } catch (e) {
    console.error(e);
  }
}

generateCharts();
