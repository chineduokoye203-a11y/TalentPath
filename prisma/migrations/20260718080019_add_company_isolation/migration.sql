/*
  Warnings:

  - You are about to drop the column `location` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Profile` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `InternalOpportunity` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "size" TEXT,
    "numberOfDepartments" INTEGER,
    "logo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("createdAt", "id", "industry", "logo", "name", "numberOfDepartments", "size", "updatedAt") SELECT "createdAt", "id", "industry", "logo", "name", "numberOfDepartments", "size", "updatedAt" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE TABLE "new_InternalOpportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "requiredSkills" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "deletedAt" DATETIME,
    "postedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InternalOpportunity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InternalOpportunity_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InternalOpportunity_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InternalOpportunity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InternalOpportunity" ("createdAt", "deletedAt", "departmentId", "description", "id", "postedById", "requiredSkills", "status", "teamId", "title", "updatedAt") SELECT "createdAt", "deletedAt", "departmentId", "description", "id", "postedById", "requiredSkills", "status", "teamId", "title", "updatedAt" FROM "InternalOpportunity";
DROP TABLE "InternalOpportunity";
ALTER TABLE "new_InternalOpportunity" RENAME TO "InternalOpportunity";
CREATE TABLE "new_Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "departmentId" TEXT,
    "teamId" TEXT,
    "jobTitle" TEXT,
    "managerId" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Invitation" ("acceptedAt", "createdAt", "createdBy", "departmentId", "email", "expiresAt", "firstName", "id", "jobTitle", "lastName", "managerId", "role", "status", "teamId", "token", "updatedAt") SELECT "acceptedAt", "createdAt", "createdBy", "departmentId", "email", "expiresAt", "firstName", "id", "jobTitle", "lastName", "managerId", "role", "status", "teamId", "token", "updatedAt" FROM "Invitation";
DROP TABLE "Invitation";
ALTER TABLE "new_Invitation" RENAME TO "Invitation";
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "yearsOfExperience" INTEGER NOT NULL,
    "careerGoal" TEXT NOT NULL,
    "bio" TEXT,
    "linkedInUrl" TEXT,
    "targetRoleId" TEXT,
    "managerLevel" TEXT,
    "hrFunction" TEXT,
    "businessUnit" TEXT,
    "leadershipLevel" TEXT,
    "administrationScope" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("administrationScope", "bio", "businessUnit", "careerGoal", "createdAt", "hrFunction", "id", "jobTitle", "leadershipLevel", "linkedInUrl", "managerLevel", "targetRoleId", "updatedAt", "userId", "yearsOfExperience") SELECT "administrationScope", "bio", "businessUnit", "careerGoal", "createdAt", "hrFunction", "id", "jobTitle", "leadershipLevel", "linkedInUrl", "managerLevel", "targetRoleId", "updatedAt", "userId", "yearsOfExperience" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
