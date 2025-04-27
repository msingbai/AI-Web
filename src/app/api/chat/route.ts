// 后端API
/**
 * 将消息传给deepseek，得到result进行流式输出到message
 */
import { streamText } from 'ai';
import {createDeepSeek} from "@ai-sdk/deepseek";
import {auth} from "@clerk/nextjs/server";
import {createMessage} from "@/db";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.BASE_URL
})

export async function POST(req: Request) {
    const { messages, model, chat_id, chat_user_id } = await req.json();

    const {userId} = await auth()
    if (!userId ) {
        return new Response(JSON.stringify({error: "Unauthorized"}), {status: 401})
    }else {
        if (userId !== chat_user_id){
            console.log(chat_user_id,'分割线',userId)
            return new Response(JSON.stringify({error: "Unauthorized"}), {status: 402})
        }
    }

    //存入用户信息
    const lastMessage = messages[messages.length - 1]
    await createMessage (chat_id, lastMessage.content, lastMessage.role)

    const result = streamText({
        model: deepseek('deepseek-v3'),
        system: 'You are a helpful assistant.',
        messages,
        onFinish:async (result) => {
            await createMessage(chat_id,result.text,'assistant')
        }
    });

    return result.toDataStreamResponse();
}