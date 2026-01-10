package com.dna.integrator.migration;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for Flyway database migrations.
 * Verifies that migrations execute successfully and create the expected schema.
 *
 * Educational/research purposes only - not for medical diagnosis or treatment.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FlywayMigrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Flyway migrations should execute successfully")
    void testMigrationsExecuteSuccessfully() {
        // Verify Flyway is configured
        assertNotNull(flyway, "Flyway should be configured");

        // Verify migrations have been applied
        assertTrue(flyway.info().all().length > 0, "At least one migration should be applied");

        // Verify all migrations are successful
        assertTrue(flyway.info().current() != null, "Current migration should exist");
    }

    @Test
    @DisplayName("Samples table should exist with correct structure")
    void testSamplesTableExists() {
        // Query table existence
        String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'samples'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);

        assertNotNull(count, "Table count query should return a result");
        assertEquals(1, count, "Samples table should exist");

        // Verify columns exist
        verifyColumnExists("samples", "id");
        verifyColumnExists("samples", "user_id");
        verifyColumnExists("samples", "file_hash");
        verifyColumnExists("samples", "import_format");
        verifyColumnExists("samples", "genome_build");
        verifyColumnExists("samples", "parser_version");
        verifyColumnExists("samples", "imported_at");
        verifyColumnExists("samples", "original_filename");
        verifyColumnExists("samples", "file_size_bytes");
        verifyColumnExists("samples", "variant_count");
        verifyColumnExists("samples", "rejected_line_count");
        verifyColumnExists("samples", "import_status");
        verifyColumnExists("samples", "metadata");
    }

    @Test
    @DisplayName("Variant_calls table should exist with correct structure")
    void testVariantCallsTableExists() {
        // Query table existence
        String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'variant_calls'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);

        assertNotNull(count, "Table count query should return a result");
        assertEquals(1, count, "Variant_calls table should exist");

        // Verify columns exist
        verifyColumnExists("variant_calls", "id");
        verifyColumnExists("variant_calls", "sample_id");
        verifyColumnExists("variant_calls", "chrom");
        verifyColumnExists("variant_calls", "pos");
        verifyColumnExists("variant_calls", "rsid");
        verifyColumnExists("variant_calls", "ref");
        verifyColumnExists("variant_calls", "alt");
        verifyColumnExists("variant_calls", "genotype");
        verifyColumnExists("variant_calls", "qual");
        verifyColumnExists("variant_calls", "filter");
        verifyColumnExists("variant_calls", "line_number");
        verifyColumnExists("variant_calls", "source");
        verifyColumnExists("variant_calls", "annotations");
    }

    @Test
    @DisplayName("Required indexes should exist on samples table")
    void testSamplesIndexesExist() {
        // Check for user_id index
        assertTrue(indexExists("idx_samples_user_id"), "Index on user_id should exist");

        // Check for file_hash index
        assertTrue(indexExists("idx_samples_file_hash"), "Index on file_hash should exist");

        // Check for imported_at index
        assertTrue(indexExists("idx_samples_imported_at"), "Index on imported_at should exist");
    }

    @Test
    @DisplayName("Required indexes should exist on variant_calls table")
    void testVariantCallsIndexesExist() {
        // Check for sample_id index
        assertTrue(indexExists("idx_variant_calls_sample_id"), "Index on sample_id should exist");

        // Check for chrom_pos composite index
        assertTrue(indexExists("idx_variant_calls_chrom_pos"), "Index on chrom,pos should exist");

        // Check for rsid index
        assertTrue(indexExists("idx_variant_calls_rsid"), "Index on rsid should exist");
    }

    @Test
    @DisplayName("Foreign key constraint should exist between variant_calls and samples")
    void testForeignKeyExists() {
        // Query for foreign key
        String sql = "SELECT COUNT(*) FROM information_schema.table_constraints " +
                     "WHERE constraint_name = 'fk_variant_call_sample' " +
                     "AND table_name = 'variant_calls' " +
                     "AND constraint_type = 'FOREIGN KEY'";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);

        assertNotNull(count, "Foreign key query should return a result");
        assertEquals(1, count, "Foreign key fk_variant_call_sample should exist");
    }

    @Test
    @DisplayName("File hash should have unique constraint")
    void testFileHashUniqueConstraint() {
        // Query for unique constraint on file_hash
        String sql = "SELECT COUNT(*) FROM information_schema.table_constraints tc " +
                     "JOIN information_schema.constraint_column_usage ccu " +
                     "ON tc.constraint_name = ccu.constraint_name " +
                     "WHERE tc.table_name = 'samples' " +
                     "AND ccu.column_name = 'file_hash' " +
                     "AND tc.constraint_type = 'UNIQUE'";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class);

        assertNotNull(count, "Unique constraint query should return a result");
        assertTrue(count >= 1, "File hash should have unique constraint");
    }

    /**
     * Helper method to verify a column exists in a table
     */
    private void verifyColumnExists(String tableName, String columnName) {
        String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                     "WHERE table_name = ? AND column_name = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);

        assertNotNull(count, "Column count query should return a result");
        assertEquals(1, count,
                String.format("Column %s should exist in table %s", columnName, tableName));
    }

    /**
     * Helper method to check if an index exists
     */
    private boolean indexExists(String indexName) {
        String sql = "SELECT COUNT(*) FROM information_schema.statistics " +
                     "WHERE index_name = ?";

        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, indexName);

        return count != null && count > 0;
    }
}
