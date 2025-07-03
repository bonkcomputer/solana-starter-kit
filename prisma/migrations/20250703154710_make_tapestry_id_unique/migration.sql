/*
  Warnings:

  - A unique constraint covering the columns `[tapestryCommentId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Comment_tapestryCommentId_key" ON "Comment"("tapestryCommentId");
