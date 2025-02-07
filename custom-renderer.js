// custom-renderer.js
import { createRenderer } from '@vue/runtime-core';

/**
 * TerminalRenderer 用于调度终端输出更新
 */
class TerminalRenderer {
  constructor() {
    this.isRenderScheduled = false;
    this.lastOutput = '';
  }

  scheduleRender(rootNode) {
    if (!this.isRenderScheduled) {
      this.isRenderScheduled = true;
      process.nextTick(() => this.render(rootNode));
    }
  }

  render(rootNode) {
    if (!rootNode) return;

    // 收集整个虚拟DOM树的输出内容
    const output = this.collectOutput(rootNode);
    if (this.lastOutput !== output) {
      // 清除当前行(简单的终端刷新方案)
      process.stdout.write('\r[K');
      process.stdout.write(output);
      this.lastOutput = output;
    }
    this.isRenderScheduled = false;
  }

  // 递归拼接虚拟节点的输出文本
  collectOutput(node) {
    let result = '';

    // 根据节点类型构建文本
    if (node.type === 'text') {
      result += String(node.text || '');
    } else if (node.type === 'comment') {
      // 如果是注释节点，可选择不输出或输出特定格式
      // result += `<!-- ${node.text} -->`;
    } else if (typeof node.type === 'string') {
      // 对于元素节点，遍历子节点
      if (node.children && node.children.length > 0) {
        result += node.children.map(child => this.collectOutput(child)).join('');
      }
    } else if (node.type === 'root') {
      // 根节点直接拼接子节点
      if (node.children && node.children.length > 0) {
        result += node.children.map(child => this.collectOutput(child)).join('');
      }
    }

    return result;
  }
}

// 创建一个终端渲染器实例
const terminalRenderer = new TerminalRenderer();

/**
 * 辅助函数：获取虚拟DOM树的根节点
 */
function getRootNode(node) {
  let current = node;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}

/**
 * 定义在终端环境下的节点操作 (nodeOps)
 */
const nodeOps = {
  createElement(type) {
    return {
      type,          // 节点类型，字符串，例："div"
      children: [],
      parent: null,
      props: {},
      handlers: {}
    };
  },

  createText(text) {
    return {
      type: 'text',
      text: String(text),
      parent: null
    };
  },

  // 创建注释节点（可选）
  createComment(text) {
    return {
      type: 'comment',
      text: String(text),
      parent: null
    };
  },

  setText(node, text) {
    node.text = String(text);
    if (node.parent) {
      terminalRenderer.scheduleRender(getRootNode(node));
    }
  },

  setElementText(node, text) {
    node.children = [{
      type: 'text',
      text: String(text),
      parent: node
    }];
    terminalRenderer.scheduleRender(getRootNode(node));
  },

  insert(child, parent, anchor = null) {
    child.parent = parent;
    if (anchor === null) {
      parent.children.push(child);
    } else {
      const index = parent.children.indexOf(anchor);
      parent.children.splice(index, 0, child);
    }
    terminalRenderer.scheduleRender(getRootNode(parent));
  },

  remove(child) {
    const parent = child.parent;
    if (parent) {
      const index = parent.children.indexOf(child);
      if (index > -1) {
        parent.children.splice(index, 1);
        child.parent = null;
        terminalRenderer.scheduleRender(getRootNode(parent));
      }
    }
  },

  patchProp(el, key, prevValue, nextValue) {
    // 针对事件处理，比如 onClick 转换为 handlers.click
    if (key.startsWith('on')) {
      const eventName = key.slice(2).toLowerCase();
      if (typeof nextValue === 'function') {
        el.handlers[eventName] = nextValue;
      } else {
        delete el.handlers[eventName];
      }
    } else {
      el.props[key] = nextValue;
    }
    if (el.parent) {
      terminalRenderer.scheduleRender(getRootNode(el));
    }
  },

  parentNode(node) {
    return node.parent;
  },

  nextSibling(node) {
    if (!node.parent) return null;
    const index = node.parent.children.indexOf(node);
    return (index > -1) ? (node.parent.children[index + 1] || null) : null;
  }
};

// 使用上面定义的 nodeOps 创建 Vue 渲染器实例
const vueRenderer = createRenderer(nodeOps);

export const createApp = vueRenderer.createApp.bind(vueRenderer);
