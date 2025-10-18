import { NextRequest, NextResponse } from 'next/server'

interface VoiceParseRequest {
  transcript: string
}

interface ParsedTravelData {
  destination?: string
  startDate?: string
  endDate?: string
  budget?: number
  travelers?: number
  preferences?: string
}

async function parseVoiceWithLLM(transcript: string): Promise<ParsedTravelData> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }
  // ✅ 自动获取今天日期（格式：YYYY-MM-DD）
  const today = new Date()
  const formattedDate = today.toISOString().split('T')[0]

  const prompt = `你是一个专业的旅行规划助手。请分析用户的语音输入内容，并提取出旅行规划所需的信息。

用户语音输入内容：${transcript}

请从语音内容中提取以下信息，并以JSON格式返回：
1. destination: 目的地（如果有提到具体城市或国家）
2. startDate: 出发日期（格式：YYYY-MM-DD，如果只提到天数，请从今天开始计算，今天是${formattedDate}）
3. endDate: 返回日期（格式：YYYY-MM-DD）
4. budget: 预算金额（数字，单位：元）
5. travelers: 同行人数（数字）
6. preferences: 旅行偏好（如：美食、购物、文化历史、自然风光、亲子游等，多个偏好用顿号分隔）

注意：
- 如果某个信息没有明确提到，请返回null而不是空字符串
- 如果提到"X天"，请从今天开始计算日期
- 预算识别要准确，如"1万元"应该是10000，"5千元"应该是5000
- 人数识别要准确，如"2个人"应该是2，"带孩子"可能是3人（2大人+1小孩）
- 偏好识别要准确，如"喜欢美食"提取为"美食"

请只返回JSON格式的数据，不要包含其他说明文字。`

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
            content: '你是一个专业的旅行规划助手，擅长从语音输入中提取旅行信息。请始终以有效的JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // 降低随机性，提高准确性
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`智谱API错误: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('智谱API未返回内容')
    }

    // 清理和解析JSON
    let cleaned = content
      .replace(/```json\s*/g, '')   // 去掉代码块开头
      .replace(/```/g, '')          // 去掉代码块结尾
      .replace(/\/\/.*$/gm, '')     // 去掉单行注释
      .replace(/,\s*]/g, ']')       // 去掉多余逗号
      .replace(/,\s*}/g, '}')       // 去掉多余逗号
      .trim()

    // 提取JSON对象
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('未找到有效的JSON格式')
    }

    const result = JSON.parse(jsonMatch[0])
    
    // 验证和转换数据
    const parsedData: ParsedTravelData = {}
    
    if (result.destination && result.destination !== 'null') {
      parsedData.destination = result.destination
    }
    
    if (result.startDate && result.startDate !== 'null') {
      parsedData.startDate = result.startDate
    }
    
    if (result.endDate && result.endDate !== 'null') {
      parsedData.endDate = result.endDate
    }
    
    if (result.budget && result.budget !== 'null') {
      parsedData.budget = parseInt(result.budget)
    }
    
    if (result.travelers && result.travelers !== 'null') {
      parsedData.travelers = parseInt(result.travelers)
    }
    
    if (result.preferences && result.preferences !== 'null') {
      parsedData.preferences = result.preferences
    }

    return parsedData
  } catch (error) {
    console.error('智谱API解析错误:', error)
    throw new Error('语音内容解析失败')
  }
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: VoiceParseRequest = await request.json()
    
    if (!body.transcript) {
      return NextResponse.json({ error: '缺少语音文本内容' }, { status: 400 })
    }

    // 使用智谱大模型解析语音内容
    const parsedData = await parseVoiceWithLLM(body.transcript)
    
    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('语音解析错误:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '语音解析失败' },
      { status: 500 }
    )
  }
}

