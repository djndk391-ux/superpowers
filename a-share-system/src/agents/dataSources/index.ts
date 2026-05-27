import { DataSourceAdapter } from './base';
import { EastMoneyAdapter } from './eastMoney';
import { TonghuashunAdapter } from './tonghuashun';
import { MockDataSourceAdapter } from './mock';

// 数据源管理器
export class DataSourceManager {
  private adapters: DataSourceAdapter[] = [];
  private activeAdapter: DataSourceAdapter | null = null;
  
  constructor() {
    // 注册所有数据源，按优先级排序
    this.registerAdapter(new EastMoneyAdapter());
    this.registerAdapter(new TonghuashunAdapter());
    this.registerAdapter(new MockDataSourceAdapter());
  }
  
  // 注册数据源
  registerAdapter(adapter: DataSourceAdapter): void {
    this.adapters.push(adapter);
    // 保持按优先级排序
    this.adapters.sort((a, b) => a.priority - b.priority);
  }
  
  // 获取可用的数据源（带降级机制）
  async getAvailableAdapter(): Promise<DataSourceAdapter> {
    for (const adapter of this.adapters) {
      if (adapter.isAvailable) {
        try {
          // 简单测试数据源是否可用
          console.log(`[DataSourceManager] 尝试使用 ${adapter.name}...`);
          
          // 可以尝试获取一个简单的数据来测试
          // 这里我们假设如果isAvailable为true，就可用
          this.activeAdapter = adapter;
          return adapter;
        } catch (error) {
          console.warn(`[DataSourceManager] ${adapter.name} 不可用，尝试下一个`);
        }
      }
    }
    
    // 如果都失败了，强制使用模拟数据
    console.warn(`[DataSourceManager] 所有真实数据源不可用，使用模拟数据`);
    const mockAdapter = this.adapters.find(a => a.name === '模拟数据');
    if (!mockAdapter) {
      throw new Error('没有可用的数据源');
    }
    
    this.activeAdapter = mockAdapter;
    return mockAdapter;
  }
  
  // 获取当前活跃的数据源
  getActiveDataSource(): string {
    return this.activeAdapter?.name || '无';
  }
  
  // 获取所有数据源列表
  getAllDataSources(): { name: string; priority: number; isAvailable: boolean }[] {
    return this.adapters.map(a => ({
      name: a.name,
      priority: a.priority,
      isAvailable: a.isAvailable
    }));
  }
  
  // 手动切换数据源
  async switchToAdapter(adapterName: string): Promise<boolean> {
    const adapter = this.adapters.find(a => a.name === adapterName);
    if (!adapter || !adapter.isAvailable) {
      console.warn(`[DataSourceManager] 无法切换到 ${adapterName}`);
      return false;
    }
    
    try {
      this.activeAdapter = adapter;
      console.log(`[DataSourceManager] 已切换到 ${adapterName}`);
      return true;
    } catch (error) {
      console.error(`[DataSourceManager] 切换到 ${adapterName} 失败:`, error);
      return false;
    }
  }
}

// 导出单例
export const dataSourceManager = new DataSourceManager();
