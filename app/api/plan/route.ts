import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPlan } from '@/lib/database/plans'

interface PlanRequest {
  destination: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  preferences: string
}

interface DayPlan {
  day: number
  date: string
  activities: Array<{
    time: string
    activity: string
    location: string
    estimatedCost: number
    notes?: string
  }>
}

interface TravelPlan {
  title: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  travelers: number
  preferences: string
  itinerary: {
    summary: string
    totalEstimatedCost: number
    days: DayPlan[]
    recommendations: {
      accommodation: string[]
      transportation: string[]
      dining: string[]
      activities: string[]
    }
  }
}

async function generatePlanWithLLM(request: PlanRequest): Promise<TravelPlan> {
  // 这里使用 OpenAI API 作为示例，你可以替换为其他 LLM 服务
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const prompt = `作为专业的旅行规划师，请为以下需求制定详细的旅行计划：

目的地：${request.destination}
出发日期：${request.startDate}
返回日期：${request.endDate}
预算：${request.budget} 元
同行人数：${request.travelers} 人
旅行偏好：${request.preferences}

请以 JSON 格式返回详细的旅行计划，包含以下结构：
{
  "title": "旅行计划标题",
  "destination": "目的地",
  "startDate": "出发日期",
  "endDate": "返回日期", 
  "budget": 预算金额,
  "travelers": 人数,
  "preferences": "旅行偏好",
  "itinerary": {
    "summary": "整体行程概述",
    "totalEstimatedCost": 总预估费用,
    "days": [
      {
        "day": 1,
        "date": "日期",
        "activities": [
          {
            "time": "时间",
            "activity": "活动内容",
            "location": "地点",
            "estimatedCost": 预估费用,
            "notes": "备注（可选）"
          }
        ]
      }
    ],
    "recommendations": {
      "accommodation": ["住宿推荐1", "住宿推荐2"],
      "transportation": ["交通方式1", "交通方式2"],
      "dining": ["餐厅推荐1", "餐厅推荐2"],
      "activities": ["活动推荐1", "活动推荐2"]
    }
  }
}

请确保：
1. 预算分配合理，总预估费用不超过预算
2. 行程安排符合旅行偏好
3. 包含详细的每日活动安排
4. 提供实用的推荐信息
5. 返回有效的 JSON 格式`

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的旅行规划师，擅长制定详细的旅行计划。请始终以有效的 JSON 格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    })
    const text = await response.text()
    console.log('Zhipu raw response:', text)  // 👈 打印出返回的 HTML 或 JSON

    if (!response.ok) {
      throw new Error(`ZhiPu API error: ${response.statusText}`)
    }

    const data = JSON.parse(text)
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content returned from OpenAI API')
    }

    let cleaned = content
    .replace(/```json\s*/g, '')   // 去掉代码块开头
    .replace(/```/g, '')          // 去掉代码块结尾
    .replace(/\/\/.*$/gm, '')     // 去掉单行注释
    .replace(/,\s*]/g, ']')       // 去掉多余逗号
    .replace(/,\s*}/g, '}')       // 去掉多余逗号
    .trim()


    // 尝试解析 JSON
    // 🧩 提取 JSON 主体（防止前后有说明文字）
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON object found in LLM output')
    }

    const result = JSON.parse(jsonMatch[0])
    return result
  } catch (error) {
    console.error('LLM API error:', error)
    throw new Error('Failed to generate travel plan with LLM')
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 解析请求体
    const body: PlanRequest = await request.json()
    
    // 验证必需字段
    if (!body.destination || !body.startDate || !body.endDate || !body.budget || !body.travelers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 生成旅行计划
    const travelPlan = await generatePlanWithLLM(body)
    
    // 保存到数据库
    const savedPlan = await createPlan({
      user_id: user.id,
      title: travelPlan.title,
      destination: travelPlan.destination,
      start_date: travelPlan.startDate,
      end_date: travelPlan.endDate,
      budget: travelPlan.budget,
      travelers: travelPlan.travelers,
      preferences: travelPlan.preferences,
      itinerary: travelPlan.itinerary,
    })

    return NextResponse.json(savedPlan)
  } catch (error) {
    console.error('Plan creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}


