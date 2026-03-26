// 游戏数据配置文件
// 这个文件包含了所有游戏相关的数值配置，方便后续维护和更新

const GAME_CONFIG = {
    // 套装配置
    sets: [
        { value: 'none', name: '未装备', bonus: {} },
        { value: 'flame', name: '烈焰套装', bonus: { atk: 50, crit: 15 } },
        { value: 'frost', name: '冰霜套装', bonus: { def: 40, hp: 100 } },
        { value: 'thunder', name: '雷霆套装', bonus: { 'crit-speed': 20, atk: 30 } },
        { value: 'shadow', name: '暗影套装', bonus: { 'phys-forward': 25, crit: 10 } },
        { value: 'light', name: '光明套装', bonus: { hp: 120, def: 35 } }
    ],

    // 基础属性类型
    baseAttributes: [
        { value: 'none', name: '未选择' },
        { value: 'atk', name: '攻击' },
        { value: 'def', name: '防御' },
        { value: 'hp', name: '生命' },
        { value: 'crit', name: '暴击' },
        { value: 'crit-speed', name: '爆速' }
    ],

    // 进阶属性配置
    advancedAttributes: [
        { value: 'none', name: '未选择' },
        { value: 'phys-forward', name: '物理穿透' },
        { value: 'magic-forward', name: '魔法穿透' },
        { value: 'crit-rate', name: '暴击率' },
        { value: 'crit-dmg', name: '暴击伤害' },
        { value: 'atk-speed', name: '攻击速度' },
        { value: 'move-speed', name: '移动速度' },
        { value: 'hp-regen', name: '生命恢复' },
        { value: 'mp-regen', name: '法力恢复' }
    ],

    // 属性数值等级
    valueGrades: {
        'none': { value: 0, name: '《未配置》' },
        'low': { value: 10, name: '低' },
        'mid': { value: 20, name: '中' },
        'high': { value: 30, name: '高' },
        'super': { value: 45, name: '极高' },
        'max': { value: 60, name: '极限' }
    },

    // 镶嵌宝石配置
    gems: [
        { value: 'none', name: '未镶嵌' },
        { value: 'ruby', name: '红宝石(攻击)', attr: 'atk', bonus: 25 },
        { value: 'sapphire', name: '蓝宝石(防御)', attr: 'def', bonus: 20 },
        { value: 'emerald', name: '绿宝石(生命)', attr: 'hp', bonus: 50 },
        { value: 'diamond', name: '钻石(暴击)', attr: 'crit', bonus: 15 },
        { value: 'topaz', name: '黄玉(爆速)', attr: 'crit-speed', bonus: 12 }
    ],

    // 装备槽位配置
    slots: {
        'weapon': {
            name: '武器',
            icon: '⚔️',
            hasExtra: true,
            baseAttrMultiplier: 1.5
        },
        'head': {
            name: '头部',
            icon: '👑',
            hasExtra: false,
            baseAttrMultiplier: 1.0
        },
        'cloth': {
            name: '衣服',
            icon: '👔',
            hasExtra: false,
            baseAttrMultiplier: 1.2
        },
        'glove': {
            name: '护手',
            icon: '🧤',
            hasExtra: false,
            baseAttrMultiplier: 0.8
        },
        'shoes': {
            name: '鞋子',
            icon: '👢',
            hasExtra: false,
            baseAttrMultiplier: 0.8
        },
        'earring': {
            name: '耳坠',
            icon: '💎',
            hasExtra: false,
            baseAttrMultiplier: 0.6
        },
        'necklace': {
            name: '项链',
            icon: '📿',
            hasExtra: false,
            baseAttrMultiplier: 1.0
        },
        'ring': {
            name: '戒指',
            icon: '💍',
            hasExtra: false,
            baseAttrMultiplier: 0.7
        },
        'left-bracelet': {
            name: '左手环',
            icon: '⭕',
            hasExtra: false,
            baseAttrMultiplier: 0.7
        },
        'right-bracelet': {
            name: '右手环',
            icon: '⭕',
            hasExtra: false,
            baseAttrMultiplier: 0.7
        },
        'armguard': {
            name: '护臂',
            icon: '🛡️',
            hasExtra: false,
            baseAttrMultiplier: 0.9
        }
    },

    // 属性计算公式配置
    attributeFormulas: {
        'phys-forward': {
            name: '物往',
            baseValue: 5.0000,
            conversionRate: 0.05, // 100点数值 = 5%
            unit: '%',
            color: '#ff6b6b'
        },
        'crit': {
            name: '暴击',
            baseValue: 0.0000,
            conversionRate: 0.10, // 100点数值 = 10%
            unit: '%',
            color: '#f59e0b'
        },
        'crit-speed': {
            name: '爆速',
            baseValue: 6.0000,
            conversionRate: 0.08,
            unit: '%',
            color: '#8b5cf6'
        },
        'run': {
            name: '奔走',
            baseValue: 5.0000,
            conversionRate: 0.03,
            unit: '%',
            color: '#10b981'
        },
        'gold': {
            name: '金运',
            baseValue: 0.0000,
            conversionRate: 0.02,
            unit: '%',
            color: '#fbbf24'
        },
        'atk': {
            name: '攻击',
            baseValue: 100,
            conversionRate: 1,
            unit: '',
            color: '#ef4444'
        },
        'def': {
            name: '防御',
            baseValue: 50,
            conversionRate: 1,
            unit: '',
            color: '#3b82f6'
        },
        'hp': {
            name: '生命',
            baseValue: 1000,
            conversionRate: 1,
            unit: '',
            color: '#22c55e'
        }
    },

    // 套装效果激活条件
    setBonus: {
        2: { multiplier: 0.5, description: '2件套效果：属性加成50%' },
        4: { multiplier: 1.0, description: '4件套效果：属性加成100%' },
        6: { multiplier: 1.5, description: '6件套效果：属性加成150%' }
    },

    // 品质配置
    quality: {
        'common': { name: '普通', color: '#9ca3af', multiplier: 1.0 },
        'uncommon': { name: '优秀', color: '#22c55e', multiplier: 1.2 },
        'rare': { name: '精良', color: '#3b82f6', multiplier: 1.5 },
        'epic': { name: '史诗', color: '#a855f7', multiplier: 2.0 },
        'legendary': { name: '传说', color: '#f59e0b', multiplier: 3.0 },
        'mythic': { name: '神话', color: '#ef4444', multiplier: 5.0 }
    },

    // 推荐配装方案
    presets: [
        {
            name: '暴击流',
            description: '最大化暴击率和暴击伤害',
            icon: '⚡',
            recommended: {
                primaryStat: 'crit',
                secondaryStat: 'crit-speed',
                sets: ['thunder', 'shadow']
            }
        },
        {
            name: '生存流',
            description: '提升生命和防御，适合坦克',
            icon: '🛡️',
            recommended: {
                primaryStat: 'hp',
                secondaryStat: 'def',
                sets: ['frost', 'light']
            }
        },
        {
            name: '输出流',
            description: '最大化攻击力',
            icon: '⚔️',
            recommended: {
                primaryStat: 'atk',
                secondaryStat: 'phys-forward',
                sets: ['flame', 'shadow']
            }
        },
        {
            name: '均衡流',
            description: '攻守兼备的全能配装',
            icon: '⚖️',
            recommended: {
                primaryStat: 'atk',
                secondaryStat: 'hp',
                sets: ['flame', 'light']
            }
        }
    ],

    // UI配置
    ui: {
        animationDuration: 300,
        toastDuration: 3000,
        maxSavedConfigs: 20,
        autoSaveDelay: 500
    }
};

// 导出配置（如果使用模块化）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GAME_CONFIG;
}

