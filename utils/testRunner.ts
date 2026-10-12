
export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export class TestSuite {
  results: TestResult[] = [];

  async assert(name: string, fn: () => boolean | Promise<boolean>) {
    try {
      const passed = await fn();
      this.results.push({ name, passed });
    } catch (e: any) {
      this.results.push({ name, passed: false, error: e.message });
    }
  }

  getReport() {
    const passedCount = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    return {
      results: this.results,
      passedCount,
      total,
      successRate: Math.round((passedCount / total) * 100),
      allPassed: passedCount === total
    };
  }
}
