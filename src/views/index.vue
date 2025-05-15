<script setup lang="ts">
import type { ElTableV2 } from 'element-plus'
import useChartWorker from '@/hooks/useChartWorker'
import { ref } from 'vue'

const columns: InstanceType<typeof ElTableV2>['$props']['columns'] = [
  {
    key: `name`,
    dataKey: `name`,
    title: `名称`,
    width: 150,
  },
  {
    key: `age`,
    dataKey: `age`,
    title: `年龄`,
    width: 150,
  },
  {
    key: `data`,
    dataKey: `data`,
    title: `rawData`,
    width: 150
  },
  {
    key: `lineChart`,
    dataKey: `lineChart`,
    title: `lineChart`,
    align: 'center',
    width: 200,
    height: 100,
  },
  {
    key: `pieChart`,
    dataKey: `pieChart`,
    title: `pieChart`,
    align: 'center',
    width: 200,
    height: 100,
  }
]

const generateData = (
  length = 200,
) =>
  Array.from({ length }).map((_, rowIndex) => {
    return {
      name: `name-${rowIndex}`,
      age: `age-${rowIndex}`,
      data: Math.random().toString(10).substring(2, 9).split('').map(Number),
      isLineChartLoading: true,
      lineChart: '',
      isPieChartLoading: true,
      pieChart: ''
    }
  }
)

const data = ref(generateData(1000))

const { generate } = useChartWorker()

const createLineOptions = (data: number[]): echarts.EChartsOption => {
  return {
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value',
      max: 10,
      min: 0,
    },
    grid: {
      top: 5,
      bottom: 0,
      left: 0,
      right: 10,
      containLabel: true
    },
    animation: false,
    series: [
      {
        data,
        type: 'line',
      }
    ]
  }
}

const createPieOptions = (data: number[]): echarts.EChartsOption => {
  return {
    grid: {
      top: 5,
      bottom: 0,
      left: 0,
      right: 10,
      containLabel: true
    },
    animation: false,
    legend: {
      show: false
    },
    series: [
      {
        data,
        type: 'pie',
        label: {
          show: false
        }
      }
    ]
  }
}

let visibleRowsIndex: number[] = []
const handleRowsRendered = ({ rowVisibleEnd, rowVisibleStart }: { rowVisibleEnd: number, rowVisibleStart: number }) => {
  const newRowsIndex = Array.from({ length: rowVisibleEnd - rowVisibleStart + 1 }, (_, index) => rowVisibleStart + index)

  newRowsIndex.forEach(async (index) => {
    if (visibleRowsIndex.includes(index)) {
      return
    }

    data.value[index].isLineChartLoading = true
    data.value[index].lineChart = await generate(createLineOptions([...data.value[index].data]), `line-${index}`).finally(() => {
      data.value[index].isLineChartLoading = false
    })

    data.value[index].isPieChartLoading = true
    data.value[index].pieChart = await generate(createPieOptions([...data.value[index].data]), `pie-${index}`).finally(() => {
      data.value[index].isPieChartLoading = false
    })
  })

  visibleRowsIndex = newRowsIndex
}
</script>

<template>
  <el-table-v2
    :columns="columns"
    :data="data"
    :width="1000"
    :height="600"
    :row-height="100"
    @rows-rendered="handleRowsRendered"
  >
    <template #cell="{ rowData, column }">
      <template v-if="column.key === 'lineChart'">
        <div v-loading="rowData['isLineChartLoading']" v-html="rowData['lineChart']"></div>
      </template>
      <template v-else-if="column.key === 'pieChart'">
        <div v-loading="rowData['isPieChartLoading']" v-html="rowData['pieChart']"></div>
      </template>
      <template v-else>
        {{ rowData[column.key] }}
      </template>
    </template>
  </el-table-v2>
</template>
