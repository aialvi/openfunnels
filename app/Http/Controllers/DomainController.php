<?php

namespace App\Http\Controllers;

use App\Models\Domain;
use App\Models\Funnel;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DomainController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Funnel $funnel)
    {
        $this->authorize('update', $funnel);

        $normalizedDomain = $this->normalizeDomain((string) $request->input('domain'));
        $request->merge(['domain' => $normalizedDomain]);

        $request->validate([
            'domain' => [
                'required',
                'string',
                'max:255',
                Rule::unique('domains', 'domain'),
                'regex:/^(?!:\/\/)(?=.{1,255}$)((.{1,63}\.){1,127}(?![0-9]*$)[a-z0-9-]+)$/i',
            ],
        ]);

        $domain = $funnel->domains()->create([
            'domain' => $normalizedDomain,
            'is_verified' => false,
            'ssl_status' => 'pending',
        ]);

        return back()
            ->with('success', 'Domain added successfully. Please configure your DNS settings.')
            ->with('domain', $this->serializeDomain($domain));
    }

    public function verify(Request $request, Funnel $funnel, Domain $domain)
    {
        $this->authorize('update', $funnel);

        if ($domain->funnel_id !== $funnel->id) {
            abort(403);
        }

        $host = $domain->domain;
        $isSubdomain = substr_count($host, '.') >= 2;

        $isVerified = false;

        // Note: For local testing without real DNS, you can mock this or use a config flag.
        // In production, we strictly use dns_get_record.
        if (app()->environment('local') && $request->has('force_verify')) {
            $isVerified = true;
        } else {
            if ($isSubdomain) {
                // Check CNAME
                $records = @dns_get_record($host, DNS_CNAME);
                $expectedTarget = $this->expectedCnameTarget();

                if ($records) {
                    foreach ($records as $record) {
                        $target = isset($record['target']) ? $this->normalizeDnsTarget($record['target']) : null;

                        if ($target === $expectedTarget) {
                            $isVerified = true;
                            break;
                        }
                    }
                }
            } else {
                // Check A record
                $records = @dns_get_record($host, DNS_A);
                $expectedAddress = $this->expectedARecordAddress($request);

                if ($records && $expectedAddress) {
                    foreach ($records as $record) {
                        if (($record['ip'] ?? null) === $expectedAddress) {
                            $isVerified = true;
                            break;
                        }
                    }
                }
            }
        }

        if ($isVerified) {
            $domain->update([
                'is_verified' => true,
                'ssl_status' => 'active',
            ]);

            return back()
                ->with('success', 'Domain verified successfully! SSL provisioning may take a few minutes.')
                ->with('domain', $this->serializeDomain($domain->fresh()));
        }

        return back()->withErrors(['domain' => 'We couldn\'t verify this yet. DNS changes can take up to 24 hours. Please try again later.']);
    }

    public function destroy(Request $request, Domain $domain)
    {
        $this->authorize('update', $domain->funnel);

        $domain->delete();

        return back()->with('success', 'Domain removed successfully.');
    }

    private function normalizeDomain(string $domain): string
    {
        $domain = trim(strtolower($domain));
        $domain = preg_replace('#^https?://#', '', $domain) ?? $domain;
        $domain = preg_replace('#/.*$#', '', $domain) ?? $domain;

        return rtrim($domain, '.');
    }

    private function expectedCnameTarget(): string
    {
        $target = config('services.domain_mapping.cname_target')
            ?: parse_url(config('app.url'), PHP_URL_HOST)
            ?: 'cname.openfunnels.com';

        return $this->normalizeDnsTarget($target);
    }

    private function expectedARecordAddress(Request $request): ?string
    {
        return config('services.domain_mapping.a_record_ip')
            ?: $request->server('SERVER_ADDR');
    }

    private function normalizeDnsTarget(string $target): string
    {
        return rtrim(strtolower($target), '.');
    }

    /**
     * @return array{id:int,domain:string,is_verified:bool,ssl_status:string|null}
     */
    private function serializeDomain(Domain $domain): array
    {
        return [
            'id' => $domain->id,
            'domain' => $domain->domain,
            'is_verified' => $domain->is_verified,
            'ssl_status' => $domain->ssl_status,
        ];
    }
}
