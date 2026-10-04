<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogAccess;
use App\Models\Book;
use App\Models\BookPurchase;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Inquiry;
use App\Models\Lesson;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function __invoke()
    {
        $inquiryStatuses = Inquiry::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $supportStatuses = SupportTicket::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $bookPurchaseStatuses = BookPurchase::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $enrollmentStatuses = Enrollment::query()
            ->select('status', DB::raw('count(*) as aggregate'))
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $recentInquiries = Inquiry::query()
            ->orderByDesc('created_at')
            ->limit(6)
            ->get()
            ->map->toPublicArray();

        return response()->json([
            'stats' => [
                'users' => User::query()->count(),
                'courses' => Course::query()->count(),
                'coursesPublished' => Course::query()->where('published', true)->count(),
                'coursesDraft' => Course::query()->where('published', false)->count(),
                'lessons' => Lesson::query()->count(),
                'books' => Book::query()->count(),
                'booksPublished' => Book::query()->where('published', true)->count(),
                'booksDraft' => Book::query()->where('published', false)->count(),
                'mentorship' => Blog::query()->count(),
                'mentorshipPublished' => Blog::query()->where('published', true)->count(),
                'mentorshipDraft' => Blog::query()->where('published', false)->count(),
                'enrollments' => Enrollment::query()->count(),
                'enrollmentsActive' => (int) ($enrollmentStatuses['active'] ?? 0),
                'enrollmentsRevoked' => (int) ($enrollmentStatuses['revoked'] ?? 0),
                'bookPurchases' => BookPurchase::query()->count(),
                'bookPurchasesPending' => (int) ($bookPurchaseStatuses['pending'] ?? 0),
                'bookPurchasesActive' => (int) ($bookPurchaseStatuses['active'] ?? 0),
                'mentorshipAccess' => BlogAccess::query()->count(),
                'mentorshipAccessActive' => BlogAccess::query()->where('status', 'active')->count(),
                'inquiries' => Inquiry::query()->count(),
                'inquiriesNew' => (int) ($inquiryStatuses['new'] ?? 0),
                'inquiriesContacted' => (int) ($inquiryStatuses['contacted'] ?? 0),
                'inquiriesClosed' => (int) ($inquiryStatuses['closed'] ?? 0),
                'supportTickets' => SupportTicket::query()->count(),
                'supportTicketsOpen' => (int) ($supportStatuses['open'] ?? 0),
                'supportTicketsInProgress' => (int) ($supportStatuses['in_progress'] ?? 0),
            ],
            'recentInquiries' => $recentInquiries,
        ]);
    }
}
