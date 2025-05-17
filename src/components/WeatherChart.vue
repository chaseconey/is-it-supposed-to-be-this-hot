<script setup>
import { ref, onMounted, watch } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
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

const chartOption = ref({
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

function updateChartData() {
  if (!props.weatherData) {
    return;
  }

  const { timeLabels, currentTemps, lastYearTemps, fiveYearsTemps } =
    props.weatherData;

  chartOption.value.xAxis.data = timeLabels;

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
    chartOption.value.yAxis.min = Math.floor(minTemp - padding);
    chartOption.value.yAxis.max = Math.ceil(maxTemp + padding);
    chartOption.value.yAxis.scale = true;
  }

  chartOption.value.series = [
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
    <div style="width: 100%; height: 600px; border: 1px solid #eee">
      <v-chart class="w-full h-full" :option="chartOption" autoresize />
    </div>
  </div>
</template>
