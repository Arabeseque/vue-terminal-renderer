// index.js
import { createApp } from './custom-renderer.js';
import Counter from './components/Counter.js';

console.clear();
console.log('终端渲染器启动...');
console.log('按回车键增加计数');
console.log('按 q 退出\n');

// 定义根容器（保存挂载后的子节点）
const root = {
  type: 'root',
  children: []
};

// 创建应用实例并挂载到根容器上
// 注意：在我们的自定义渲染器中，mount 可能不会返回组件实例
createApp(Counter).mount(root);

// 设置终端输入处理
const stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', (key) => {
  // 处理回车键时，从全局变量获取组件暴露的 increment 方法
  if (key === '\r' || key === '\n') {
    const counterInstance = globalThis.__counterInstance;
    if (counterInstance && typeof counterInstance.increment === 'function') {
      counterInstance.increment();
    }
  }
  // Ctrl+C 或 q 退出程序
  else if (key === '' || key.toLowerCase() === 'q') {
    handleExit();
  }
});

function handleExit() {
  stdin.setRawMode(false);
  stdin.pause();
  console.log('\n感谢使用！');
  process.exit(0);
}

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

// 防止程序立即退出
setInterval(() => {}, 1000);
