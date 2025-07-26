// Database Utilities
// Comprehensive database utilities with error handling, migrations, and query helpers

import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { logger } from '@/utils/logger';
import { getPool } from '@/config/database';

// Database error types
export class DatabaseError extends Error {
    constructor(
        message: string,
        public code?: string,
        public detail?: string,
        public constraint?: string
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class MigrationError extends Error {
    constructor(message: string, public migrationFile?: string) {
        super(message);
        this.name = 'MigrationError';
    }
}

// Query builder helpers
export interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    where?: Record<string, any>;
}

export interface PaginationOptions {
    page: number;
    limit: number;
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

// Database transaction wrapper
export async function withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Transaction rolled back:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Safe query execution with error handling
export async function executeQuery<T extends QueryResultRow = any>(
    query: string,
    params: any[] = [],
    client?: PoolClient
): Promise<QueryResult<T>> {
    const executor = client || getPool();

    try {
        logger.debug('Executing query:', { query, params });
        const result = await executor.query<T>(query, params);
        logger.debug('Query result:', { rowCount: result.rowCount });
        return result;
    } catch (error: any) {
        logger.error('Database query error:', {
            query,
            params,
            error: error.message,
            code: error.code,
            detail: error.detail
        });

        throw new DatabaseError(
            error.message,
            error.code,
            error.detail,
            error.constraint
        );
    }
}

// Build WHERE clause from object
export function buildWhereClause(
    conditions: Record<string, any>,
    startIndex: number = 1
): { clause: string; params: any[] } {
    const params: any[] = [];
    const clauses: string[] = [];
    let paramIndex = startIndex;

    for (const [key, value] of Object.entries(conditions)) {
        if (value === null) {
            clauses.push(`${key} IS NULL`);
        } else if (value === undefined) {
            continue; // Skip undefined values
        } else if (Array.isArray(value)) {
            if (value.length > 0) {
                const placeholders = value.map(() => `$${paramIndex++}`).join(', ');
                clauses.push(`${key} IN (${placeholders})`);
                params.push(...value);
            }
        } else if (typeof value === 'string' && value.includes('%')) {
            clauses.push(`${key} ILIKE $${paramIndex++}`);
            params.push(value);
        } else {
            clauses.push(`${key} = $${paramIndex++}`);
            params.push(value);
        }
    }

    return {
        clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
        params
    };
}

// Build ORDER BY clause
export function buildOrderByClause(
    orderBy?: string,
    orderDirection: 'ASC' | 'DESC' = 'ASC'
): string {
    if (!orderBy) return '';

    // Sanitize column name to prevent SQL injection
    const sanitizedColumn = orderBy.replace(/[^a-zA-Z0-9_]/g, '');
    return `ORDER BY ${sanitizedColumn} ${orderDirection}`;
}

// Build LIMIT and OFFSET clause
export function buildLimitOffsetClause(
    limit?: number,
    offset?: number,
    startIndex: number = 1
): { clause: string; params: any[] } {
    const params: any[] = [];
    let clause = '';
    let paramIndex = startIndex;

    if (limit !== undefined) {
        clause += ` LIMIT $${paramIndex++}`;
        params.push(limit);
    }

    if (offset !== undefined) {
        clause += ` OFFSET $${paramIndex++}`;
        params.push(offset);
    }

    return { clause, params };
}

// Generic paginated query function
export async function executePaginatedQuery<T extends QueryResultRow>(
    baseQuery: string,
    countQuery: string,
    params: any[] = [],
    options: PaginationOptions,
    client?: PoolClient
): Promise<PaginationResult<T>> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await executeQuery<{ count: string }>(
        countQuery,
        params,
        client
    );
    const total = parseInt(countResult.rows[0]?.count || '0');

    // Get paginated data
    const { clause: limitClause, params: limitParams } = buildLimitOffsetClause(limit, offset, params.length + 1);
    const dataQuery = `${baseQuery} ${limitClause}`;
    const dataResult = await executeQuery<T>(
        dataQuery,
        [...params, ...limitParams],
        client
    );

    const total_pages = Math.ceil(total / limit);

    return {
        data: dataResult.rows,
        pagination: {
            page,
            limit,
            total,
            total_pages,
            has_next: page < total_pages,
            has_prev: page > 1
        }
    };
}

// Check if table exists
export async function tableExists(tableName: string): Promise<boolean> {
    const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;

    const result = await executeQuery<{ exists: boolean }>(query, [tableName]);
    return result.rows[0]?.exists || false;
}

// Check if column exists in table
export async function columnExists(tableName: string, columnName: string): Promise<boolean> {
    const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1 
      AND column_name = $2
    );
  `;

    const result = await executeQuery<{ exists: boolean }>(query, [tableName, columnName]);
    return result.rows[0]?.exists || false;
}

// Migration management
export interface Migration {
    filename: string;
    version: number;
    description: string;
    sql: string;
}

// Create migrations table if it doesn't exist
export async function createMigrationsTable(): Promise<void> {
    const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      version INTEGER UNIQUE NOT NULL,
      filename VARCHAR(255) NOT NULL,
      description TEXT,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    await executeQuery(query);
    logger.info('Migrations table created or already exists');
}

// Get executed migrations
export async function getExecutedMigrations(): Promise<number[]> {
    await createMigrationsTable();

    const query = 'SELECT version FROM migrations ORDER BY version';
    const result = await executeQuery<{ version: number }>(query);

    return result.rows.map(row => row.version);
}

// Load migration files from directory
export function loadMigrationFiles(migrationsDir: string): Migration[] {
    try {
        const files = readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        return files.map(filename => {
            const filePath = join(migrationsDir, filename);
            const sql = readFileSync(filePath, 'utf8');

            // Extract version from filename (e.g., 001_create_tables.sql -> 1)
            const versionMatch = filename.match(/^(\d+)_/);
            const version = versionMatch ? parseInt(versionMatch[1]) : 0;

            // Extract description from filename
            const description = filename
                .replace(/^\d+_/, '')
                .replace(/\.sql$/, '')
                .replace(/_/g, ' ');

            return {
                filename,
                version,
                description,
                sql
            };
        });
    } catch (error) {
        logger.error('Failed to load migration files:', error);
        throw new MigrationError(`Failed to load migration files: ${error}`);
    }
}

// Execute a single migration
export async function executeMigration(migration: Migration): Promise<void> {
    await withTransaction(async (client) => {
        try {
            // Execute the migration SQL
            await client.query(migration.sql);

            // Record the migration as executed
            await client.query(
                'INSERT INTO migrations (version, filename, description) VALUES ($1, $2, $3)',
                [migration.version, migration.filename, migration.description]
            );

            logger.info(`Migration ${migration.filename} executed successfully`);
        } catch (error) {
            logger.error(`Migration ${migration.filename} failed:`, error);
            throw new MigrationError(
                `Migration ${migration.filename} failed: ${error}`,
                migration.filename
            );
        }
    });
}

// Run pending migrations
export async function runMigrations(migrationsDir: string = 'database/migrations'): Promise<void> {
    try {
        const migrations = loadMigrationFiles(migrationsDir);
        const executedVersions = await getExecutedMigrations();

        const pendingMigrations = migrations.filter(
            migration => !executedVersions.includes(migration.version)
        );

        if (pendingMigrations.length === 0) {
            logger.info('No pending migrations');
            return;
        }

        logger.info(`Running ${pendingMigrations.length} pending migrations`);

        for (const migration of pendingMigrations) {
            await executeMigration(migration);
        }

        logger.info('All migrations completed successfully');
    } catch (error) {
        logger.error('Migration process failed:', error);
        throw error;
    }
}

// Database health check
export async function checkDatabaseHealth(): Promise<{
    connected: boolean;
    version?: string;
    error?: string;
}> {
    try {
        const result = await executeQuery<{ version: string }>('SELECT version()');
        return {
            connected: true,
            version: result.rows[0]?.version
        };
    } catch (error: any) {
        return {
            connected: false,
            error: error.message
        };
    }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<number> {
    const query = `
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR refresh_expires_at < NOW()
  `;

    const result = await executeQuery(query);
    const deletedCount = result.rowCount || 0;

    if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired sessions`);
    }

    return deletedCount;
}

// Clean up old audit logs (older than specified days)
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
    const query = `
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
  `;

    const result = await executeQuery(query);
    const deletedCount = result.rowCount || 0;

    if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old audit logs`);
    }

    return deletedCount;
}

// Vacuum and analyze tables for performance
export async function optimizeDatabase(): Promise<void> {
    const tables = [
        'users', 'roles', 'permissions', 'role_permissions',
        'user_permissions', 'user_sessions', 'audit_logs'
    ];

    for (const table of tables) {
        try {
            await executeQuery(`VACUUM ANALYZE ${table}`);
            logger.debug(`Optimized table: ${table}`);
        } catch (error) {
            logger.warn(`Failed to optimize table ${table}:`, error);
        }
    }

    logger.info('Database optimization completed');
}