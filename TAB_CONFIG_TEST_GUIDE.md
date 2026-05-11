# 栏目自定义配置功能 - 测试指南

## ✅ 已完成的功能

### Phase 1-3 全部完成
- ✅ 后端 API（GET/POST）
- ✅ 数据库表 `user_tab_preferences`
- ✅ 前端 Store（useTabConfigStore）
- ✅ 配置面板（TabConfigPanel）
- ✅ 订阅页面"栏目"TAB
- ✅ 首页 TAB 动态联动

---

## 🧪 测试步骤

### 1. 测试配置保存功能

**访问页面**：http://localhost:3008/subscribe

**操作步骤**：
1. 点击最左侧的"栏目"TAB
2. 在"固定栏目"区域：
   - 验证"推荐"和"全部"显示🔒锁定图标，不可取消
   - 点击其他TAB的复选框，切换可见性
   - 点击上下箭头调整顺序
3. 在"RSS源栏目"区域：
   - 勾选最多10个RSS源
   - 验证超过10个时显示橙色警告
   - 点击上下箭头调整RSS源顺序
4. 点击"保存配置"按钮
5. 查看后端日志，应显示：
   ```
   TAB配置同步成功: user_id=27, fixed=9, rss=10
   ```

**预期结果**：
- ✅ 保存成功后显示"保存成功"提示
- ✅ 页面刷新后配置保持不变（localStorage + 后端同步）

---

### 2. 测试首页 TAB 联动

**访问页面**：http://localhost:3008/

**操作步骤**：
1. 刷新首页，等待1-2秒（从后端加载配置）
2. 检查顶部 TAB 栏：
   - 应显示用户在订阅页面配置的TAB
   - TAB 顺序应与配置一致
   - "推荐"和"全部"应始终存在
3. 点击不同的固定TAB（如"科技"、"经济"）
   - 文章列表应按分类筛选
   - 后端日志应显示：`应用分类筛选: category=科技`
4. 点击 RSS 源 TAB
   - 文章列表应只显示该 RSS 源的文章
   - 后端日志应显示：`应用RSS源筛选: source_id=XX`

**预期结果**：
- ✅ TAB 列表与用户配置一致
- ✅ 固定TAB筛选正常工作（tag_category 参数）
- ✅ RSS源TAB筛选正常工作（source_id 参数）
- ✅ 兜底TAB保障：即使配置为空，也显示"推荐"TAB

---

### 3. 测试兜底TAB机制

**测试场景1：取消所有非兜底TAB**
1. 在订阅页面，取消除"推荐"和"全部"外的所有固定TAB
2. 保存配置
3. 刷新首页
4. **预期**：首页至少显示"推荐"TAB

**测试场景2：取消所有RSS源TAB**
1. 在订阅页面，取消所有RSS源TAB
2. 保存配置
3. 刷新首页
4. **预期**：首页只显示固定TAB，不显示RSS源TAB

**测试场景3：隐藏"推荐"TAB（应被阻止）**
1. 在订阅页面，尝试取消"推荐"TAB
2. **预期**：复选框不可点击，显示🔒锁定图标

---

### 4. 测试跨设备同步

**操作步骤**：
1. 在浏览器A中配置TAB并保存
2. 打开浏览器B（或无痕模式），登录同一账号
3. 访问首页 http://localhost:3008/
4. **预期**：TAB配置与浏览器A一致

**原理**：
- 首次加载时从后端 API 获取配置
- 后续操作使用 localStorage 缓存
- 每次页面加载时调用 `loadFromBackend()` 同步最新配置

---

### 5. 测试边界情况

**5.1 RSS源数量限制**
- 尝试选择11个RSS源
- **预期**：第11个无法勾选，显示"已达到最大选择数量"提示

**5.2 不存在的RSS源**
- 在后端删除一个已被用户配置的RSS源
- 刷新首页
- **预期**：该RSS源TAB自动消失（后端API过滤）

**5.3 网络异常**
- 断开网络连接
- 尝试保存配置
- **预期**：显示"保存失败"提示，localStorage 仍保留配置

**5.4 未登录用户**
- 退出登录
- 访问订阅页面
- **预期**：可以修改配置，但保存时返回401错误

---

## 🔍 调试技巧

### 前端调试

**打开浏览器开发者工具**：
1. **Console 标签**：查看日志输出
   - `加载TAB配置失败` - 后端API调用失败
   - `同步TAB配置失败` - 保存配置失败

2. **Network 标签**：查看API请求
   - `GET /api/v1/user/tabs/` - 获取配置
   - `POST /api/v1/user/tabs/sync` - 保存配置

3. **Application 标签**：查看 localStorage
   - Key: `tab-config-storage`
   - 包含 `fixedTabs` 和 `rssSourceTabs` 数据

### 后端调试

**查看日志**：
```bash
# 后端日志应包含以下信息
TAB配置同步成功: user_id=27, fixed=9, rss=10
获取TAB配置: user_id=27
应用RSS源筛选: source_id=5
应用分类筛选: category=科技
```

**数据库查询**：
```sql
-- 查看用户的TAB配置
SELECT * FROM user_tab_preferences WHERE user_id = 27 ORDER BY tab_type, display_order;

-- 查看固定TAB配置
SELECT * FROM user_tab_preferences WHERE user_id = 27 AND tab_type = 'fixed';

-- 查看RSS源TAB配置
SELECT * FROM user_tab_preferences WHERE user_id = 27 AND tab_type = 'rss_source';
```

---

## ⚠️ 已知问题与注意事项

### 1. ~~RSS源名称显示~~ ✅ 已修复（动态匹配方案）
- ~~**问题**：初次加载时，RSS源TAB可能显示为 `RSS-5` 而非实际名称~~
- ~~**原因**：`loadFromBackend()` 返回的 `sourceName` 为空~~
- **最终方案**：采用动态匹配方案，在渲染时实时从 `sources` 列表中查找名称
  - 首页 `page.tsx`：在 `dynamicTabs` 的 `useMemo` 中构建 `sourceNameMap`，动态匹配名称
  - 订阅页 `TabConfigPanel`：直接使用 `sources` 数据渲染，无需额外同步
  - 优先级：`tab.sourceName` > `sourceNameMap.get(sourceId)` > `RSS-{sourceId}`
- **优势**：
  - 不依赖 Store 状态同步，避免 Zustand persist 覆盖问题
  - 渲染时自动匹配，保证名称总是最新的
  - 简化了代码逻辑，移除了 `updateRSSSourceNames` 的调用

### 2. 配置加载时机
- 首页在 `useEffect` 中调用 `loadFromBackend()`
- 首次加载可能出现短暂的默认TAB显示
- 1-2秒后更新为用户配置

### 3. 缓存策略
- localStorage 作为一级缓存
- 后端 API 作为二级缓存（跨设备同步）
- 每次页面刷新都会从后端同步最新配置

---

## 📊 测试检查清单

- [ ] 配置面板可以正常打开
- [ ] 固定TAB可以切换可见性（除兜底TAB）
- [ ] 固定TAB可以上下移动
- [ ] RSS源TAB可以选择（最多10个）
- [ ] RSS源TAB可以上下移动
- [ ] 保存配置成功，后端日志正常
- [ ] 首页TAB列表与配置一致
- [ ] 固定TAB筛选正常工作
- [ ] RSS源TAB筛选正常工作
- [ ] 兜底TAB始终可见
- [ ] 配置刷新后保持不变
- [ ] 跨设备同步正常（可选测试）

---

## 🚀 下一步优化建议

1. **RSS源名称同步**：在 `loadFromBackend()` 后，自动从RSS源列表匹配名称
2. **加载状态优化**：在配置加载期间显示骨架屏或loading提示
3. **拖拽排序**：使用 `react-beautiful-dnd` 实现拖拽排序，替代上下按钮
4. **实时预览**：在配置面板右侧实时预览首页TAB效果
5. **配置模板**：提供预设配置模板（如"科技达人"、"财经专家"等）

---

## 📝 相关文件清单

### 后端文件
- `rss_service/alembic/versions/f1a2b3c4d5e6_add_user_tab_preferences_table.py` - 数据库迁移
- `rss_service/app/models/user_tab_preference.py` - 数据模型
- `rss_service/app/api/api_v1/endpoints/user_tab_preferences.py` - API端点
- `rss_service/app/api/api_v1/api.py` - 路由注册

### 前端文件
- `rss-frontend/store/useTabConfigStore.ts` - 状态管理
- `rss-frontend/components/TabConfigPanel.tsx` - 配置面板
- `rss-frontend/components/CategoryTabs.tsx` - TAB组件（已修改）
- `rss-frontend/app/subscribe/page.tsx` - 订阅页面（已修改）
- `rss-frontend/app/page.tsx` - 首页（已修改）

---

**测试完成时间**：2026-05-10  
**测试人员**：___________  
**测试结果**：☐ 通过  ☐ 部分通过  ☐ 失败  
**备注**：_________________________________
