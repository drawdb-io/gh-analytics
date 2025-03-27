import fs from "node:fs";
import path from "node:path";
import config from "./config.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { parseReportData } from "./utils/parseReportData.js";
import { ensureDirectory } from "./utils/ensureDirectory.js";

const chartJSNodeCanvas = new ChartJSNodeCanvas(config.chartSettings);

async function generateChartImage(data, type, yAxis, title) {
  const configuration = {
    type,
    data: {
      labels: data.map((x) => new Date(x[1]).toLocaleDateString()),
      datasets: [
        {
          label: title,
          data: data.map((x) => x[yAxis]),
        },
      ],
    },
  };

  try {
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl.replace(/^data:image\/png;base64,/, "");

    const pathname = path.resolve(config.chartOutputDir, `${title}.png`);

    fs.writeFileSync(pathname, base64Image, "base64");
  } catch (e) {
    console.error(e);
  }
}

async function generateCharts(dataString) {
  let { data } = parseReportData(dataString);

  await generateChartImage(data, "line", 2, `${data[0][0]}-stars`);
  await generateChartImage(data, "bar", 4, `${data[0][0]}-stars-gained`);
  await generateChartImage(data, "line", 3, `${data[0][0]}-forks`);
  await generateChartImage(data, "bar", 5, `${data[0][0]}-forks-gained`);
}

function makeCharts() {
  ensureDirectory(config.chartOutputDir);
  fs.readdir(config.reportOutputDir, (e, files) => {
    if (e) {
      console.log("Unable to scan directory:", e);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(config.reportOutputDir, file);

      fs.readFile(filePath, "utf8", async (e, data) => {
        if (e) {
          console.log(`Error reading file ${file}:`, e);
          return;
        }
        await generateCharts(data);
      });
    });
  });
}

makeCharts();
