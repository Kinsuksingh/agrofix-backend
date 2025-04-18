-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('COD', 'UPI', 'CARD', 'NETBANKING');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "buyer_name" TEXT NOT NULL,
    "buyer_contact" TEXT NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "items" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
