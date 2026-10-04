<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Rules\Recaptcha;
use App\Services\SupportTicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportPageController extends Controller
{
    public function create(Request $request): Response
    {
        $user = $request->user();

        $tickets = [];
        if ($user) {
            $tickets = SupportTicket::query()
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)->orWhere('email', $user->email);
                })
                ->orderByDesc('created_at')
                ->limit(8)
                ->get()
                ->map->toMemberArray();
        }

        return Inertia::render('Support/Create', [
            'tickets' => $tickets,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => [$user ? 'nullable' : 'required', 'string', 'max:120'],
            'email' => [$user ? 'nullable' : 'required', 'email', 'max:255'],
            'subject' => ['required', 'string', 'max:180'],
            'message' => ['required', 'string', 'max:5000'],
            'attachments' => ['nullable', 'array', 'max:4'],
            'attachments.*' => ['file', 'max:51200'],
            'recaptchaToken' => ['nullable', 'string', new Recaptcha('support')],
        ]);

        $files = $request->file('attachments');
        if (! is_array($files)) {
            $files = $files ? [$files] : [];
        }
        $files = array_values(array_filter(
            $files,
            fn ($file) => $file instanceof \Illuminate\Http\UploadedFile && $file->isValid(),
        ));

        SupportTicketService::create(
            [
                'name' => $user?->name ?: $data['name'],
                'email' => $user?->email ?: $data['email'],
                'subject' => $data['subject'],
                'message' => $data['message'],
            ],
            $files,
            $user,
        );

        return back()->with('success', 'Your support request was sent. We will email you when we reply.');
    }
}
