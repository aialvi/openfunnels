<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funnel_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->json('content');
            $table->json('settings');
            $table->unsignedTinyInteger('weight')->default(50);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::table('funnel_events', function (Blueprint $table) {
            $table->foreignId('variant_id')->nullable()->after('funnel_id')->constrained('funnel_variants')->nullOnDelete();
        });

        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->foreignId('variant_id')->nullable()->after('funnel_id')->constrained('funnel_variants')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contact_submissions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('variant_id');
        });
        Schema::table('funnel_events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('variant_id');
        });
        Schema::dropIfExists('funnel_variants');
    }
};
