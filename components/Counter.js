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

    return () => h('div', null, [
      h('text', null, `当前计数: ${count.value}  `),
      h('text', null, '(按回车键增加)')
    ]);
  }
};
