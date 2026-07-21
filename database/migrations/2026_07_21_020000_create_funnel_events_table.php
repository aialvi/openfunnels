<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funnel_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('funnel_id')->constrained()->cascadeOnDelete();
            $table->string('event_type', 40);
            $table->string('session_id', 64)->nullable();
            $table->string('form_id', 100)->nullable();
            $table->json('attribution')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['funnel_id', 'event_type', 'occurred_at']);
            $table->index(['funnel_id', 'session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funnel_events');
    }
};
