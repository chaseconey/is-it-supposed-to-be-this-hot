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

// Data aggregation functions for mobile optimization
function aggregateDataToSixHours(timeLabels, ...dataSeries) {
  if (!timeLabels || timeLabels.length === 0) {
    return { timeLabels: [], dataSeries: dataSeries.map(() => []) };
  }

  const aggregatedLabels = [];
  const aggregatedSeries = dataSeries.map(() => []);

  // Group data points into 6-hour intervals (4 points per day)
  for (let i = 0; i < timeLabels.length; i += 6) {
    const groupEndIndex = Math.min(i + 6, timeLabels.length);

    // Create label for this 6-hour period
    const startTime = new Date(
      timeLabels[i].replace(/,.*/, "") + ", " + new Date().getFullYear()
    );
    const hour = new Date(timeLabels[i].split(", ")[1]).getHours();

    let timeLabel;
    if (hour < 6) timeLabel = "Early Morning";
    else if (hour < 12) timeLabel = "Morning";
    else if (hour < 18) timeLabel = "Afternoon";
    else timeLabel = "Evening";

    const dateLabel = startTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    aggregatedLabels.push(`${dateLabel}, ${timeLabel}`);

    // Aggregate each data series
    dataSeries.forEach((series, seriesIndex) => {
      const slice = series.slice(i, groupEndIndex);
      const validValues = slice.filter(
        (val) => val !== null && val !== undefined
      );

      if (validValues.length > 0) {
        // For temperature: use average
        // For rainfall: use sum (will be handled separately)
        const aggregatedValue =
          validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        aggregatedSeries[seriesIndex].push(
          Math.round(aggregatedValue * 100) / 100
        );
      } else {
        aggregatedSeries[seriesIndex].push(null);
      }
    });
  }

  return {
    timeLabels: aggregatedLabels,
    dataSeries: aggregatedSeries,
  };
}

function aggregateRainfallToSixHours(dailyLabels, ...dataSeries) {
  // For daily rainfall data, we don't need 6-hour aggregation since it's already daily
  // But we can reduce frequency for mobile by showing every other day or every few days
  if (!props.isMobile) {
    return { dailyLabels, dataSeries };
  }

  const aggregatedLabels = [];
  const aggregatedSeries = dataSeries.map(() => []);

  // Show every 2nd day on mobile to reduce clutter
  for (let i = 0; i < dailyLabels.length; i += 2) {
    aggregatedLabels.push(dailyLabels[i]);
    dataSeries.forEach((series, seriesIndex) => {
      aggregatedSeries[seriesIndex].push(series[i]);
    });
  }

  return {
    dailyLabels: aggregatedLabels,
    dataSeries: aggregatedSeries,
  };
}

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
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const tempChartOption = ref({
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

  let { timeLabels, currentTemps, lastYearTemps, fiveYearsTemps } =
    props.weatherData;

  // Aggregate data for mobile display
  if (props.isMobile) {
    const aggregated = aggregateDataToSixHours(
      timeLabels,
      currentTemps,
      lastYearTemps,
      fiveYearsTemps
    );
    timeLabels = aggregated.timeLabels;
    [currentTemps, lastYearTemps, fiveYearsTemps] = aggregated.dataSeries;
  }

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

  let { dailyLabels, currentRainfall, lastYearRainfall, fiveYearsRainfall } =
    props.weatherData;

  // Aggregate data for mobile display
  if (props.isMobile) {
    const aggregated = aggregateRainfallToSixHours(
      dailyLabels,
      currentRainfall,
      lastYearRainfall,
      fiveYearsRainfall
    );
    dailyLabels = aggregated.dailyLabels;
    [currentRainfall, lastYearRainfall, fiveYearsRainfall] =
      aggregated.dataSeries;
  }

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

// Watch for mobile prop changes to update chart responsiveness
watch(
  () => props.isMobile,
  () => {
    updateChartOptions();
    updateChartData();
  }
);

// Update chart options based on screen size
function updateChartOptions() {
  const isMobileView = props.isMobile;

  // Update temperature chart options
  tempChartOption.value.grid = {
    left: isMobileView ? "5%" : "3%",
    right: isMobileView ? "5%" : "4%",
    bottom: isMobileView ? "20%" : "15%",
    top: isMobileView ? "20%" : "15%",
    containLabel: true,
  };

  tempChartOption.value.dataZoom[0].start = isMobileView ? 70 : 0; // Show recent data first on mobile

  // Update rainfall chart options
  rainfallChartOption.value.grid = {
    left: isMobileView ? "5%" : "3%",
    right: isMobileView ? "5%" : "4%",
    bottom: isMobileView ? "20%" : "15%",
    top: isMobileView ? "20%" : "15%",
    containLabel: true,
  };

  rainfallChartOption.value.dataZoom[0].start = isMobileView ? 70 : 0;
}

onMounted(() => {
  updateChartOptions();
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
      <div
        :style="`width: 100%; height: ${
          isMobile ? '300px' : '400px'
        }; border: 1px solid #eee`"
      >
        <v-chart class="w-full h-full" :option="tempChartOption" autoresize />
      </div>
      <!-- Temperature averages metadata with responsive layout -->
      <div class="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 class="font-semibold text-gray-700 mb-2">Average Temperatures</h4>
        <div :class="isMobile ? 'space-y-2' : 'grid grid-cols-3 gap-4'">
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.CURRENT_YEAR}`"
            ></span>
            <span
              >Current Year:
              {{ tempAverageComputed.current.toFixed(1) }}°F</span
            >
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
      <div
        :style="`width: 100%; height: ${
          isMobile ? '300px' : '400px'
        }; border: 1px solid #eee`"
      >
        <v-chart
          class="w-full h-full"
          :option="rainfallChartOption"
          autoresize
        />
      </div>
      <!-- Rainfall totals metadata with responsive layout -->
      <div class="mt-4 p-3 bg-gray-50 rounded-md">
        <h4 class="font-semibold text-gray-700 mb-2">Total Rainfall</h4>
        <div :class="isMobile ? 'space-y-2' : 'grid grid-cols-3 gap-4'">
          <div class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              :style="`background-color: ${CHART_COLORS.CURRENT_YEAR}`"
            ></span>
            <span
              >Current Year:
              {{ rainfallTotalComputed.current.toFixed(2) }} in</span
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
