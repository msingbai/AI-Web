import {unauthorized} from "next/navigation";
import {getChat} from "@/db";
import {auth} from "@clerk/nextjs/server";

export async function POST(req:Request){
    const {chat_id} = await req.json()

    //判断是否登录，登陆后方可读取
    const { userId } = await auth()
    if (!userId) {
        return new Response(JSON.stringify({error:'unauthorized'}),{
            status: 401,
        })
    }

    //返回chat
    const chat = await getChat(chat_id,userId)
    //console.log(chat)
    return new Response(JSON.stringify(chat),{status: 200})
}