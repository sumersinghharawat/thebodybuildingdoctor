<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Services\SupportTicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketAdminController extends Controller
{
    public function index(): Response
    {
        $tickets = SupportTicket::query()
            ->withCount(['attachments', 'replies'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (SupportTicket $ticket) {
                return [
                    ...$ticket->toAdminArray(),
                    'attachmentCount' => $ticket->attachments_count,
                    'replyCount' => $ticket->replies_count,
                ];
            });

        return Inertia::render('Admin/Support/Index', [
            'tickets' => $tickets,
        ]);
    }

    public function show(string $id): Response
    {
        $ticket = SupportTicket::query()
            ->with(['attachments', 'replies.user'])
            ->findOrFail($id);

        return Inertia::render('Admin/Support/Show', [
            'ticket' => $ticket->toAdminArray(),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved'],
        ]);

        $ticket = SupportTicket::query()->findOrFail($id);
        SupportTicketService::setStatus($ticket, $data['status']);

        return back()->with('success', 'Ticket status updated.');
    }

    public function reply(Request $request, string $id): RedirectResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'status' => ['nullable', 'in:open,in_progress,resolved'],
        ]);

        $ticket = SupportTicket::query()->findOrFail($id);
        SupportTicketService::reply($ticket, $data['body'], $request->user());

        if (! empty($data['status'])) {
            SupportTicketService::setStatus($ticket->fresh(), $data['status']);
        }

        return back()->with('success', 'Reply sent to '.$ticket->email.'.');
    }
}
