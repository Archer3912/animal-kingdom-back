
function getKindByVariety(variety) {
  if (!variety ) return '其他'
  const kindKeywords = {
    狗: [
      '犬',
      '狗',
      '哈士奇',
      '臘腸',
      '約克夏',
      '雪納瑞',
      '吉娃娃',
      '傑克羅素梗',
      '馬爾濟斯',
      '比特',
      '大白熊'
    ],
    貓: ['貓'],
    鳥: ['鳥', '鴿', '鷹', '鴨', '鵝', '鸚鵡'],
    兔: ['兔'],
    其他: ['鼠', '龜', '蜥蜴', '蛇']
  }
  const cleanedVariety = variety

  for (let kind in kindKeywords) {
    const keywords = kindKeywords[kind]
    for (let i = 0; i < keywords.length; i++) {
      if (cleanedVariety.includes(keywords[i])) {
        return kind
      }
    }
  }

  return '其他'
}



module.exports = getKindByVariety
