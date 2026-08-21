CREATE TYPE "RepositoryStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');
CREATE TYPE "ChatRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "externalAuthId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Repository" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "vectorRepositoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "RepositoryStatus" NOT NULL DEFAULT 'PROCESSING',
    "filesProcessed" INTEGER NOT NULL DEFAULT 0,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatSession" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "userId" UUID,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmbeddingMetadata" (
    "id" UUID NOT NULL,
    "repositoryId" UUID NOT NULL,
    "vectorRepositoryId" TEXT NOT NULL,
    "sourceFile" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "contentLength" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmbeddingMetadata_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "User"("externalAuthId");
CREATE UNIQUE INDEX "Repository_vectorRepositoryId_key" ON "Repository"("vectorRepositoryId");
CREATE INDEX "Repository_userId_ingestedAt_idx" ON "Repository"("userId", "ingestedAt");
CREATE INDEX "Repository_ingestedAt_idx" ON "Repository"("ingestedAt");
CREATE INDEX "ChatSession_repositoryId_updatedAt_idx" ON "ChatSession"("repositoryId", "updatedAt");
CREATE INDEX "ChatSession_userId_updatedAt_idx" ON "ChatSession"("userId", "updatedAt");
CREATE INDEX "ChatMessage_sessionId_createdAt_idx" ON "ChatMessage"("sessionId", "createdAt");
CREATE UNIQUE INDEX "EmbeddingMetadata_vectorRepositoryId_sourceFile_chunkIndex_key" ON "EmbeddingMetadata"("vectorRepositoryId", "sourceFile", "chunkIndex");
CREATE INDEX "EmbeddingMetadata_repositoryId_sourceFile_idx" ON "EmbeddingMetadata"("repositoryId", "sourceFile");

ALTER TABLE "Repository" ADD CONSTRAINT "Repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmbeddingMetadata" ADD CONSTRAINT "EmbeddingMetadata_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
