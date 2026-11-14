/*
  Warnings:

  - Added the required column `password_hash` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "password_hash" TEXT NOT NULL,
ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;
