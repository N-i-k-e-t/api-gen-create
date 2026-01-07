-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "data_type" TEXT NOT NULL DEFAULT 'integer',
    "is_active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "department_id" TEXT NOT NULL,
    "report_date" DATETIME NOT NULL,
    "uploaded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_file_hash" TEXT,
    "api_key_id" TEXT,
    CONSTRAINT "submissions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "submissions_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metric_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submission_id" TEXT NOT NULL,
    "metric_id" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,
    CONSTRAINT "metric_values_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "metric_values_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key_prefix" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "owner_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" DATETIME
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_key_id" TEXT,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "status" TEXT NOT NULL,
    "metadata" TEXT,
    CONSTRAINT "audit_logs_actor_key_id_fkey" FOREIGN KEY ("actor_key_id") REFERENCES "api_keys" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_name_key" ON "metrics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_department_id_report_date_key" ON "submissions"("department_id", "report_date");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");
