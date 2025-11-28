import { Store } from "@tanstack/react-store";
// 引入我们定义的 RPH 类型
import type { RPH } from "../type"; 

/**
 * RPH Global State 结构
 */
export interface RPHState {
  /** 存储所有 RPH 历史记录 */
  items: RPH[]; 
  /** 标识是否正在进行 API 调用 (例如：加载历史记录、生成RPH) */
  isLoading: boolean;
  /** 存储可能发生的错误信息 */
  error?: string;
}

/**
 * 初始化 RPH 状态 Store
 */
export const rphStore = new Store<RPHState>({
  items: [],
  isLoading: false,
  error: undefined,
});

// --- Helper Functions to Update State ---

/**
 * 设置全局加载状态
 * @param isLoading - 是否正在加载
 */
export const setRphLoading = (isLoading: boolean) => {
  rphStore.setState((prev) => ({ ...prev, isLoading }));
};

/**
 * 替换历史记录列表，并重置加载和错误状态
 * @param items - 完整的 RPH 列表
 */
export const setRphItems = (items: RPH[]) => {
  rphStore.setState({
    items,
    isLoading: false,
    error: undefined,
  });
};

/**
 * 仅添加/更新单个 RPH 文档 (例如：生成新RPH 或编辑RPH后)
 * @param item - 要添加或更新的 RPH 文档
 */
export const upsertRphItem = (item: RPH) => {
  rphStore.setState((prev) => {
    // 检查是否存在相同的 _id
    const index = prev.items.findIndex(i => i._id === item._id);

    if (index !== -1) {
      // 如果存在，则更新该项
      const newItems = [...prev.items];
      newItems[index] = item;
      return { ...prev, items: newItems };
    } else {
      // 如果不存在，则添加到列表顶部 (保持最新优先)
      return { ...prev, items: [item, ...prev.items] };
    }
  });
};

/**
 * 从列表中删除一个 RPH 文档
 * @param id - 要删除的文档 ID
 */
export const removeRphItem = (id: string) => {
    rphStore.setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item._id !== id),
    }));
};

/**
 * 设置全局错误信息，并重置加载状态
 * @param error - 错误信息字符串
 */
export const setRphError = (error?: string) => {
  rphStore.setState((prev) => ({
    ...prev,
    isLoading: false,
    error,
  }));
};