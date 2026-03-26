// 星痕共鸣配装器 - 重构版本

// ==================== 常量配置 ====================
const MAGIC_NUMBER = 50000; // 公式中的固定除数（默认值）

// 每个词条的固定除数配置
const MAGIC_NUMBERS = {
    'crit': 50000,
    'haste': 50000,
    'luck': 50000,
    'mastery': 50000,
    'versatility': 28000  // 全能使用特殊除数
};

// 五个词条
const ATTRIBUTES = ['crit', 'haste', 'luck', 'mastery', 'versatility'];

// 词条中文名映射
const ATTR_NAMES = {
    'crit': '暴击',
    'haste': '急速',
    'luck': '幸运',
    'mastery': '精通',
    'versatility': '全能'
};

// 词条配置（用于详情显示）
const ATTRIBUTE_CONFIG = {
    'crit': { name: '暴击', icon: '⚡' },
    'haste': { name: '急速', icon: '🚀' },
    'luck': { name: '幸运', icon: '🍀' },
    'mastery': { name: '精通', icon: '🎯' },
    'versatility': { name: '全能', icon: '⭐' }
};

// ==================== 主计算器类 ====================
class EquipmentCalculator {
    constructor() {
        this.savedConfigs = this.loadSavedConfigs();
        this.isDarkTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.initEventListeners();
        this.applyTheme();
        this.loadAutoSave();
        this.calculateAll();
        this.initDetailModal();
    }

    // ==================== 事件监听 ====================
    initEventListeners() {
        // 工具栏按钮
        document.getElementById('save-config').addEventListener('click', () => this.showConfigModal());
        document.getElementById('load-config').addEventListener('click', () => this.showConfigModal());
        document.getElementById('export-config').addEventListener('click', () => this.exportConfig());
        document.getElementById('import-config').addEventListener('click', () => this.importConfig());
        document.getElementById('reset-config').addEventListener('click', () => this.resetAll());
        document.getElementById('toggle-theme').addEventListener('click', () => this.toggleTheme());

        // 模态框
        document.querySelector('.close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('save-new-config').addEventListener('click', () => this.saveNewConfig());

        // 提升百分比输入框
        ATTRIBUTES.forEach(attr => {
            const totalBoost = document.getElementById(`${attr}-total-boost`);
            const valueBoost = document.getElementById(`${attr}-value-boost`);
            
            if (totalBoost) {
                totalBoost.addEventListener('input', () => {
                    this.calculateAll();
                    this.autoSave();
                });
            }
            
            if (valueBoost) {
                valueBoost.addEventListener('input', () => {
                    this.calculateAll();
                    this.autoSave();
                });
            }
        });

        // 固定值获取输入框
        ATTRIBUTES.forEach(attr => {
            const fixedValue = document.getElementById(`${attr}-fixed-value`);
            if (fixedValue) {
                fixedValue.addEventListener('input', () => {
                    this.calculateAll();
                    this.autoSave();
                });
            }
        });

        // 固定百分比输入框
        ATTRIBUTES.forEach(attr => {
            const fixedPercent = document.getElementById(`${attr}-fixed-percent`);
            if (fixedPercent) {
                fixedPercent.addEventListener('input', () => {
                    this.calculateAll();
                    this.autoSave();
                });
            }
        });

        // 装备卡片事件
        document.querySelectorAll('.equipment-card').forEach(card => {
            // 启用/禁用复选框
            const enableCheckbox = card.querySelector('.enable-slot');
            enableCheckbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    card.classList.remove('disabled');
                } else {
                    card.classList.add('disabled');
                }
                this.calculateAll();
                this.autoSave();
            });

            // 所有输入框和下拉框
            card.querySelectorAll('select, input[type="number"]').forEach(input => {
                input.addEventListener('input', () => {
                    this.calculateAll();
                    this.autoSave();
                });
            });
        });

        // 点击模态框外部关闭
        document.getElementById('config-modal').addEventListener('click', (e) => {
            if (e.target.id === 'config-modal') {
                this.closeModal();
            }
        });
    }

    // ==================== 核心计算逻辑 ====================
    calculateAll() {
        // 收集所有装备的属性数值
        const rawValues = this.collectRawValues();
        
        // 获取固定值获取配置
        const fixedValues = this.getFixedValues();
        
        // 获取提升百分比配置
        const boostConfig = this.getBoostConfig();
        
        // 获取固定百分比配置
        const fixedPercents = this.getFixedPercents();
        
        // 对每个词条进行计算
        ATTRIBUTES.forEach(attr => {
            // 固定值总和 = 装备数值 + 固定值获取
            const total = (rawValues[attr] || 0) + (fixedValues[attr] || 0);
            const totalBoost = boostConfig[attr].total;
            const valueBoost = boostConfig[attr].value;
            const fixedPercent = fixedPercents[attr];
            
            // 获取该词条的固定除数
            const magicNumber = MAGIC_NUMBERS[attr] || MAGIC_NUMBER;
            
            // 计算获取量 = 固定值总和 × (1 + 值提升百分比)
            const obtained = total * (1 + valueBoost / 100);
            
            // 计算最终百分比 = [固定百分比 + 获取量 / (获取量 + magicNumber)] × (1 + 总体提升百分比)
            const finalPercent = (fixedPercent + (obtained / (obtained + magicNumber)) * 100) * (1 + totalBoost / 100);
            
            // 更新显示
            this.updateStatDisplay(attr, total, obtained, finalPercent);
        });
    }

    // 收集所有装备的原始数值
    collectRawValues() {
        const values = {
            crit: 0,
            haste: 0,
            luck: 0,
            mastery: 0,
            versatility: 0
        };

        document.querySelectorAll('.equipment-card').forEach(card => {
            const isEnabled = card.querySelector('.enable-slot').checked;
            if (!isEnabled) return;

            const slot = card.dataset.slot;
            
            // 基础4个属性
            ['attr1', 'attr2', 'reforge', 'inlay'].forEach(attrKey => {
                const typeSelect = card.querySelector(`.${attrKey}-type`);
                const valueInput = card.querySelector(`.${attrKey}-value`);
                
                if (typeSelect && valueInput) {
                    const attrType = typeSelect.value;
                    const attrValue = parseFloat(valueInput.value) || 0;
                    
                    if (values[attrType] !== undefined) {
                        values[attrType] += attrValue;
                    }
                }
            });

            // 武器的额外2个属性
            if (slot === 'weapon') {
                ['extra1', 'extra2'].forEach(extraKey => {
                    const typeSelect = card.querySelector(`.${extraKey}-type`);
                    const valueInput = card.querySelector(`.${extraKey}-value`);
                    
                    if (typeSelect && valueInput) {
                        const attrType = typeSelect.value;
                        const attrValue = parseFloat(valueInput.value) || 0;
                        
                        if (values[attrType] !== undefined) {
                            values[attrType] += attrValue;
                        }
                    }
                });
            }
        });

        return values;
    }

    // 获取提升百分比配置
    getBoostConfig() {
        const config = {};
        
        ATTRIBUTES.forEach(attr => {
            const totalBoost = parseFloat(document.getElementById(`${attr}-total-boost`).value) || 0;
            const valueBoost = parseFloat(document.getElementById(`${attr}-value-boost`).value) || 0;
            
            config[attr] = {
                total: totalBoost,
                value: valueBoost
            };
        });
        
        return config;
    }

    // 获取固定值获取配置
    getFixedValues() {
        const values = {};
        
        ATTRIBUTES.forEach(attr => {
            const fixedValue = parseFloat(document.getElementById(`${attr}-fixed-value`).value) || 0;
            values[attr] = fixedValue;
        });
        
        return values;
    }

    // 获取固定百分比配置
    getFixedPercents() {
        const percents = {};
        
        ATTRIBUTES.forEach(attr => {
            const fixedPercent = parseFloat(document.getElementById(`${attr}-fixed-percent`).value) || 0;
            percents[attr] = fixedPercent;
        });
        
        return percents;
    }

    // 更新统计显示
    updateStatDisplay(attr, total, obtained, finalPercent) {
        // 更新主面板的最终百分比显示
        const finalEl = document.querySelector(`[data-value="${attr}-final"]`);
        if (finalEl) finalEl.textContent = finalPercent.toFixed(2) + '%';
    }

    // ==================== 配置管理 ====================
    getCurrentConfig() {
        const config = {
            timestamp: new Date().toISOString(),
            boosts: {},
            fixedValues: {},
            fixedPercents: {},
            equipment: []
        };

        // 保存提升百分比
        ATTRIBUTES.forEach(attr => {
            config.boosts[attr] = {
                total: parseFloat(document.getElementById(`${attr}-total-boost`).value) || 0,
                value: parseFloat(document.getElementById(`${attr}-value-boost`).value) || 0
            };
        });

        // 保存固定值获取
        ATTRIBUTES.forEach(attr => {
            config.fixedValues[attr] = parseFloat(document.getElementById(`${attr}-fixed-value`).value) || 0;
        });

        // 保存固定百分比
        ATTRIBUTES.forEach(attr => {
            config.fixedPercents[attr] = parseFloat(document.getElementById(`${attr}-fixed-percent`).value) || 0;
        });

        // 保存装备数据
        document.querySelectorAll('.equipment-card').forEach(card => {
            const slot = card.dataset.slot;
            const equipData = {
                slot: slot,
                enabled: card.querySelector('.enable-slot').checked,
                attrs: []
            };

            // 基础4个属性
            ['attr1', 'attr2', 'reforge', 'inlay'].forEach(attrKey => {
                const typeSelect = card.querySelector(`.${attrKey}-type`);
                const valueInput = card.querySelector(`.${attrKey}-value`);
                
                if (typeSelect && valueInput) {
                    equipData.attrs.push({
                        key: attrKey,
                        type: typeSelect.value,
                        value: parseFloat(valueInput.value) || 0
                    });
                }
            });

            // 武器的额外2个属性
            if (slot === 'weapon') {
                ['extra1', 'extra2'].forEach(extraKey => {
                    const typeSelect = card.querySelector(`.${extraKey}-type`);
                    const valueInput = card.querySelector(`.${extraKey}-value`);
                    
                    if (typeSelect && valueInput) {
                        equipData.attrs.push({
                            key: extraKey,
                            type: typeSelect.value,
                            value: parseFloat(valueInput.value) || 0
                        });
                    }
                });
            }

            config.equipment.push(equipData);
        });

        return config;
    }

    applyConfig(config) {
        if (!config) return;

        // 应用提升百分比
        if (config.boosts) {
            ATTRIBUTES.forEach(attr => {
                if (config.boosts[attr]) {
                    const totalInput = document.getElementById(`${attr}-total-boost`);
                    const valueInput = document.getElementById(`${attr}-value-boost`);
                    
                    if (totalInput) totalInput.value = config.boosts[attr].total || 0;
                    if (valueInput) valueInput.value = config.boosts[attr].value || 0;
                }
            });
        }

        // 应用固定值获取
        if (config.fixedValues) {
            ATTRIBUTES.forEach(attr => {
                if (config.fixedValues[attr] !== undefined) {
                    const input = document.getElementById(`${attr}-fixed-value`);
                    if (input) input.value = config.fixedValues[attr];
                }
            });
        }

        // 应用固定百分比
        if (config.fixedPercents) {
            ATTRIBUTES.forEach(attr => {
                if (config.fixedPercents[attr] !== undefined) {
                    const input = document.getElementById(`${attr}-fixed-percent`);
                    if (input) input.value = config.fixedPercents[attr];
                }
            });
        }

        // 应用装备数据
        if (config.equipment) {
            config.equipment.forEach(equipData => {
                const card = document.querySelector(`[data-slot="${equipData.slot}"]`);
                if (!card) return;

                // 设置启用状态
                const enableCheckbox = card.querySelector('.enable-slot');
                enableCheckbox.checked = equipData.enabled;
                
                if (equipData.enabled) {
                    card.classList.remove('disabled');
                } else {
                    card.classList.add('disabled');
                }

                // 设置属性值
                equipData.attrs.forEach(attr => {
                    const typeSelect = card.querySelector(`.${attr.key}-type`);
                    const valueInput = card.querySelector(`.${attr.key}-value`);
                    
                    if (typeSelect) typeSelect.value = attr.type;
                    if (valueInput) valueInput.value = attr.value;
                });
            });
        }

        this.calculateAll();
    }

    autoSave() {
        const config = this.getCurrentConfig();
        localStorage.setItem('autoSaveConfig', JSON.stringify(config));
    }

    loadAutoSave() {
        try {
            const saved = localStorage.getItem('autoSaveConfig');
            if (saved) {
                const config = JSON.parse(saved);
                this.applyConfig(config);
                console.log('自动加载上次配置');
            }
        } catch (e) {
            console.error('加载自动保存配置失败:', e);
        }
    }

    saveNewConfig() {
        const configName = document.getElementById('config-name').value.trim();
        if (!configName) {
            this.showToast('请输入方案名称', 'error');
            return;
        }

        const config = this.getCurrentConfig();
        config.name = configName;

        this.savedConfigs.push(config);
        this.saveSavedConfigs();
        this.renderSavedConfigs();
        
        document.getElementById('config-name').value = '';
        this.showToast(`方案 "${configName}" 保存成功！`, 'success');
    }

    loadConfig(index) {
        const config = this.savedConfigs[index];
        if (config) {
            this.applyConfig(config);
            this.closeModal();
            this.showToast(`已加载方案 "${config.name}"`, 'success');
        }
    }

    deleteConfig(index) {
        if (confirm(`确定要删除方案 "${this.savedConfigs[index].name}" 吗？`)) {
            const deletedName = this.savedConfigs[index].name;
            this.savedConfigs.splice(index, 1);
            this.saveSavedConfigs();
            this.renderSavedConfigs();
            this.showToast(`已删除方案 "${deletedName}"`, 'success');
        }
    }

    saveSavedConfigs() {
        localStorage.setItem('savedConfigs', JSON.stringify(this.savedConfigs));
    }

    loadSavedConfigs() {
        try {
            const saved = localStorage.getItem('savedConfigs');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('加载保存的配置失败:', e);
            return [];
        }
    }

    renderSavedConfigs() {
        const container = document.getElementById('saved-configs');
        container.innerHTML = '';

        if (this.savedConfigs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">暂无保存的方案</p>';
            return;
        }

        this.savedConfigs.forEach((config, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div>
                    <div class="config-item-name">${config.name}</div>
                    <small style="color: var(--text-secondary);">${new Date(config.timestamp).toLocaleString('zh-CN')}</small>
                </div>
                <div class="config-item-actions">
                    <button class="btn-load" onclick="calculator.loadConfig(${index})">加载</button>
                    <button class="btn-delete" onclick="calculator.deleteConfig(${index})">删除</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    // ==================== 导入导出 ====================
    exportConfig() {
        const config = this.getCurrentConfig();
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `星痕共鸣配装_${new Date().getTime()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showToast('配置已导出', 'success');
    }

    importConfig() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    this.applyConfig(config);
                    this.showToast('配置导入成功！', 'success');
                } catch (error) {
                    this.showToast('配置文件格式错误', 'error');
                    console.error('导入失败:', error);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // ==================== 其他功能 ====================
    resetAll() {
        if (confirm('确定要重置所有配置吗？此操作不可撤销！')) {
            // 重置提升百分比
            ATTRIBUTES.forEach(attr => {
                document.getElementById(`${attr}-total-boost`).value = 0;
                document.getElementById(`${attr}-value-boost`).value = 0;
            });

            // 重置固定值获取
            ATTRIBUTES.forEach(attr => {
                document.getElementById(`${attr}-fixed-value`).value = 0;
            });

            // 重置固定百分比（暴击保持5）
            ATTRIBUTES.forEach(attr => {
                const defaultValue = attr === 'crit' ? 5 : 0;
                document.getElementById(`${attr}-fixed-percent`).value = defaultValue;
            });

            // 重置所有装备
            document.querySelectorAll('.equipment-card').forEach(card => {
                card.querySelector('.enable-slot').checked = true;
                card.classList.remove('disabled');
                
                card.querySelectorAll('input[type="number"]').forEach(input => {
                    input.value = 0;
                });
                
                card.querySelectorAll('select').forEach(select => {
                    select.selectedIndex = 0;
                });
            });

            this.calculateAll();
            this.autoSave();
            this.showToast('已重置所有配置', 'success');
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    }

    applyTheme() {
        if (this.isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.getElementById('toggle-theme').textContent = '☀️ 切换主题';
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.getElementById('toggle-theme').textContent = '🌙 切换主题';
        }
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    }

    showConfigModal() {
        this.renderSavedConfigs();
        document.getElementById('config-modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('config-modal').classList.remove('active');
        document.getElementById('detail-modal').classList.remove('active');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // ==================== 详情弹窗功能 ====================
    initDetailModal() {
        // 为每个属性卡片添加点击事件
        document.querySelectorAll('.stat-card').forEach(card => {
            const detailBtn = card.querySelector('.stat-detail-btn');
            const attr = card.dataset.attr;
            
            detailBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDetailModal(attr);
            });
            
            card.addEventListener('click', () => {
                this.showDetailModal(attr);
            });
        });

        // 关闭按钮
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // 点击模态框外部关闭
        document.getElementById('detail-modal').addEventListener('click', (e) => {
            if (e.target.id === 'detail-modal') {
                this.closeModal();
            }
        });
    }

    showDetailModal(attr) {
        const config = ATTRIBUTE_CONFIG;
        const attrName = ATTR_NAMES[attr];
        
        // 获取当前属性的计算数据
        const rawValues = this.collectRawValues();
        const fixedValues = this.getFixedValues();
        const boostConfig = this.getBoostConfig();
        const fixedPercents = this.getFixedPercents();
        
        // 固定值总和 = 装备数值 + 固定值获取
        const total = (rawValues[attr] || 0) + (fixedValues[attr] || 0);
        const totalBoost = boostConfig[attr].total;
        const valueBoost = boostConfig[attr].value;
        const fixedPercent = fixedPercents[attr];
        
        // 获取该词条的固定除数
        const magicNumber = MAGIC_NUMBERS[attr] || MAGIC_NUMBER;
        
        // 计算各步骤数据
        const obtained = total * (1 + valueBoost / 100);
        const converted = (obtained / (obtained + magicNumber)) * 100;
        const intermediate = fixedPercent + converted;
        const finalPercent = intermediate * (1 + totalBoost / 100);
        
        // 更新弹窗内容
        const iconMap = {
            'crit': '⚡',
            'haste': '🚀',
            'luck': '🍀',
            'mastery': '🎯',
            'versatility': '⭐'
        };
        
        document.getElementById('detail-attr-icon').textContent = iconMap[attr];
        document.getElementById('detail-attr-name').textContent = attrName;
        
        // 第一步数据
        document.getElementById('detail-total').textContent = total.toFixed(0);
        document.getElementById('detail-total-2').textContent = total.toFixed(0);
        document.getElementById('detail-value-boost').textContent = valueBoost.toFixed(1) + '%';
        document.getElementById('detail-obtained').textContent = obtained.toFixed(2);
        
        // 第二步数据
        document.getElementById('detail-obtained-2').textContent = obtained.toFixed(2);
        document.getElementById('detail-converted').textContent = converted.toFixed(2) + '%';
        
        // 第三步数据
        document.getElementById('detail-fixed').textContent = fixedPercent.toFixed(2) + '%';
        document.getElementById('detail-converted-2').textContent = converted.toFixed(2) + '%';
        document.getElementById('detail-intermediate').textContent = intermediate.toFixed(2) + '%';
        
        // 第四步数据
        document.getElementById('detail-intermediate-2').textContent = intermediate.toFixed(2) + '%';
        document.getElementById('detail-total-boost').textContent = totalBoost.toFixed(1) + '%';
        document.getElementById('detail-final').textContent = finalPercent.toFixed(2) + '%';
        
        // 显示弹窗
        document.getElementById('detail-modal').classList.add('active');
    }
}

// ==================== 初始化 ====================
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new EquipmentCalculator();
    console.log('星痕共鸣配装器已加载');
    console.log('计算公式：[固定百分比 + 获取量 / (获取量 + 固定除数)] × (1 + 总体提升百分比)');
    console.log('获取量 = 固定值总和 × (1 + 值提升百分比)');
    console.log('固定除数配置：');
    console.log('  - 暴击、急速、幸运、精通：50000');
    console.log('  - 全能：28000（特殊，收益更高）');
});

// ==================== 键盘快捷键 ====================
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        calculator.showConfigModal();
    }
    
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        calculator.exportConfig();
    }
    
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        calculator.importConfig();
    }
    
    if (e.key === 'Escape') {
        calculator.closeModal();
    }
});
