<?php

namespace Database\Seeders;

use App\Models\Funnel;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FunnelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user or create one for testing
        $user = User::first();
        
        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        // Create sample funnels
        $funnels = [
            [
                'name' => 'Lead Magnet Landing Page',
                'description' => 'High-converting lead magnet page for email list building',
                'content' => [
                    [
                        'id' => 'block-1',
                        'type' => 'text',
                        'content' => [
                            'text' => 'Get Your Free Marketing Guide',
                            'fontSize' => '32',
                            'color' => '#1f2937',
                            'textAlign' => 'center',
                        ],
                        'position' => ['x' => 50, 'y' => 100],
                    ],
                    [
                        'id' => 'block-2',
                        'type' => 'button',
                        'content' => [
                            'text' => 'Download Now',
                            'backgroundColor' => '#3b82f6',
                            'color' => '#ffffff',
                            'borderRadius' => '8',
                        ],
                        'position' => ['x' => 50, 'y' => 200],
                    ],
                ],
                'settings' => [
                    'backgroundColor' => '#ffffff',
                    'fontFamily' => 'Inter',
                ],
                'status' => 'published',
                'is_published' => true,
                'views' => 2543,
                'conversions' => 189,
                'published_at' => now()->subDays(7),
            ],
            [
                'name' => 'Product Launch Funnel',
                'description' => 'Complete product launch sequence with multiple pages',
                'content' => [
                    [
                        'id' => 'block-1',
                        'type' => 'text',
                        'content' => [
                            'text' => 'Revolutionary New Product',
                            'fontSize' => '28',
                            'color' => '#1f2937',
                        ],
                        'position' => ['x' => 50, 'y' => 80],
                    ],
                ],
                'settings' => [
                    'backgroundColor' => '#f8fafc',
                ],
                'status' => 'draft',
                'is_published' => false,
                'views' => 156,
                'conversions' => 12,
            ],
            [
                'name' => 'Webinar Registration',
                'description' => 'Webinar sign-up page with countdown timer',
                'content' => [],
                'settings' => [],
                'status' => 'published',
                'is_published' => true,
                'views' => 1897,
                'conversions' => 324,
                'published_at' => now()->subDays(3),
            ],
        ];

        foreach ($funnels as $funnelData) {
            $funnel = $user->funnels()->create($funnelData);
            
            // Update conversion rate
            if ($funnel->views > 0) {
                $funnel->update([
                    'conversion_rate' => ($funnel->conversions / $funnel->views) * 100
                ]);
            }
        }
    }
}
