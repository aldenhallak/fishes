/**
 * 数据表编辑器
 * 提供可编辑表格功能
 */

// 表名映射
const tableDisplayNames = {
  'fish': '鱼表',
  'votes': '投票表',
  'reports': '举报表',
  'user_economy': '用户经济表',
  'economy_log': '经济日志',
  'battle_log': '战斗日志',
  'battle_config': '战斗配置',
  'fishtanks': '鱼缸表',
  'fishtank_fish': '鱼缸-鱼关联表',
  'fishtank_views': '鱼缸浏览记录',
};

// 全局状态
let currentTable = '';
let tableData = null;
let pendingUpdates = {};
let selectedRows = new Set();
let editingCell = null;
let sortColumn = 'id';
let sortDirection = 'desc';

// 只读字段
const readOnlyColumns = ['id', 'created_at', 'updated_at'];

// 获取URL参数
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// 初始化
async function init() {
  currentTable = getQueryParam('table');
  
  if (!currentTable) {
    showError('缺少表名参数');
    return;
  }

  // 设置表名显示
  const displayName = tableDisplayNames[currentTable] || currentTable;
  document.getElementById('table-display-name').textContent = displayName;
  document.getElementById('table-name').textContent = currentTable;

  // 绑定事件
  document.getElementById('refresh-btn').addEventListener('click', handleRefresh);
  document.getElementById('save-btn').addEventListener('click', handleSave);
  document.getElementById('discard-btn').addEventListener('click', handleDiscard);
  document.getElementById('clear-selection-btn').addEventListener('click', clearSelection);
  document.getElementById('batch-delete-btn').addEventListener('click', handleBatchDelete);

  // 加载数据
  await loadTableData();
}

// 加载表数据
async function loadTableData() {
  try {
    const params = new URLSearchParams({
      limit: '100',
      offset: '0',
      order_by: sortColumn,
      order_direction: sortDirection
    });

    const response = await fetch(`/api/admin/tables/${currentTable}?${params}`);
    const result = await response.json();

    if (result.success) {
      tableData = result.data;
      renderTable();
      updateStats();
    } else {
      showError(result.error || '加载表数据失败');
    }
  } catch (err) {
    console.error('加载表数据失败:', err);
    showError('加载表数据失败：' + err.message);
  }
}

// 渲染表格
function renderTable() {
  if (!tableData || !tableData.rows) {
    return;
  }

  const { columns, rows } = tableData;

  // 渲染表头
  const thead = document.getElementById('table-head');
  thead.innerHTML = `
    <tr>
      <th class="checkbox-cell">
        <input type="checkbox" id="select-all" />
      </th>
      ${columns.map(col => {
        const colName = typeof col === 'string' ? col : col.name;
        return `
        <th onclick="handleSort('${colName}')" class="${sortColumn === colName ? 'sorted' : ''}">
          <div>
            ${formatColumnName(colName)}
            ${readOnlyColumns.includes(colName) ? ' 🔒' : ''}
            <span class="sort-indicator">
              ${sortColumn === colName ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
            </span>
          </div>
          <div style="font-size: 0.7rem; font-weight: normal; margin-top: 0.25rem; font-family: 'Courier New', monospace;">
            ${colName}
          </div>
        </th>
      `}).join('')}
    </tr>
  `;

  // 绑定全选框
  document.getElementById('select-all').addEventListener('change', (e) => {
    if (e.target.checked) {
      rows.forEach(row => selectedRows.add(row.id.toString()));
    } else {
      selectedRows.clear();
    }
    renderTable();
    updateBatchActions();
  });

  // 渲染表体
  const tbody = document.getElementById('table-body');
  
  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="${columns.length + 1}" style="text-align: center; padding: 3rem; color: #718096;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
          <h3>暂无数据</h3>
          <p>该表中没有数据记录</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = rows.map(row => {
    const rowId = row.id.toString();
    const isSelected = selectedRows.has(rowId);
    
    return `
      <tr class="${isSelected ? 'selected' : ''}">
        <td class="checkbox-cell">
          <input 
            type="checkbox" 
            ${isSelected ? 'checked' : ''}
            onchange="toggleRowSelection('${rowId}')"
          />
        </td>
        ${columns.map(col => {
          const colName = typeof col === 'string' ? col : col.name;
          return renderCell(row, colName, rowId);
        }).join('')}
      </tr>
    `;
  }).join('');
}

// 渲染单元格
function renderCell(row, col, rowId) {
  const value = row[col];
  const isReadOnly = readOnlyColumns.includes(col);
  const isPending = hasPendingChange(rowId, col);
  
  let displayValue = formatValue(value, col);
  let cellClass = 'cell';
  
  if (isReadOnly) {
    cellClass += ' cell-readonly';
  } else {
    cellClass += ' cell-editable';
  }
  
  if (isPending) {
    cellClass += ' cell-changed';
  }

  return `
    <td 
      class="${cellClass}"
      ${!isReadOnly ? `onclick="startEdit('${rowId}', '${col}', event)"` : ''}
      data-row-id="${rowId}"
      data-column="${col}"
    >
      ${displayValue}
      ${isPending ? '<span style="color: #d97706; margin-left: 0.5rem;">●</span>' : ''}
    </td>
  `;
}

// 格式化值显示
function formatValue(value, column) {
  if (value === null || value === undefined) {
    return '<span class="null-badge">NULL</span>';
  }

  if (typeof value === 'boolean') {
    return `<span class="boolean-badge ${value ? 'boolean-true' : 'boolean-false'}">
      ${value ? '✓ true' : '✗ false'}
    </span>`;
  }

  if (column.includes('_at') && value) {
    return new Date(value).toLocaleString('zh-CN');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  const str = value.toString();
  if (str.length > 100) {
    return `<span title="${str}">${str.substring(0, 100)}...</span>`;
  }

  return str;
}

// 格式化列名
function formatColumnName(col) {
  const names = {
    'id': 'ID',
    'user_id': '用户ID',
    'fish_id': '鱼ID',
    'artist': '作者',
    'image_url': '图片URL',
    'level': '等级',
    'talent': '天赋',
    'upvotes': '赞成票',
    'downvotes': '反对票',
    'is_approved': '已审核',
    'is_banned': '已封禁',
    'created_at': '创建时间',
    'updated_at': '更新时间',
    'vote_type': '投票类型',
    'reason': '原因',
    'balance': '余额',
    'transaction_type': '交易类型',
    'amount': '金额',
    'description': '描述',
  };
  
  return names[col] || col;
}

// 开始编辑
window.startEdit = function(rowId, column, event) {
  // 阻止事件冒泡和默认行为
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  if (readOnlyColumns.includes(column)) return;
  
  const cell = document.querySelector(`td[data-row-id="${rowId}"][data-column="${column}"]`);
  if (!cell) return;

  // 获取当前值
  const row = tableData.rows.find(r => r.id.toString() === rowId);
  if (!row) return;

  let currentValue = row[column];
  
  // 检查是否有待保存的更改
  if (pendingUpdates[rowId] && pendingUpdates[rowId][column] !== undefined) {
    currentValue = pendingUpdates[rowId][column];
  }

  editingCell = { rowId, column, cell, originalValue: currentValue };

  // 判断字段类型
  const isBooleanField = typeof currentValue === 'boolean' || column.startsWith('is_');

  if (isBooleanField) {
    // 布尔字段使用下拉框
    const select = document.createElement('select');
    select.className = 'cell-input';
    select.innerHTML = `
      <option value="true" ${currentValue === true ? 'selected' : ''}>true</option>
      <option value="false" ${currentValue === false ? 'selected' : ''}>false</option>
      <option value="null" ${currentValue === null ? 'selected' : ''}>NULL</option>
    `;
    
    // 使用 change 事件保存
    select.addEventListener('change', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
      let newValue;
      if (select.value === 'null') {
        newValue = null;
      } else {
        newValue = select.value === 'true';
      }
      saveEdit(newValue);
    });
    
    // 处理键盘事件
    select.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        cancelEdit();
      }
    });

    // 阻止点击事件冒泡，防止触发表格的其他事件
    select.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    select.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    cell.innerHTML = '';
    cell.appendChild(select);
    cell.classList.add('cell-editing');
    
    // 延迟 focus，确保 DOM 已完全更新
    setTimeout(() => {
      select.focus();
    }, 0);
  } else {
    // 文本字段使用输入框
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cell-input';
    input.value = currentValue === null ? '' : currentValue;
    
    input.addEventListener('blur', () => {
      if (input.value !== (currentValue === null ? '' : currentValue.toString())) {
        saveEdit(input.value);
      } else {
        cancelEdit();
      }
    });
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (input.value !== (currentValue === null ? '' : currentValue.toString())) {
          saveEdit(input.value);
        } else {
          cancelEdit();
        }
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });

    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('cell-editing');
    input.focus();
    input.select();
  }
};

// 保存编辑
function saveEdit(newValue) {
  if (!editingCell) return;

  const { rowId, column } = editingCell;

  // 记录更改
  if (!pendingUpdates[rowId]) {
    // 根据表的主键类型决定是否需要 parseInt
    // fish 表使用 UUID，不需要 parseInt
    const pkColumn = tableData.columns.find(col => col.name === 'id');
    const idValue = (pkColumn && pkColumn.type === 'Int') ? parseInt(rowId) : rowId;
    console.log('[保存编辑] 创建新的待更新记录:', { rowId, pkColumn, idValue });
    pendingUpdates[rowId] = { id: idValue };
  }
  pendingUpdates[rowId][column] = newValue;
  console.log('[保存编辑] 待更新记录:', pendingUpdates[rowId]);

  // 更新本地数据
  const row = tableData.rows.find(r => r.id.toString() === rowId);
  if (row) {
    row[column] = newValue;
  }

  cancelEdit();
  renderTable();
  updateChangesIndicator();
}

// 取消编辑
function cancelEdit() {
  if (editingCell) {
    editingCell = null;
  }
  renderTable();
}

// 检查是否有待保存的更改
function hasPendingChange(rowId, column) {
  return pendingUpdates[rowId] && pendingUpdates[rowId].hasOwnProperty(column);
}

// 更新更改指示器
function updateChangesIndicator() {
  const count = Object.keys(pendingUpdates).length;
  const indicator = document.getElementById('changes-indicator');
  const saveBtn = document.getElementById('save-btn');
  const discardBtn = document.getElementById('discard-btn');
  const countEl = document.getElementById('changes-count');

  if (count > 0) {
    indicator.style.display = 'flex';
    saveBtn.style.display = 'block';
    discardBtn.style.display = 'block';
    countEl.textContent = count;
  } else {
    indicator.style.display = 'none';
    saveBtn.style.display = 'none';
    discardBtn.style.display = 'none';
  }
}

// 处理排序
window.handleSort = function(column) {
  if (sortColumn === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn = column;
    sortDirection = 'desc';
  }
  loadTableData();
};

// 处理刷新
async function handleRefresh() {
  if (Object.keys(pendingUpdates).length > 0) {
    if (!confirm('有未保存的更改，确定要刷新数据吗？')) {
      return;
    }
  }
  pendingUpdates = {};
  await loadTableData();
  updateChangesIndicator();
}

// 处理保存
async function handleSave() {
  const updates = Object.values(pendingUpdates);
  
  if (updates.length === 0) {
    return;
  }

  console.log('[处理保存] 准备保存的更新:', updates);

  try {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = '保存中...';

    const response = await fetch(`/api/admin/tables/${currentTable}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates })
    });

    const result = await response.json();
    console.log('[处理保存] 服务器返回结果:', result);

    if (result.success) {
      const { successCount, failureCount } = result.data;
      if (failureCount > 0) {
        alert(`保存完成：成功 ${successCount} 条，失败 ${failureCount} 条`);
      } else {
        alert(`保存成功：已更新 ${successCount} 条记录`);
      }
      pendingUpdates = {};
      await loadTableData();
      updateChangesIndicator();
    } else {
      alert(`保存失败：${result.error}`);
    }
  } catch (err) {
    console.error('保存失败:', err);
    alert('保存失败：' + err.message);
  } finally {
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = false;
    saveBtn.textContent = '💾 保存更改';
  }
}

// 处理丢弃更改
function handleDiscard() {
  if (confirm('确定要丢弃所有未保存的更改吗？')) {
    pendingUpdates = {};
    loadTableData();
    updateChangesIndicator();
  }
}

// 切换行选择
window.toggleRowSelection = function(rowId) {
  if (selectedRows.has(rowId)) {
    selectedRows.delete(rowId);
  } else {
    selectedRows.add(rowId);
  }
  renderTable();
  updateBatchActions();
};

// 清空选择
function clearSelection() {
  selectedRows.clear();
  renderTable();
  updateBatchActions();
}

// 更新批量操作
function updateBatchActions() {
  const batchActions = document.getElementById('batch-actions');
  const selectedCount = document.getElementById('selected-count');
  
  if (selectedRows.size > 0) {
    batchActions.style.display = 'flex';
    selectedCount.textContent = selectedRows.size;
  } else {
    batchActions.style.display = 'none';
  }
}

// 批量删除
async function handleBatchDelete() {
  if (selectedRows.size === 0) return;

  const count = selectedRows.size;
  if (!confirm(`确定要删除选中的 ${count} 条记录吗？此操作无法撤销。`)) {
    return;
  }

  try {
    const ids = Array.from(selectedRows).join(',');
    const response = await fetch(`/api/admin/tables/${currentTable}?ids=${ids}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (result.success) {
      alert(`成功删除 ${result.data.affectedRows} 条记录`);
      selectedRows.clear();
      await loadTableData();
      updateBatchActions();
    } else {
      alert(`删除失败：${result.error}`);
    }
  } catch (err) {
    console.error('批量删除失败:', err);
    alert('批量删除失败：' + err.message);
  }
}

// 更新统计信息
function updateStats() {
  if (!tableData) return;

  document.getElementById('column-count').textContent = tableData.columns.length;
  document.getElementById('row-count').textContent = tableData.rows.length;
  document.getElementById('display-range').textContent = 
    `${tableData.pagination.offset + 1} - ${tableData.pagination.offset + tableData.rows.length}`;
  document.getElementById('update-time').textContent = new Date().toLocaleString('zh-CN');
}

// 显示错误
function showError(message) {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = `
    <tr>
      <td colspan="100" class="error">
        <strong>⚠️ 错误：</strong>${message}
      </td>
    </tr>
  `;
}

// 初始化
init();











