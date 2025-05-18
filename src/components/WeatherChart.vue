<script setup>
import { ref, onMounted, watch } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
} from "echarts/components";
import VChart from "vue-echarts";

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
]);

const props = defineProps({
  weatherData: {
    type: Object,
    required: true,
  },
});

const tempChartOption = ref({
  title: {
    text: "Temperature Patterns Comparison",
    left: "center",
  },
  tooltip: {
    trigger: "axis",
    formatter: function (params) {
      const date = params[0].axisValue;
      let result = `<div class="font-bold">${date}</div>`;

      params.forEach((param) => {
        result += `<div style="display: flex; justify-content: space-between; margin: 3px 0;">
          <span style="margin-right: 15px; display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%;"></span>
          <span style="flex: 1;">${param.seriesName}:</span>
          <span style="font-weight: bold; margin-left: 5px;">${param.value}°F</span>
        </div>`;
      });

      return result;
    },
  },
  legend: {
    data: [
      "Current Temperatures",
      "Last Year Temperatures",
      "5 Years Ago Temperatures",
    ],
    type: "scroll",
    orient: "horizontal",
    bottom: 0,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "15%",
    top: "15%",
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: { title: "Save as Image" },
    },
  },
  dataZoom: [
    {
      type: "slider",
      show: true,
      start: 0,
      end: 100,
    },
  ],
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: [],
    axisLabel: {
      formatter: (value) => {
        return value;
      },
    },
  },
  yAxis: {
    type: "value",
    name: "Temperature (°F)",
    axisLabel: {
      formatter: "{value}°F",
    },
  },
  series: [],
});

const rainfallChartOption = ref({
  title: {
    text: "Daily Rainfall Comparison",
    left: "center",
  },
  tooltip: {
    trigger: "axis",
    formatter: function (params) {
      const date = params[0].axisValue;
      let result = `<div class="font-bold">${date}</div>`;

      params.forEach((param) => {
        result += `<div style="display: flex; justify-content: space-between; margin: 3px 0;">
          <span style="margin-right: 15px; display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%;"></span>
          <span style="flex: 1;">${param.seriesName}:</span>
          <span style="font-weight: bold; margin-left: 5px;">${param.value} in</span>
        </div>`;
      });

      return result;
    },
  },
  legend: {
    data: ["Current Rainfall", "Last Year Rainfall", "5 Years Ago Rainfall"],
    type: "scroll",
    orient: "horizontal",
    bottom: 0,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "15%",
    top: "15%",
    containLabel: true,
  },
  toolbox: {
    feature: {
      saveAsImage: { title: "Save as Image" },
    },
  },
  dataZoom: [
    {
      type: "slider",
      show: true,
      start: 0,
      end: 100,
    },
  ],
  xAxis: {
    type: "category",
    data: [],
    axisLabel: {
      formatter: (value) => {
        return value;
      },
    },
  },
  yAxis: {
    type: "value",
    name: "Rainfall (inches)",
    axisLabel: {
      formatter: "{value} in",
    },
  },
  series: [],
});

function updateTempChartData() {
  if (!props.weatherData) {
    return;
  }

  const { timeLabels, currentTemps, lastYearTemps, fiveYearsTemps } =
    props.weatherData;

  tempChartOption.value.xAxis.data = timeLabels;

  // Calculate the min and max values for the y-axis with padding
  const allTemps = [
    ...currentTemps,
    ...lastYearTemps,
    ...fiveYearsTemps,
  ].filter((temp) => temp !== null && temp !== undefined);
  if (allTemps.length > 0) {
    const minTemp = Math.min(...allTemps);
    const maxTemp = Math.max(...allTemps);
    const range = maxTemp - minTemp;

    // Add 10% padding on top and bottom
    const padding = range * 0.1;
    tempChartOption.value.yAxis.min = Math.floor(minTemp - padding);
    tempChartOption.value.yAxis.max = Math.ceil(maxTemp + padding);
    tempChartOption.value.yAxis.scale = true;
  }

  tempChartOption.value.series = [
    {
      name: "Current Temperatures",
      type: "line",
      data: currentTemps,
      lineStyle: { width: 3 },
      itemStyle: { color: "#FF6B6B" },
    },
    {
      name: "Last Year Temperatures",
      type: "line",
      data: lastYearTemps,
      lineStyle: { width: 2, type: "dashed" },
      itemStyle: { color: "#1A535C" },
    },
    {
      name: "5 Years Ago Temperatures",
      type: "line",
      data: fiveYearsTemps,
      lineStyle: { width: 2, type: "dotted" },
      itemStyle: { color: "#4ECDC4" },
    },
  ];
}

function updateRainfallChartData() {
  if (!props.weatherData) {
    return;
  }

  const { dailyLabels, currentRainfall, lastYearRainfall, fiveYearsRainfall } =
    props.weatherData;

  rainfallChartOption.value.xAxis.data = dailyLabels;

  // Calculate the max value for the y-axis with padding
  const allRainfall = [
    ...currentRainfall,
    ...lastYearRainfall,
    ...fiveYearsRainfall,
  ].filter((rain) => rain !== null && rain !== undefined);

  if (allRainfall.length > 0) {
    const maxRain = Math.max(...allRainfall);
    // Add 10% padding on top
    const padding = maxRain * 0.1;
    rainfallChartOption.value.yAxis.max = Math.ceil(maxRain + padding);
  }

  rainfallChartOption.value.series = [
    {
      name: "Current Rainfall",
      type: "bar",
      data: currentRainfall,
      itemStyle: { color: "#4361EE" },
    },
    {
      name: "Last Year Rainfall",
      type: "bar",
      data: lastYearRainfall,
      itemStyle: { color: "#3A0CA3" },
    },
    {
      name: "5 Years Ago Rainfall",
      type: "bar",
      data: fiveYearsRainfall,
      itemStyle: { color: "#7209B7" },
    },
  ];
}

function updateChartData() {
  updateTempChartData();
  updateRainfallChartData();
}

onMounted(() => {
  updateChartData();
});

watch(
  () => props.weatherData,
  () => {
    updateChartData();
  },
  { deep: true }
);
</script>

<template>
  <div class="border border-gray-300 rounded-lg p-4 my-4 bg-white">
    <p class="mb-4 font-medium">
      Chart for zip code: {{ weatherData.zipCode }}
    </p>

    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-2">Temperature Comparison</h3>
      <div style="width: 100%; height: 400px; border: 1px solid #eee">
        <v-chart class="w-full h-full" :option="tempChartOption" autoresize />
      </div>
    </div>

    <div>
      <h3 class="text-lg font-semibold mb-2">Rainfall Comparison</h3>
      <div style="width: 100%; height: 400px; border: 1px solid #eee">
        <v-chart
          class="w-full h-full"
          :option="rainfallChartOption"
          autoresize
        />
      </div>
    </div>
  </div>
</template>
