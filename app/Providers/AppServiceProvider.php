<?php

namespace App\Providers;

use App\Actions\GenerateFaceLockRegistrationOptions;
use App\Console\Commands\ServeWithUploadLimitsCommand;
use Illuminate\Foundation\Console\ServeCommand;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Passkeys\Actions\GenerateRegistrationOptions;
use Laravel\Passkeys\Passkeys;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->extend(ServeCommand::class, function () {
            return new ServeWithUploadLimitsCommand;
        });

        $this->app->bind(GenerateRegistrationOptions::class, GenerateFaceLockRegistrationOptions::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Schema::defaultStringLength(191);

        Vite::prefetch(concurrency: 3);

        Passkeys::authorizeLoginUsing(function ($request, $user) {
            return $user->hasAppAccess();
        });

        if ($this->app->environment('local')) {
            config(['passkeys.throttle' => null]);
        }
    }
}
