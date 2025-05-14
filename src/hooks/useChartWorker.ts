const useChart = () => {
    const worker = new Worker(new URL('../workers/chart.worker.ts', import.meta.url), { type: 'module' })
    const tasks = new Map<string, { resolve: (data: any) => void, reject: (error: any) => void }>();

    const generate = (options: echarts.EChartsOption, id?: string) => {
        const _id = id || Math.random().toString(36).substring(2, 15);

        // 发送计算请求到 Worker
        worker?.postMessage({
            type: 'chart',
            data: {
                operation: 'generate',
                options,
                id: _id,
            }
        });

        return new Promise<string>((resolve, reject) => {
            tasks.set(_id, { resolve, reject });
        })
    };

    worker.addEventListener('message', (event) => {
        const { type, data } = event.data;
        if (type === 'result') {
            const resolve = tasks.get(data.id)?.resolve;
            resolve && resolve(data.result);
        } else if (type === 'error') {
            const reject = tasks.get(data.id)?.reject;
            reject && reject(data.error);
        }

        tasks.delete(data.id);
    });

    // 监听 Worker 错误
    worker.addEventListener('error', (event) => {
        console.log(`计算错误: ${event.message}`)
    });

    return {
        generate
    }
}

export default useChart