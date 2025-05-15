import * as echarts from 'echarts';

// 定义消息类型
type CalculatorMessage = {
  type: 'chart';
  data: {
    operation: 'generate';
    options: echarts.EChartsOption;
    id: string;
  };
};

if (typeof global === 'undefined') {
  self.global = self;
}

const chart = echarts.init(null, null, {
  renderer: 'svg', // 必须使用 SVG 模式
  ssr: true, // 开启 SSR
  width: 140, // 需要指明高和宽
  height: 90
});

const taskList: { id: string, options: echarts.EChartsOption }[] = [];
let isGenerating = false;

// 监听主线程发送的消息
self.addEventListener('message', async (event: MessageEvent<CalculatorMessage>) => {
  const { type, data } = event.data;

  if (type === 'chart') {
    try {
      const { operation, options } = data;
      if (operation === 'generate') {
        taskList.push({
          id: data.id,
          options,
        });

        if (!isGenerating) {
          startGenerate();
        }
      } else {
        throw new Error('未知的操作类型');
      }
    } catch (error) {
      self.postMessage({ type: 'error', data: { error, id: data.id } });
    }
  }
});

async function startGenerate() {
  isGenerating = true;

  while (taskList.length > 0) {
    const task = taskList.shift()!;
    const result = await generateChart(task.options);
    self.postMessage({ type: 'result', data: { result, id: task.id } });
  }

  isGenerating = false;
}

function generateChart(options: echarts.EChartsOption) {
  console.log('generateChart', options)
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      chart.setOption(options, true);

      // 输出字符串
      const svgStr = chart.renderToSVGString();
      resolve(svgStr);
    });
  })
}

// 为了 TypeScript 类型检查
export {}; 