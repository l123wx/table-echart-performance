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
    key: `chart`,
    dataKey: `chart`,
    title: `chart`,
    width: 150,
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
      isSvgLoading: true,
      svg: ''
    }
  }
)

const data = ref(generateData())

const { generate } = useChartWorker()

const createOptions = (data: number[]): echarts.EChartsOption => {
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
    series: [
      {
        data,
        type: 'line',
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

    data.value[index].isSvgLoading = true
    data.value[index].svg = await generate(createOptions([...data.value[index].data]), index.toString())
    data.value[index].isSvgLoading = false
  })

  visibleRowsIndex = newRowsIndex
}
</script>

<template>
  <el-table-v2
    :columns="columns"
    :data="data"
    :width="700"
    :height="600"
    :row-height="100"
    @rows-rendered="handleRowsRendered"
  >
    <template #cell="{ rowData, column }">
      <template v-if="column.key === 'chart'">
        <div v-loading="rowData['isSvgLoading']" v-html="rowData['svg']"></div>
      </template>
      <template v-else>
        {{ rowData[column.key] }}
      </template>
    </template>
  </el-table-v2>
</template>
