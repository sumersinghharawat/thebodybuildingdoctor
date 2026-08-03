<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BookPurchase;
use App\Services\BookAccessService;
use App\Services\InquiryService;
use App\Support\GeneralSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BooksPageController extends Controller
{
    public function __construct(private BookAccessService $access) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $books = Book::query()
            ->where('published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get()
            ->map(function (Book $book) use ($user) {
                $status = $this->access->accessStatus($user, $book->id);

                return $book->toPublicArray(
                    hasAccess: $status === 'active',
                    accessStatus: $status,
                );
            });

        $settings = GeneralSettings::get();

        return Inertia::render('Books/Index', [
            'books' => $books,
            'paymentQrUrl' => $settings['paymentQrUrl'],
            'paymentInstructions' => $settings['paymentInstructions'],
        ]);
    }

    public function show(Request $request, string $bookId)
    {
        $book = Book::query()->where('published', true)->findOrFail($bookId);
        $user = $request->user();
        $status = $this->access->accessStatus($user, $book->id);
        $hasAccess = $status === 'active';

        return Inertia::render('Books/Show', [
            'book' => $book->toPublicArray(hasAccess: $hasAccess, accessStatus: $status),
            'paymentQrUrl' => GeneralSettings::paymentQrUrl(),
            'paymentInstructions' => GeneralSettings::paymentInstructions(),
            'canRead' => $hasAccess && $book->hasPdf(),
        ]);
    }

    public function requestAccess(Request $request, string $bookId)
    {
        $book = Book::query()->where('published', true)->findOrFail($bookId);
        $user = $request->user();

        if ($this->access->canRead($user, $book)) {
            return back()->with('error', 'You already have access to this book.');
        }

        $existing = BookPurchase::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->first();

        if ($existing?->status === 'pending') {
            return back()->with('success', 'Your payment confirmation is already pending admin approval.');
        }

        BookPurchase::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'book_id' => $book->id,
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
            'type' => 'books',
            'courseId' => $book->id,
            'courseTitle' => $book->title,
            'message' => 'Book payment confirmation submitted. Please verify payment and grant book access.',
        ]);

        return back()->with('success', 'Payment confirmation sent. An administrator will unlock the book after verifying payment.');
    }

    public function read(Request $request, string $bookId)
    {
        $book = Book::query()->where('published', true)->findOrFail($bookId);
        $user = $request->user();

        if (! $this->access->canRead($user, $book)) {
            return redirect()->route('books.show', $bookId)
                ->with('error', 'You need approved access to read this book.');
        }

        if (! $book->hasPdf()) {
            return redirect()->route('books.show', $bookId)
                ->with('error', 'This book PDF is not available yet.');
        }

        return Inertia::render('Books/Read', [
            'book' => $book->toPublicArray(hasAccess: true, accessStatus: 'active'),
            'pdfStreamUrl' => route('books.pdf', $book->id),
        ]);
    }

    public function streamPdf(Request $request, string $bookId): StreamedResponse
    {
        $book = Book::query()->where('published', true)->findOrFail($bookId);
        $user = $request->user();

        abort_unless($this->access->canRead($user, $book), 403);
        abort_unless($book->hasPdf(), 404);

        return Storage::disk('local')->response(
            $book->pdf_path,
            basename($book->pdf_path),
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="'.basename($book->pdf_path).'"',
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store, max-age=0',
            ],
        );
    }
}
