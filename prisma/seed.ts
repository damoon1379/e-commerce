import "dotenv/config"
import {PrismaPg} from "@prisma/adapter-pg"
import {PrismaClient,Role} from "../src/generated/prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})})


async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user

  const admin = {
    name:'alireza',
    email:'alireza@gmail.com',
    password: await bcrypt.hash('123456',10),
    role:Role.ADMIN,
  }
  
  await prisma.user.create({data:admin})
  // Create sample products
  const products = [
    {
      name: 'Premium Wireless Headphones',
      description: 'High-quality noise-canceling headphones with 30-hour battery life.',
      price: 199.99,
      stock: 50,
      category: 'Electronics',
      sku: 'WH-1000XM5',
      images: ["/images/products/headphones-1.jpg","/images/products/headphones-2.jpg"],
    },
    {
      name: 'Minimalist Leather Backpack',
      description: 'Handcrafted full-grain leather backpack perfect for daily use.',
      price: 89.99,
      stock: 30,
      category: 'Fashion',
      sku: 'MBP-2024',
      images: ['/images/products/backpack-1.jpg', '/images/products/backpack-2.jpg'],
    },
    {
      name: 'Smart Fitness Tracker',
      description: 'Track your heart rate, sleep, and activity with precision.',
      price: 149.99,
      stock: 25,
      category: 'Electronics',
      sku: 'FIT-TRACK-2024',
      images: ['/images/products/fitness-1.jpg'],
    },
    {
      name: 'Organic Cotton T-Shirt',
      description: 'Eco-friendly, ultra-soft cotton t-shirt made from sustainable materials.',
      price: 29.99,
      stock: 100,
      category: 'Fashion',
      sku: 'OCT-2024-01',
      images: ['/images/products/tshirt-1.jpg','/images/products/tshirt-2.jpg'],
    },
    {
      name: 'Stainless Steel Water Bottle',
      description: 'Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free.',
      price: 34.99,
      stock: 75,
      category: 'Home & Kitchen',
      sku: 'SWB-2024',
      images: ['/images/products/bottle-1.jpg'],
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  })