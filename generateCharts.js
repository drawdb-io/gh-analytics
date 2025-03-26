import fs from "node:fs";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { parseReportData } from "./utils/parseReportData.js";
import config from "./config.js";

const chartJSNodeCanvas = new ChartJSNodeCanvas(config.chartSettings);

async function generateCharts() {
  let existingData = fs.readFileSync("./reports/drawdb.csv", "utf8");
  let data = parseReportData(existingData);

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
  const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
  const base64Image = dataUrl;

  var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");

  fs.writeFile("out.png", base64Data, "base64", function (err) {
    if (err) {
      console.log(err);
    }
  });
  return dataUrl;
}

generateCharts();
