export interface TravelPlanData {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: string
  travelers?: string
  preferences?: string
}

export class VoiceParser {
  private destinations = [
    '日本', '韩国', '泰国', '新加坡', '马来西亚', '越南', '菲律宾', '印度尼西亚',
    '中国', '香港', '台湾', '澳门', '北京', '上海', '广州', '深圳', '成都', '西安', '杭州', '南京',
    '美国', '加拿大', '英国', '法国', '德国', '意大利', '西班牙', '荷兰', '瑞士', '澳大利亚', '新西兰',
    '迪拜', '土耳其', '埃及', '南非', '巴西', '阿根廷', '墨西哥', '印度', '尼泊尔', '斯里兰卡'
  ]

  private preferences = {
    '美食': ['美食', '吃', '餐厅', '料理', '美食', '小吃', '特色菜'],
    '购物': ['购物', '买', '商店', '商场', '购物中心', '血拼'],
    '文化历史': ['文化', '历史', '古迹', '博物馆', '文化', '历史', '古建筑'],
    '自然风光': ['自然', '风景', '山水', '海滩', '公园', '山', '海', '湖', '森林'],
    '亲子游': ['亲子', '孩子', '小孩', '儿童', '带娃', '家庭游'],
    '动漫文化': ['动漫', '二次元', '卡通', '动画', '漫画'],
    '温泉休闲': ['温泉', '放松', '休闲', 'spa', '按摩'],
    '刺激冒险': ['刺激', '冒险', '极限', '跳伞', '蹦极', '过山车']
  }

  parseVoiceInput(transcript: string): TravelPlanData {
    const text = transcript.toLowerCase()
    console.log('解析语音内容:', text)
    
    const result: TravelPlanData = {}

    // 提取目的地
    result.destination = this.extractDestination(text)
    
    // 提取天数并计算日期
    const dateInfo = this.extractDateInfo(text)
    if (dateInfo) {
      result.startDate = dateInfo.startDate
      result.endDate = dateInfo.endDate
    }
    
    // 提取预算
    result.budget = this.extractBudget(text)
    
    // 提取人数
    result.travelers = this.extractTravelers(text)
    
    // 提取旅行偏好
    result.preferences = this.extractPreferences(text)

    return result
  }

  private extractDestination(text: string): string | undefined {
    // 按优先级排序，更具体的地点优先
    const sortedDestinations = this.destinations.sort((a, b) => {
      // 城市比国家更具体，优先匹配
      const cityKeywords = ['北京', '上海', '广州', '深圳', '成都', '西安', '杭州', '南京', '东京', '大阪', '首尔', '曼谷']
      const aIsCity = cityKeywords.some(keyword => a.includes(keyword))
      const bIsCity = cityKeywords.some(keyword => b.includes(keyword))
      
      if (aIsCity && !bIsCity) return -1
      if (!aIsCity && bIsCity) return 1
      return 0
    })

    for (const dest of sortedDestinations) {
      if (text.includes(dest.toLowerCase()) || text.includes(dest)) {
        return dest
      }
    }
    
    // 额外的模糊匹配
    if (text.includes('樱花') || text.includes('富士山') || text.includes('东京') || text.includes('大阪') || text.includes('京都')) {
      return '日本'
    }
    if (text.includes('泡菜') || text.includes('首尔') || text.includes('韩流')) {
      return '韩国'
    }
    if (text.includes('大象') || text.includes('曼谷') || text.includes('普吉岛')) {
      return '泰国'
    }
    
    return undefined
  }

  private extractDateInfo(text: string): { startDate: string; endDate: string } | null {
    // 提取天数
    const dayMatch = text.match(/(\d+)\s*天/)
    if (dayMatch) {
      const days = parseInt(dayMatch[1])
      const startDate = new Date()
      const endDate = new Date(startDate.getTime() + (days - 1) * 24 * 60 * 60 * 1000)
      
      return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    }

    // 提取具体日期
    const datePatterns = [
      /(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{1,2})月(\d{1,2})日/,
      /(\d{1,2})号/
    ]

    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        const now = new Date()
        let startDate: Date
        
        if (match.length === 4) {
          // 完整日期
          startDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
        } else if (match.length === 3) {
          // 月日
          startDate = new Date(now.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]))
        } else {
          // 日
          startDate = new Date(now.getFullYear(), now.getMonth(), parseInt(match[1]))
        }

        // 如果日期已过，假设是明年
        if (startDate < now) {
          startDate.setFullYear(startDate.getFullYear() + 1)
        }

        const endDate = new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000) // 默认5天

        return {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    }

    return null
  }

  private extractBudget(text: string): string | undefined {
    const budgetPatterns = [
      /(\d+)\s*万\s*元?/,
      /(\d+)\s*万/,
      /(\d+)\s*千\s*元?/,
      /(\d+)\s*千/,
      /预算\s*(\d+)/,
      /(\d+)\s*块/,
      /(\d+)\s*元?/,
      /(\d+)\s*块钱?/
    ]

    for (const pattern of budgetPatterns) {
      const match = text.match(pattern)
      if (match) {
        let amount = parseInt(match[1])
        
        // 根据单位转换
        if (text.includes/text.includes('万')) {
          amount *= 10000
        } else if (text.includes('千')) {
          amount *= 1000
        }

        // 验证金额合理性
        if (amount >= 100 && amount <= 1000000) {
          return amount.toString()
        }
      }
    }

    // 特殊情况的模糊匹配
    if (text.includes('一万') || text.includes('1万')) {
      return '10000'
    }
    if (text.includes('五千') || text.includes('5千')) {
      return '5000'
    }
    if (text.includes('两千') || text.includes('2千')) {
      return '2000'
    }

    return undefined
  }

  private extractTravelers(text: string): string | undefined {
    const peoplePatterns = [
      /(\d+)\s*人/,
      /(\d+)\s*个\s*人/,
      /(\d+)\s*位/,
      /带\s*(\d+)\s*个?\s*孩子?/,
      /(\d+)\s*个?\s*大人?/,
      /(\d+)\s*口\s*人/
    ]

    for (const pattern of peoplePatterns) {
      const match = text.match(pattern)
      if (match) {
        const count = parseInt(match[1])
        if (count >= 1 && count <= 20) {
          return count.toString()
        }
      }
    }

    return undefined
  }

  private extractPreferences(text: string): string | undefined {
    const foundPreferences: string[] = []

    for (const [category, keywords] of Object.entries(this.preferences)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          foundPreferences.push(category)
          break
        }
      }
    }

    return foundPreferences.length > 0 ? foundPreferences.join('、') : undefined
  }
}
