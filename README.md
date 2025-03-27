# GitHub Analytics

This repository provides scripts and workflow to record analytics for a given organization on GitHub itself.

It tracks stars and forks for all public repositories in the organization, generates csv reports and charts by updating the data daily.

## How to run

### Clone repo

```sh
git clone https://github.com/drawdb-io/gh-analytics.git
```

### Set up env

Add your GitHub token to `.env` according to `.env.sample`

### Customize config

Customize the config

```js
const config = {
  organization: "drawdb-io", // organization name
  reportOutputDir: "reports", // directory to place the reports in
  chartOutputDir: "charts", // directory to place the charts in
  trackedPeriod: 365, // the number of records to keep
  chartSettings: {
    width: 960, // chart image width
    height: 600, // chart image height
    backgroundColour: "", // chart background color, transparent by default
  },
};
```

### Install dependencies

```sh
npm install
```

### Generate reports

```sh
npm start
```

`npm start` calls `npm generateReports.js` to generate the csv reports and `npm generateCharts.js` that reads the reports and generated charts.

