<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\VaultPurchase;
use App\Models\VaultVideo;
use App\Services\InquiryService;
use App\Services\VaultAccessService;
use App\Support\GeneralSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VaultPageController extends Controller
{
    public function __construct(private VaultAccessService $access) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $videos = VaultVideo::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get()
            ->map(function (VaultVideo $video) use ($user) {
                $status = $this->access->accessStatus($user, $video->id);

                return $video->toPublicArray(
                    hasAccess: $status === 'active' || $this->access->canWatchFull($user, $video),
                    accessStatus: $status,
                );
            });

        if (! $user->canBrowseCatalog()) {
            $videos = $videos->filter(fn (array $video) => $video['hasAccess'])->values();
        }

        $settings = GeneralSettings::get();
        $canBrowse = $user->canBrowseCatalog();

        return Inertia::render('Vault/Index', [
            'videos' => $videos,
            'canBrowseCatalog' => $canBrowse,
            'paymentQrUrl' => $canBrowse ? $settings['paymentQrUrl'] : '',
            'paymentInstructions' => $canBrowse ? $settings['paymentInstructions'] : '',
        ]);
    }

    public function show(Request $request, string $id)
    {
        $video = VaultVideo::query()->where('published', true)->findOrFail($id);
        $user = $request->user();
        $status = $this->access->accessStatus($user, $video->id);
        $hasAccess = $this->access->canWatchFull($user, $video);
        $canPurchase = $user
            && $user->canBrowseCatalog()
            && ! $hasAccess
            && $video->price_cents > 0;

        return Inertia::render('Vault/Show', [
            'video' => $video->toPublicArray(
                hasAccess: $hasAccess,
                accessStatus: $status,
                includePlayback: true,
            ),
            'paymentQrUrl' => $canPurchase ? GeneralSettings::paymentQrUrl() : '',
            'paymentInstructions' => $canPurchase ? GeneralSettings::paymentInstructions() : '',
            'canPurchase' => (bool) $canPurchase,
            'authenticated' => (bool) $user,
        ]);
    }

    public function purchaseIntent(Request $request, string $id)
    {
        VaultVideo::query()->where('published', true)->findOrFail($id);

        if (! $request->user()) {
            return redirect()->guest(route('login'));
        }

        return redirect()->route('vault.show', $id);
    }

    public function requestAccess(Request $request, string $id)
    {
        $video = VaultVideo::query()->where('published', true)->findOrFail($id);
        $user = $request->user();

        abort_unless($user->canBrowseCatalog(), 403);
        abort_if($video->isFree(), 422);

        if ($this->access->canWatchFull($user, $video)) {
            return back()->with('error', 'You already have access to this video.');
        }

        $existing = VaultPurchase::query()
            ->where('user_id', $user->id)
            ->where('vault_video_id', $video->id)
            ->first();

        if ($existing?->status === 'pending') {
            return back()->with('success', 'Your payment confirmation is already pending admin approval.');
        }

        VaultPurchase::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'vault_video_id' => $video->id,
            ],
            [
                'source' => 'purchase',
                'status' => 'pending',
                'requested_at' => now(),
                'granted_at' => null,
                'note' => 'Customer marked payment as completed via QR.',
            ],
        );

        InquiryService::create([
            'name' => $user->name,
            'email' => $user->email,
            'type' => 'vault',
            'courseId' => $video->id,
            'courseTitle' => $video->title,
            'message' => 'Vault video payment confirmation submitted. Please verify payment and grant full video access.',
        ]);

        return back()->with('success', 'Payment confirmation sent. An administrator will unlock the full video after verifying payment.');
    }
}
