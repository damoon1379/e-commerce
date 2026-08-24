import {prisma} from "../../../../../lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request:Request){
    try{
        const {name,password,email} = await request.json()

        if(!name || !password || !email){
            return NextResponse.json(
                {message:"Missing required fields"},
                {status:400}
            )
        }

        const existingUser = await prisma.user.findUnique({
            where:{email}
        })

        if(existingUser){
            return NextResponse.json(
                {message:"User already exists"},
                {status:400}
            )
        }

        const hashedPassword = await bcrypt.hash(password,10)

        //create user
        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        })

        //create cart for user
        await prisma.cart.create({
            data:{
                userId:user.id
            }
        })

        return NextResponse.json(
            {message:"User created successfully"},
            {status:201}
        )

    }catch(error){
        console.error("Registtration error", error)
        return NextResponse.json(
            {message:"Internal server error"},
            {status:500}
        )
    }
}