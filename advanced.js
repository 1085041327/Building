// 高级功能模块
// 提供属性对比、推荐配装、优化建议等高级功能

class AdvancedFeatures {
    constructor(calculator) {
        this.calculator = calculator;
    }

    // ==================== 属性对比功能 ====================
    compareConfigs(config1, config2) {
        const stats1 = this.calculateConfigStats(config1);
        const stats2 = this.calculateConfigStats(config2);
        
        const comparison = {};
        for (const attr in stats1) {
            comparison[attr] = {
                config1: stats1[attr],
                config2: stats2[attr],
                diff: stats2[attr] - stats1[attr],
                diffPercent: ((stats2[attr] - stats1[attr]) / stats1[attr] * 100).toFixed(2)
            };
        }
        
        return comparison;
    }

    // ==================== 配装评分系统 ====================
    calculateScore(config) {
        let totalScore = 0;
        const weights = {
            'phys-forward': 1.5,
            'crit': 2.0,
            'crit-speed': 1.8,
            'run': 1.0,
            'gold': 0.5,
            'atk': 1.3,
            'def': 1.2,
            'hp': 1.1
        };

        const stats = this.calculateConfigStats(config);
        
        for (const attr in stats) {
            if (weights[attr]) {
                totalScore += stats[attr] * weights[attr];
            }
        }

        return Math.round(totalScore);
    }

    // ==================== 推荐配装 ====================
    getRecommendations(targetType = 'balanced') {
        const recommendations = {
            'dps': {
                name: '极限输出型',
                priority: ['crit', 'crit-speed', 'atk', 'phys-forward'],
                sets: ['thunder', 'shadow', 'flame'],
                tips: [
                    '优先堆叠暴击率至50%以上',
                    '暴击伤害建议达到150%',
                    '适当配置物理穿透提升收益',
                    '可适当牺牲生存属性'
                ]
            },
            'tank': {
                name: '肉盾生存型',
                priority: ['hp', 'def', 'hp-regen'],
                sets: ['frost', 'light'],
                tips: [
                    '生命值建议堆到3000+',
                    '防御力至少500',
                    '配置生命恢复提升持续作战能力',
                    '可选择减伤套装'
                ]
            },
            'balanced': {
                name: '均衡发展型',
                priority: ['atk', 'hp', 'crit', 'def'],
                sets: ['flame', 'light', 'thunder'],
                tips: [
                    '攻击和生命按2:1配置',
                    '保持一定暴击率（30%左右）',
                    '防御属性不可忽视',
                    '适合新手和过渡期'
                ]
            },
            'speed': {
                name: '极速流派型',
                priority: ['atk-speed', 'move-speed', 'crit', 'atk'],
                sets: ['thunder', 'shadow'],
                tips: [
                    '攻速堆到上限',
                    '移速提升走位能力',
                    '配合高暴击打连击',
                    '适合技术型玩家'
                ]
            }
        };

        return recommendations[targetType] || recommendations['balanced'];
    }

    // ==================== 属性优化建议 ====================
    getOptimizationSuggestions(currentConfig) {
        const suggestions = [];
        const stats = this.calculateConfigStats(currentConfig);

        // 检查暴击率和暴击伤害的配比
        if (stats['crit'] > 0 && stats['crit-speed'] / stats['crit'] < 1.5) {
            suggestions.push({
                type: 'warning',
                title: '暴击配比不均',
                message: '暴击伤害与暴击率的比例建议为1.5:1，当前偏低',
                suggestion: '建议增加爆速属性配置'
            });
        }

        // 检查攻击和穿透的配比
        if (stats['atk'] > 500 && stats['phys-forward'] < 20) {
            suggestions.push({
                type: 'info',
                title: '穿透属性不足',
                message: '高攻击情况下，穿透收益更高',
                suggestion: '建议配置15-20%的物理穿透'
            });
        }

        // 检查生存能力
        if (stats['hp'] < 1000 && stats['def'] < 100) {
            suggestions.push({
                type: 'danger',
                title: '生存属性过低',
                message: '当前生命和防御都较低，容易被秒杀',
                suggestion: '建议至少配置1000生命或150防御'
            });
        }

        // 检查套装效果
        const setCount = this.countSetPieces(currentConfig);
        let hasCompleteSet = false;
        for (const count of Object.values(setCount)) {
            if (count >= 2) hasCompleteSet = true;
        }
        
        if (!hasCompleteSet) {
            suggestions.push({
                type: 'info',
                title: '未激活套装效果',
                message: '当前没有激活任何套装效果',
                suggestion: '尝试凑齐2件或4件同套装备以获得套装加成'
            });
        }

        return suggestions;
    }

    // ==================== 属性收益计算 ====================
    calculateAttributeEfficiency(currentStats) {
        const efficiency = {};
        
        // 暴击期望伤害
        const critExpectedDmg = 1 + (currentStats['crit'] / 100) * (currentStats['crit-speed'] / 100);
        efficiency['crit-expected'] = {
            name: '暴击期望伤害',
            value: (critExpectedDmg * 100).toFixed(2) + '%',
            rank: this.rankValue(critExpectedDmg, 1, 3)
        };

        // 有效生命值
        const effectiveHP = currentStats['hp'] * (1 + currentStats['def'] / 500);
        efficiency['effective-hp'] = {
            name: '有效生命值',
            value: Math.round(effectiveHP),
            rank: this.rankValue(effectiveHP, 1000, 5000)
        };

        // 总伤害输出能力
        const totalDPS = currentStats['atk'] * critExpectedDmg * (1 + currentStats['phys-forward'] / 100);
        efficiency['total-dps'] = {
            name: '理论DPS',
            value: Math.round(totalDPS),
            rank: this.rankValue(totalDPS, 100, 1000)
        };

        return efficiency;
    }

    rankValue(value, minGood, maxExcellent) {
        if (value >= maxExcellent) return 'S';
        if (value >= maxExcellent * 0.8) return 'A';
        if (value >= minGood) return 'B';
        if (value >= minGood * 0.5) return 'C';
        return 'D';
    }

    // ==================== 套装统计 ====================
    countSetPieces(config) {
        const setCount = {};
        
        if (config && config.equipment) {
            config.equipment.forEach(equip => {
                if (equip.enabled && equip.set && equip.set !== 'none') {
                    setCount[equip.set] = (setCount[equip.set] || 0) + 1;
                }
            });
        }
        
        return setCount;
    }

    // ==================== 配装完整度检查 ====================
    checkCompleteness(config) {
        const completeness = {
            totalSlots: 11,
            enabledSlots: 0,
            configuredSlots: 0,
            emptySlots: [],
            percentage: 0
        };

        if (config && config.equipment) {
            config.equipment.forEach(equip => {
                if (equip.enabled) {
                    completeness.enabledSlots++;
                    
                    // 检查是否配置了主要属性
                    if (equip.set !== 'none' || equip.shengsheng !== 'none') {
                        completeness.configuredSlots++;
                    } else {
                        completeness.emptySlots.push(equip.slot);
                    }
                }
            });
        }

        completeness.percentage = Math.round(
            (completeness.configuredSlots / completeness.totalSlots) * 100
        );

        return completeness;
    }

    // ==================== 计算配置的属性统计 ====================
    calculateConfigStats(config) {
        const stats = {
            'phys-forward': 0,
            'crit': 0,
            'crit-speed': 0,
            'run': 0,
            'gold': 0,
            'atk': 0,
            'def': 0,
            'hp': 0
        };

        if (!config || !config.equipment) return stats;

        config.equipment.forEach(equip => {
            if (!equip.enabled) return;

            // 基础属性
            if (equip.shengsheng !== 'none') {
                const value = EQUIPMENT_VALUES[equip.value1] || 0;
                if (stats[equip.shengsheng] !== undefined) {
                    stats[equip.shengsheng] += value;
                }
            }

            // 进阶属性
            if (equip.advance1 !== 'none') {
                const value = EQUIPMENT_VALUES[equip.value1] || 0;
                if (stats[equip.advance1] !== undefined) {
                    stats[equip.advance1] += value;
                }
            }

            // 额外属性
            if (equip.extra1Value) {
                stats['atk'] += parseFloat(equip.extra1Value) || 0;
            }
            if (equip.extra2Value) {
                stats['def'] += parseFloat(equip.extra2Value) || 0;
            }
        });

        return stats;
    }

    // ==================== 生成分享链接 ====================
    generateShareCode(config) {
        // 将配置压缩为短代码
        const compressed = this.compressConfig(config);
        return btoa(JSON.stringify(compressed));
    }

    parseShareCode(code) {
        try {
            const compressed = JSON.parse(atob(code));
            return this.decompressConfig(compressed);
        } catch (e) {
            console.error('解析分享码失败:', e);
            return null;
        }
    }

    compressConfig(config) {
        // 简化配置对象，只保留必要信息
        if (!config || !config.equipment) return null;
        
        return config.equipment.map(equip => ({
            s: equip.slot.substring(0, 3),
            e: equip.enabled ? 1 : 0,
            t: equip.set,
            h: equip.shengsheng,
            a1: equip.advance1,
            v1: equip.value1
        }));
    }

    decompressConfig(compressed) {
        // 还原完整配置
        if (!compressed) return null;
        
        return {
            equipment: compressed.map(item => ({
                slot: this.expandSlotName(item.s),
                enabled: item.e === 1,
                set: item.t,
                shengsheng: item.h,
                advance1: item.a1,
                value1: item.v1,
                advance2: 'none',
                value2: 'none'
            }))
        };
    }

    expandSlotName(short) {
        const map = {
            'wea': 'weapon',
            'hea': 'head',
            'clo': 'cloth',
            'glo': 'glove',
            'sho': 'shoes',
            'ear': 'earring',
            'nec': 'necklace',
            'rin': 'ring',
            'lef': 'left-bracelet',
            'rig': 'right-bracelet',
            'arm': 'armguard'
        };
        return map[short] || short;
    }

    // ==================== 导出报告 ====================
    generateReport(config) {
        const stats = this.calculateConfigStats(config);
        const score = this.calculateScore(config);
        const efficiency = this.calculateAttributeEfficiency(stats);
        const suggestions = this.getOptimizationSuggestions(config);
        const completeness = this.checkCompleteness(config);

        const report = {
            timestamp: new Date().toLocaleString('zh-CN'),
            score: score,
            stats: stats,
            efficiency: efficiency,
            suggestions: suggestions,
            completeness: completeness,
            rating: this.calculateRating(score)
        };

        return report;
    }

    calculateRating(score) {
        if (score >= 1000) return { rank: 'SSS', color: '#ff0000', title: '神级配装' };
        if (score >= 800) return { rank: 'SS', color: '#ff6b00', title: '传说配装' };
        if (score >= 600) return { rank: 'S', color: '#ffa500', title: '史诗配装' };
        if (score >= 400) return { rank: 'A', color: '#9d4edd', title: '精良配装' };
        if (score >= 200) return { rank: 'B', color: '#3b82f6', title: '优秀配装' };
        return { rank: 'C', color: '#6b7280', title: '普通配装' };
    }

    // ==================== 属性雷达图数据 ====================
    getRadarChartData(config) {
        const stats = this.calculateConfigStats(config);
        
        return {
            labels: ['攻击', '防御', '生命', '暴击', '爆速', '穿透'],
            datasets: [{
                label: '当前配装',
                data: [
                    this.normalizeValue(stats['atk'], 0, 1000),
                    this.normalizeValue(stats['def'], 0, 500),
                    this.normalizeValue(stats['hp'], 0, 3000),
                    this.normalizeValue(stats['crit'], 0, 100),
                    this.normalizeValue(stats['crit-speed'], 0, 200),
                    this.normalizeValue(stats['phys-forward'], 0, 50)
                ]
            }]
        };
    }

    normalizeValue(value, min, max) {
        return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    }
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
    window.AdvancedFeatures = AdvancedFeatures;
}

