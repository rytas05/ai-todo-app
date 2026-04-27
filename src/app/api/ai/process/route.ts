import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Priority } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ProcessedTask {
  title: string;
  priority: Priority;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ tasks: [] });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `以下の音声認識テキストを解析してタスクリストに変換してください。

ルール：
1. フィラー語（「えー」「あー」「うー」「まあ」「えっと」「あの」「なんか」「ちょっと」等）を削除する
2. 1つの入力に複数のタスクが含まれる場合は分割する
3. 各タスクの優先度を推測する（high/medium/low）：
   - high: 「急いで」「緊急」「今日中」「すぐ」「必ず」「重要」「大事」などのキーワード
   - low: 「後で」「時間があれば」「いつか」「余裕があれば」などのキーワード
   - medium: それ以外
4. タスクのタイトルは簡潔で行動可能な形式にする

入力テキスト：「${text}」

JSON配列形式で返してください（他のテキスト不要）：
[{"title": "タスク名", "priority": "high|medium|low"}, ...]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({
        tasks: [{ title: text.trim(), priority: "medium" as Priority }],
      });
    }

    const tasks: ProcessedTask[] = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json({
      tasks: [{ title: text.trim(), priority: "medium" as Priority }],
    });
  }
}
