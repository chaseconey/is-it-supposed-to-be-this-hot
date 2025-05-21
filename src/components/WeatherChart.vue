<script setup>
import { ref, onMounted, watch, computed } from "vue";
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

// Color constants for consistent color scheme
const CHART_COLORS = {
  CURRENT_YEAR: "#FF5733", // Warm orange-red for current year
  LAST_YEAR: "#FFD700", // Medium yellow for last year
  FIVE_YEARS_AGO: "#4286f4", // Cool blue for 5 years ago
};

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
      "Current Year",
      "Last Year",
      "5 Years Ago",
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
    data: ["Current Year", "Last Year", "5 Years Ago"],
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

// Reactive refs for temperature averages and rainfall totals
const tempAverages = ref({
  current: 0,
  lastYear: 0,
  fiveYearsAgo: 0,
});

const rainfallTotals = ref({
  current: 0,
  lastYear: 0,
  fiveYearsAgo: 0,
});

const tempAverageComputed = computed(() => {
  if (!props.weatherData || !props.weatherData.currentTemps) {
    return tempAverages.value;
  }

  const { currentTemps, lastYearTemps, fiveYearsTemps } = props.weatherData;

  // Filter out any null or undefined values before calculating averages
  const validCurrentTemps = currentTemps.filter(
    (t) => t !== null && t !== undefined
  );
  const validLastYearTemps = lastYearTemps.filter(
    (t) => t !== null && t !== undefined
  );
  const validFiveYearsTemps = fiveYearsTemps.filter(
    (t) => t !== null && t !== undefined
  );

  tempAverages.value.current =
    validCurrentTemps.length > 0
      ? validCurrentTemps.reduce((a, b) => a + b, 0) / validCurrentTemps.length
      : 0;
  tempAverages.value.lastYear =
    validLastYearTemps.length > 0
      ? validLastYearTemps.reduce((a, b) => a + b, 0) /
        validLastYearTemps.length
      : 0;
  tempAverages.value.fiveYearsAgo =
    validFiveYearsTemps.length > 0
      ? validFiveYearsTemps.reduce((a, b) => a + b, 0) /
        validFiveYearsTemps.length
      : 0;

  return tempAverages.value;
});

const rainfallTotalComputed = computed(() => {
  if (!props.weatherData || !props.weatherData.currentRainfall) {
    return rainfallTotals.value;
  }

  const { currentRainfall, lastYearRainfall, fiveYearsRainfall } =
    props.weatherData;

  // Filter out any null or undefined values before calculating totals
  const validCurrentRainfall = currentRainfall.filter(
    (r) => r !== null && r !== undefined
  );
  const validLastYearRainfall = lastYearRainfall.filter(
    (r) => r !== null && r !== undefined
  );
  const validFiveYearsRainfall = fiveYearsRainfall.filter(
    (r) => r !== null && r !== undefined
  );

  rainfallTotals.value.current =
    validCurrentRainfall.reduce((a, b) => a + b, 0) || 0;
  rainfallTotals.value.lastYear =
    validLastYearRainfall.reduce((a, b) => a + b, 0) || 0;
  rainfallTotals.value.fiveYearsAgo =
    validFiveYearsRainfall.reduce((a, b) => a + b, 0) || 0;

  return rainfallTotals.value;
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
      name: "Current Year",
      type: "line",
      data: currentTemps,
      lineStyle: { width: 3 },
      itemStyle: { color: CHART_COLORS.CURRENT_YEAR },
    },
    {
      name: "Last Year",
      type: "line",
      data: lastYearTemps,
      lineStyle: { width: 2, type: "dashed" },
      itemStyle: { color: CHART_COLORS.LAST_YEAR },
    },
    {
      name: "5 Years Ago",
      type: "line",
      data: fiveYearsTemps,
      lineStyle: { width: 2, type: "dotted" },
      itemStyle: { color: CHART_COLORS.FIVE_YEARS_AGO },
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
      name: "Current Year",
      type: "bar",
      data: currentRainfall,
      itemStyle: { color: CHART_COLORS.CURRENT_YEAR },
    },
    {
      name: "Last Year",
      type: "bar",
      data: lastYearRainfall,
      itemStyle: { color: CHART_COLORS.LAST_YEAR },
    },
    {
      name: "5 Years Ago",
      type: "bar",
      data: fiveYearsRainfall,
      itemStyle: { color: CHART_COLORS.FIVE_YEARS_AGO },
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
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-2">Temperature Comparison</h3>
      <div style="width: 100%; height: 400px; border: 1px solid #eee">
        <v-chart class="w-full h-full" :option="tempChartOption" autoresize />
      </div>
      <!-- Temperature averages metadata -->
      <div class="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 class="font-semibold text-gray-700 mb-2">Average Temperatures</h4>
        <div class="grid grid-cols-3 gap-4">
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.CURRENT_YEAR}`"
            ></span>
            <span>Current Year: {{ tempAverageComputed.current.toFixed(1) }}°F</span>
          </div>
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.LAST_YEAR}`"
            ></span>
            <span
              >Last Year: {{ tempAverageComputed.lastYear.toFixed(1) }}°F</span
            >
          </div>
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.FIVE_YEARS_AGO}`"
            ></span>
            <span
              >5 Years Ago:
              {{ tempAverageComputed.fiveYearsAgo.toFixed(1) }}°F</span
            >
          </div>
        </div>
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
      <!-- Rainfall totals metadata -->
      <div class="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 class="font-semibold text-gray-700 mb-2">Total Rainfall</h4>
        <div class="grid grid-cols-3 gap-4">
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.CURRENT_YEAR}`"
            ></span>
            <span
              >Current Year: {{ rainfallTotalComputed.current.toFixed(2) }} in</span
            >
          </div>
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.LAST_YEAR}`"
            ></span>
            <span
              >Last Year:
              {{ rainfallTotalComputed.lastYear.toFixed(2) }} in</span
            >
          </div>
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.FIVE_YEARS_AGO}`"
            ></span>
            <span
              >5 Years Ago:
              {{ rainfallTotalComputed.fiveYearsAgo.toFixed(2) }} in</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
