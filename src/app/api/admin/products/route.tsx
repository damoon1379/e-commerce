import {prisma} from '../../../../../lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(){
    try{
    const session = await getServerSession(authOptions)
    if(!session?.user || session.user.role !== "ADMIN"){
        return NextResponse.json(
            {error:"Unauthorized"},
            {status: 401}
        )
    }

    const products = await prisma.product.findMany({
        orderBy:{createdAt:'desc'}
    })

    return NextResponse.json({products})
    }catch(error){
        console.error("Admin products error ",error)
        return NextResponse.json(
            {error:"Failed to fetch products"},
            {status: 500}
        )
    }
}

export async function POST(request:Request){
    try{
        const session = await getServerSession(authOptions)
        if(!session?.user || session.user.role !== "ADMIN"){
            return NextResponse.json(
                {error:"Unauthorized"},
                {status: 401}
            )
        }

        const {name,description,price,stock,sku,images,category} = await request.json()
        if(!name || !price || !sku){
            return NextResponse.json(
                {error:"Name,price,sku are required"},
                {status: 400}
            )
        }

        const product = await prisma.product.create({
            data:{
                name,
                description: description || '',
                price:parseFloat(price),
                stock:parseInt(stock) || 0,
                category: category || 'Uncategorized',
                sku,
                images: images || []
            }
        })

        return NextResponse.json({product},{status: 201})
    }catch(error){
        console.error("Admin product create failed ",error),
        {status: 500}
    }
}