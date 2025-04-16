<!--
 * @Author: buaabuaazk 2447230029@qq.com
 * @Date: 2025-03-02 16:15:15
 * @LastEditors: buaabuaazk 2447230029@qq.com
 * @LastEditTime: 2025-04-07 21:19:38
 * @FilePath: \my-vue-electron-app\src\views\HomeView.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div ref="chartRef" style="width: 600px; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as echarts from "echarts";

const chartRef = ref(null);

onMounted(() => {
  const myChart = echarts.init(chartRef.value);
  myChart.setOption({
    title: { text: "折线图示例" },
    xAxis: { data: ["A", "B", "C", "D", "E"] },
    yAxis: {},
    series: [{ type: "line", data: [10, 22, 28, 43, 49] }],
  });
});
</script>
