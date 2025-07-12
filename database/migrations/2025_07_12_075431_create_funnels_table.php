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
        Schema::create('funnels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('content')->nullable(); // Store the funnel blocks/content
            $table->json('settings')->nullable(); // Store funnel settings
            $table->boolean('is_published')->default(false);
            $table->string('status')->default('draft'); // draft, published, archived
            $table->integer('views')->default(0);
            $table->integer('conversions')->default(0);
            $table->decimal('conversion_rate', 5, 2)->default(0.00);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funnels');
    }
};
