// 数据源适配器基础接口
export interface DataSourceAdapter {
  name: string;
  isAvailable: boolean;
  priority: number; // 优先级，数字越小优先级越高
  
  getMarketSectors(): Promise<any[]>;
  getStockQuotes(codes: string[]): Promise<any[]>;
  getFundFlows(): Promise<any>;
  getMarketNews(): Promise<any[]>;
}

// 抽象基类
export abstract class BaseDataSourceAdapter implements DataSourceAdapter {
  abstract name: string;
  abstract isAvailable: boolean;
  abstract priority: number;
  
  // 超时配置
  protected readonly timeout = 10000;
  
  // 通用请求方法
  protected async fetchData(url: string, options?: RequestInit): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.warn(`[${this.name}] 请求失败:`, error);
      throw error;
    }
  }
  
  abstract getMarketSectors(): Promise<any[]>;
  abstract getStockQuotes(codes: string[]): Promise<any[]>;
  abstract getFundFlows(): Promise<any>;
  abstract getMarketNews(): Promise<any[]>;
}
