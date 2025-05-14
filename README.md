# Table 中大量 Echart 图表的优化探索

Echart 服务端 svg 渲染 + Web Worker + Table 虚拟滚动

| 渲染方案                 | 加载体积 | 功能及交互损失                                               | 相对开发工作量 | 推荐场景                                                     |
| :----------------------- | :------- | :----------------------------------------------------------- | :------------- | :----------------------------------------------------------- |
| 客户端渲染               | 最大     | 无                                                           | 最小           | 首屏加载时间不敏感，对功能交互完整性要求高                   |
| 一次性服务端 SVG 渲染    | 小       | 大：无法动态改变数据、不支持图例切换系列是否显示、不支持提示框等实时性要求高的交互 | 中             | 首屏加载时间敏感，对功能交互完整性要求低                     |

注意：在 Worker 中使用 Echart SSR 时，需要模拟 global 变量。因为 Worker 的全局对象是 self，而 Echart SSR 使用到了 node 环境的 global 变量：

```
if (typeof global === 'undefined') {
  (self as any).global = self;
}
```

> https://echarts.apache.org/handbook/zh/how-to/cross-platform/server/#%E6%9C%8D%E5%8A%A1%E7%AB%AF-svg-%E6%B8%B2%E6%9F%93