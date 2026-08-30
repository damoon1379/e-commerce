import {prisma} from "../../../../lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(){
    try{
        const session = await getServerSession(authOptions)

        if(!session?.user){
            return NextResponse.json(
                {error: "Please login to view orders"},
                {status:401}
            )
        }

        const orders = await prisma.order.findMany({
            where:{userId:session.user.id},
            include:{
                items:{
                    include:{
                        product:{
                            select:{
                                name:true,
                                images:true
                            }
                        }
                    }
                }
            },
            orderBy:{
                createdAt:'desc'
            }
        })

        return NextResponse.json({orders})
    }catch(error){
        console.error("Orders error", error)
        return NextResponse.json(
            {error:"Failed to fetch orders"},
            {status: 500}
        )
    }
}