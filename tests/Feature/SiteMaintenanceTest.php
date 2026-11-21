<?php

namespace Tests\Feature;

use App\Support\SiteMaintenance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class SiteMaintenanceTest extends TestCase
{
    public function test_site_is_live_when_maintenance_disabled(): void
    {
        Config::set('maintenance.enabled', false);
        Config::set('maintenance.until', null);

        $this->assertFalse(SiteMaintenance::isActive());
    }

    public function test_maintenance_page_when_enabled(): void
    {
        Config::set('maintenance.enabled', true);
        Config::set('maintenance.until', now()->addHour()->format('Y-m-d H:i'));

        $this->assertTrue(SiteMaintenance::isActive());

        $this->get('/login')
            ->assertStatus(503)
            ->assertInertia(fn ($page) => $page->component('Maintenance'));
    }

    public function test_auto_goes_live_after_until_time(): void
    {
        Config::set('maintenance.enabled', true);
        Config::set('maintenance.until', now()->subMinute()->format('Y-m-d H:i'));

        $this->assertFalse(SiteMaintenance::isActive());
    }

    public function test_parses_time_only_until(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-08-03 21:00:00', 'Asia/Kolkata'));
        Config::set('app.timezone', 'Asia/Kolkata');
        Config::set('maintenance.enabled', true);
        Config::set('maintenance.until', '10:00 PM');

        $this->assertTrue(SiteMaintenance::isActive());
        $this->assertSame('22:00', SiteMaintenance::until()->format('H:i'));

        Carbon::setTestNow(Carbon::parse('2026-08-03 22:00:00', 'Asia/Kolkata'));
        $this->assertFalse(SiteMaintenance::isActive());

        Carbon::setTestNow();
    }
}
