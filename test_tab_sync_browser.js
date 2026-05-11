/**
 * 浏览器控制台测试脚本
 * 
 * 使用方法：
 * 1. 打开浏览器开发者工具（F12）
 * 2. 切换到 Console 标签
 * 3. 复制粘贴此脚本并回车执行
 */

(async function testTabSync() {
  console.log('='.repeat(60));
  console.log('测试栏目配置同步API');
  console.log('='.repeat(60));
  
  // 获取token（从localStorage）
  function getToken() {
    try {
      const authStorage = JSON.parse(localStorage.getItem('rss-auth-storage'));
      return authStorage?.state?.token || null;
    } catch (e) {
      console.error('获取token失败:', e);
      return null;
    }
  }
  
  const token = getToken();
  if (!token) {
    console.log('❌ 未找到token，请先登录');
    console.log('提示：登录后再从控制台执行此脚本');
    return;
  }
  console.log('✅ 已获取token');
  
  // 测试数据：隐藏"科技"TAB
  const testData = {
    fixed_tabs: [
      { tab_value: "推荐", display_order: 0, is_visible: true },
      { tab_value: "全部", display_order: 1, is_visible: true },
      { tab_value: "经济学人", display_order: 2, is_visible: true },
      { tab_value: "科技", display_order: 3, is_visible: false },  // 隐藏
      { tab_value: "经济", display_order: 4, is_visible: true },
      { tab_value: "教育", display_order: 5, is_visible: true },
      { tab_value: "政治", display_order: 6, is_visible: true },
      { tab_value: "全球", display_order: 7, is_visible: true },
      { tab_value: "生活", display_order: 8, is_visible: true },
    ],
    rss_source_tabs: []
  };
  
  // 请求头（携带token）
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  try {
    // 步骤1：获取当前配置
    console.log('\n【步骤1】获取当前配置...');
    console.log('请求头:', headers);
    const getConfig = await fetch('/api/v1/user/tabs/', {
      headers
    });
    console.log('状态码:', getConfig.status);
    const currentConfig = await getConfig.json();
    console.log('当前配置:', currentConfig);
    
    // 如果返回空数组，检查user_id
    if (currentConfig.fixed_tabs.length === 0 && currentConfig.rss_source_tabs.length === 0) {
      console.log('⚠️  返回空配置，可能是user_id为None');
      console.log('提示：检查后端日志是否有user_id=XXX的输出');
    }
    
    // 步骤2：同步新配置
    console.log('\n【步骤2】同步新配置（隐藏科技TAB）...');
    const syncResponse = await fetch('/api/v1/user/tabs/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify(testData)
    });
    
    console.log('状态码:', syncResponse.status);
    const syncResult = await syncResponse.json();
    console.log('同步结果:', syncResult);
    
    if (syncResponse.status === 200) {
      console.log('✅ 同步成功！');
      console.log('   更新:', syncResult.stats?.updated, '条');
      console.log('   新增:', syncResult.stats?.inserted, '条');
    } else if (syncResponse.status === 401) {
      console.log('❌ 未登录，请先登录');
      return;
    } else {
      console.log('❌ 同步失败:', syncResult);
      return;
    }
    
    // 步骤3：验证配置
    console.log('\n【步骤3】验证配置是否保存...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    
    const verifyResponse = await fetch('/api/v1/user/tabs/', {
      headers
    });
    const verifyConfig = await verifyResponse.json();
    console.log('保存后的配置:', verifyConfig);
    
    // 检查科技TAB
    if (verifyConfig.fixed_tabs) {
      const techTab = verifyConfig.fixed_tabs.find(t => t.tab_value === '科技');
      if (techTab) {
        if (techTab.is_visible === false) {
          console.log('\n✅ 验证成功！科技TAB已正确隐藏');
          console.log('   科技TAB数据:', techTab);
        } else {
          console.log('\n❌ 验证失败！科技TAB仍然可见');
          console.log('   科技TAB数据:', techTab);
        }
      } else {
        console.log('\n⚠️  未找到科技TAB配置');
      }
      
      // 显示所有TAB状态
      console.log('\n所有TAB状态:');
      verifyConfig.fixed_tabs.forEach(tab => {
        const icon = tab.is_visible ? '✅' : '❌';
        console.log(`  ${icon} ${tab.tab_value}: visible=${tab.is_visible}, order=${tab.display_order}`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
})();
