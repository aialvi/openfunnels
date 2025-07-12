<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('funnels', function (Blueprint $table) {
            // Drop the existing unique constraint on slug
            $table->dropUnique(['slug']);
            
            // Add a composite unique constraint for user_id and slug
            $table->unique(['user_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('funnels', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique(['user_id', 'slug']);
            
            // Add back the original unique constraint on slug
            $table->unique('slug');
        });
    }
};
