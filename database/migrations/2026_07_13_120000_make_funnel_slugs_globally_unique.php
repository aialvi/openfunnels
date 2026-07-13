<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $usedSlugs = [];

        DB::table('funnels')
            ->select(['id', 'slug'])
            ->orderBy('id')
            ->get()
            ->each(function ($funnel) use (&$usedSlugs) {
                $baseSlug = $funnel->slug ?: 'funnel-'.$funnel->id;
                $slug = $baseSlug;
                $suffix = 2;

                while (isset($usedSlugs[$slug])) {
                    $slug = $baseSlug.'-'.$suffix;
                    $suffix++;
                }

                if ($slug !== $funnel->slug) {
                    DB::table('funnels')->where('id', $funnel->id)->update(['slug' => $slug]);
                }

                $usedSlugs[$slug] = true;
            });

        Schema::table('funnels', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'slug']);
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('funnels', function (Blueprint $table) {
            $table->dropUnique(['slug']);
            $table->unique(['user_id', 'slug']);
        });
    }
};
