const AnimalStates = {
  // 數值定義
  AVAILABLE: 0,
  IN_CONTACT: 1,
  ADOPTED: 2,
  LOST: 3,
  FOUND: 4,
  REMOVED_FROM_API: 5,

  // 數字轉中文
  toText: {
    0: '可領養',
    1: '聯絡中',
    2: '已領養',
    3: '協尋中',
    4: '已找到',
    5: '政府API已移除'
  },

  // 中文轉數字
  fromText: {
    可領養: 0,
    聯絡中: 1,
    已領養: 2,
    協尋中: 3,
    已找到: 4,
    政府API已移除: 5
  },

}

module.exports = AnimalStates
