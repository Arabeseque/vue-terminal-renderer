// components/Counter.js
import { ref, h } from 'vue';

export default {
  name: 'Counter',
  setup() {
    const count = ref(0);
    
    const increment = () => {
      count.value++;
    };

    // 暴露 increment 方法到全局变量，以便 index.js 能调用
    globalThis.__counterInstance = { increment };
    
    // NOTE: h 是 Vue 3 的 createElement 函数 参数 1 是标签名或组件，参数 2 是 props，参数 3 是子节点
    return () => h('div', null, [
      h('text', null, `当前计数: ${count.value}  `),
      h('text', null, '(按回车键增加)')
    ]);
  }
};
