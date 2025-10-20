/**
 * 前端监控 SDK 测试脚本
 * 用于验证 SDK 的核心功能
 */

// 测试工具函数
function testUtils() {
    console.log('=== 测试工具函数 ===');
    
    // 测试时间戳生成
    const timestamp = Date.now();
    console.log('时间戳:', timestamp);
    
    // 测试唯一ID生成
    const id1 = 'monitor_' + Math.random().toString(36).substr(2, 9) + '_' + timestamp;
    const id2 = 'monitor_' + Math.random().toString(36).substr(2, 9) + '_' + timestamp;
    console.log('唯一ID1:', id1);
    console.log('唯一ID2:', id2);
    console.log('ID是否唯一:', id1 !== id2);
    
    // 测试采样函数
    let trueCount = 0;
    for (let i = 0; i < 100; i++) {
        if (Math.random() < 0.5) trueCount++;
    }
    console.log('采样测试 (100次, 0.5概率):', trueCount, '次为true');
    
    console.log('=== 工具函数测试完成 ===\n');
}

// 测试错误类型检测
function testErrorTypes() {
    console.log('=== 测试错误类型检测 ===');
    
    const errors = [
        new Error('普通错误'),
        new TypeError('类型错误'),
        new SyntaxError('语法错误'),
        new ReferenceError('引用错误'),
        new RangeError('范围错误'),
        new URIError('URI错误'),
        new EvalError('Eval错误')
    ];
    
    errors.forEach(error => {
        console.log(`错误类型: ${error.constructor.name}, 消息: ${error.message}`);
    });
    
    console.log('=== 错误类型测试完成 ===\n');
}

// 测试性能API可用性
function testPerformanceAPI() {
    console.log('=== 测试性能API可用性 ===');
    
    console.log('performance.timing 支持:', !!window.performance?.timing);
    console.log('performance.navigation 支持:', !!window.performance?.navigation);
    console.log('performance.getEntriesByType 支持:', !!window.performance?.getEntriesByType);
    console.log('PerformanceObserver 支持:', !!window.PerformanceObserver);
    
    if (window.performance?.timing) {
        const timing = window.performance.timing;
        console.log('页面加载时间:', timing.loadEventEnd - timing.navigationStart, 'ms');
    }
    
    console.log('=== 性能API测试完成 ===\n');
}

// 测试浏览器兼容性
function testBrowserCompatibility() {
    console.log('=== 测试浏览器兼容性 ===');
    
    console.log('navigator.sendBeacon 支持:', !!navigator.sendBeacon);
    console.log('XMLHttpRequest 支持:', !!window.XMLHttpRequest);
    console.log('fetch 支持:', !!window.fetch);
    console.log('Promise 支持:', !!window.Promise);
    console.log('addEventListener 支持:', !!window.addEventListener);
    
    console.log('=== 浏览器兼容性测试完成 ===\n');
}

// 测试数据序列化
function testDataSerialization() {
    console.log('=== 测试数据序列化 ===');
    
    const testData = {
        string: '普通字符串',
        number: 123.45,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'value' },
        null: null,
        undefined: undefined,
        date: new Date(),
        error: new Error('测试错误')
    };
    
    try {
        const jsonString = JSON.stringify(testData);
        console.log('JSON序列化成功:', jsonString.length, '字符');
        
        const parsedData = JSON.parse(jsonString);
        console.log('JSON解析成功');
        
    } catch (error) {
        console.log('JSON序列化失败:', error.message);
    }
    
    console.log('=== 数据序列化测试完成 ===\n');
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始前端监控 SDK 测试\n');
    
    testUtils();
    testErrorTypes();
    testPerformanceAPI();
    testBrowserCompatibility();
    testDataSerialization();
    
    console.log('✅ 所有测试完成');
    console.log('📊 请在浏览器中打开 example.html 进行完整功能测试');
}

// 页面加载完成后运行测试
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        // 延迟执行，确保页面完全加载
        setTimeout(runAllTests, 100);
    });
}

// 导出测试函数（用于Node.js环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testUtils,
        testErrorTypes,
        testPerformanceAPI,
        testBrowserCompatibility,
        testDataSerialization,
        runAllTests
    };
}