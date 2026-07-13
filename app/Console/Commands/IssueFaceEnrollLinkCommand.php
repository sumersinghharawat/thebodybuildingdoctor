<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\FaceAuth\FaceEnrollmentLinkService;
use Illuminate\Console\Command;

class IssueFaceEnrollLinkCommand extends Command
{
    protected $signature = 'face:enroll-link {email : The user email address} {--hours=24 : Link validity in hours}';

    protected $description = 'Generate a signed face enrollment URL for a user (admin workflow)';

    public function handle(FaceEnrollmentLinkService $links): int
    {
        $user = User::query()->where('email', $this->argument('email'))->first();

        if (! $user) {
            $this->error('User not found.');

            return self::FAILURE;
        }

        $hours = max(1, (int) $this->option('hours'));
        $result = $links->generate($user, $hours);

        $this->info("Face enrollment link for {$user->email} (valid {$result['hours']}h):");
        $this->line($result['url']);

        return self::SUCCESS;
    }
}
