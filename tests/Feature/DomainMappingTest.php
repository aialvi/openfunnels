<?php

namespace App\Http\Controllers {
    if (! function_exists(__NAMESPACE__.'\dns_get_record')) {
        function dns_get_record(string $hostname, int $type): array|false
        {
            return \Tests\DomainMappingDnsFake::records($hostname, $type);
        }
    }
}

namespace Tests {
    class DomainMappingDnsFake
    {
        /**
         * @var array<string, array<int, array<int, array<string, string>>>>
         */
        public static array $records = [];

        public static function records(string $hostname, int $type): array|false
        {
            return self::$records[$hostname][$type] ?? false;
        }
    }
}

namespace {
    use App\Models\Funnel;
    use App\Models\User;
    use Illuminate\Foundation\Testing\RefreshDatabase;
    use Inertia\Testing\AssertableInertia as Assert;
    use Tests\DomainMappingDnsFake;

    uses(RefreshDatabase::class);

    beforeEach(function () {
        DomainMappingDnsFake::$records = [];
    });

    function createFunnelFor(User $user, array $overrides = []): Funnel
    {
        return $user->funnels()->create([
            'name' => $overrides['name'] ?? 'Launch Funnel',
            'slug' => $overrides['slug'] ?? 'launch-funnel',
            'description' => $overrides['description'] ?? null,
            'content' => $overrides['content'] ?? ['sections' => []],
            'settings' => $overrides['settings'] ?? ['backgroundColor' => '#ffffff', 'maxWidth' => '1200px'],
            'status' => $overrides['status'] ?? 'draft',
            'is_published' => $overrides['is_published'] ?? false,
            'views' => $overrides['views'] ?? 0,
            'conversions' => $overrides['conversions'] ?? 0,
            'conversion_rate' => $overrides['conversion_rate'] ?? 0,
            'published_at' => $overrides['published_at'] ?? null,
        ]);
    }

    test('a funnel owner can add a pending normalized custom domain', function () {
        $user = User::factory()->create();
        $funnel = createFunnelFor($user);

        $this->actingAs($user)
            ->post(route('domains.store', $funnel), [
                'domain' => 'https://Promo.Example.test/path',
            ])
            ->assertRedirect()
            ->assertSessionHas('success')
            ->assertSessionHas('domain.domain', 'promo.example.test');

        $this->assertDatabaseHas('domains', [
            'funnel_id' => $funnel->id,
            'domain' => 'promo.example.test',
            'is_verified' => false,
            'ssl_status' => 'pending',
        ]);
    });

    test('a user cannot add domains to another users funnel', function () {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $funnel = createFunnelFor($owner);

        $this->actingAs($otherUser)
            ->post(route('domains.store', $funnel), [
                'domain' => 'promo.example.test',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('domains', [
            'domain' => 'promo.example.test',
        ]);
    });

    test('verification checks cname records and marks subdomains verified', function () {
        config(['services.domain_mapping.cname_target' => 'cname.openfunnels.com']);

        $user = User::factory()->create();
        $funnel = createFunnelFor($user);
        $domain = $funnel->domains()->create([
            'domain' => 'promo.example.test',
            'is_verified' => false,
            'ssl_status' => 'pending',
        ]);

        DomainMappingDnsFake::$records = [
            'promo.example.test' => [
                DNS_CNAME => [
                    ['target' => 'cname.openfunnels.com.'],
                ],
            ],
        ];

        $this->actingAs($user)
            ->post(route('domains.verify', [$funnel, $domain]))
            ->assertRedirect()
            ->assertSessionHas('success')
            ->assertSessionHas('domain.is_verified', true);

        $this->assertDatabaseHas('domains', [
            'id' => $domain->id,
            'is_verified' => true,
            'ssl_status' => 'active',
        ]);
    });

    test('verified custom domain fallback renders the published funnel', function () {
        $user = User::factory()->create();
        $funnel = createFunnelFor($user, [
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $funnel->domains()->create([
            'domain' => 'promo.example.test',
            'is_verified' => true,
            'ssl_status' => 'active',
        ]);

        $this->get('http://promo.example.test/')
            ->assertOk()
            ->assertSee('funnel-preview', false);

        expect($funnel->fresh()->views)->toBe(1);
    });

    test('published funnels expose their verified custom domain as the canonical public url', function () {
        config(['publishing.custom_domain_scheme' => 'https']);

        $user = User::factory()->create();
        $funnel = createFunnelFor($user, [
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $funnel->domains()->create([
            'domain' => 'offers.example.test',
            'is_verified' => true,
            'ssl_status' => 'active',
        ]);

        $this->withoutVite();

        $this->actingAs($user)
            ->get(route('funnel.preview', $funnel))
            ->assertInertia(fn (Assert $page) => $page
                ->component('funnel-preview')
                ->where('previewMode', true)
                ->where('funnel.public_url', 'https://offers.example.test'));
    });

    test('draft funnels do not expose a shareable public url', function () {
        $user = User::factory()->create();
        $funnel = createFunnelFor($user);

        $this->withoutVite();

        $this->actingAs($user)
            ->get(route('funnel.preview', $funnel))
            ->assertInertia(fn (Assert $page) => $page
                ->component('funnel-preview')
                ->where('previewMode', true)
                ->where('funnel.public_url', null));
    });

    test('unverified custom domains are not served by the fallback route', function () {
        $user = User::factory()->create();
        $funnel = createFunnelFor($user, [
            'status' => 'published',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $funnel->domains()->create([
            'domain' => 'pending.example.test',
            'is_verified' => false,
            'ssl_status' => 'pending',
        ]);

        $this->get('http://pending.example.test/')
            ->assertNotFound();
    });
}
