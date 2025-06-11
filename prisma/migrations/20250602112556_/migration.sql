-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userEmail_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_catSlug_fkey";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_catSlug_fkey" FOREIGN KEY ("catSlug") REFERENCES "Category"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
