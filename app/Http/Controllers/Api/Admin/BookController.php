<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookController extends Controller
{
    public function index()
    {
        return response()->json([
            'books' => Book::query()->orderBy('sort_order')->orderBy('title')->get()->map->toAdminArray(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $book = Book::query()->create([
            'id' => Str::random(24),
            ...$data,
        ]);

        return response()->json(['book' => $book->toAdminArray()], 201);
    }

    public function show(string $id)
    {
        $book = Book::query()->findOrFail($id);

        return response()->json(['book' => $book->toAdminArray()]);
    }

    public function update(Request $request, string $id)
    {
        $book = Book::query()->findOrFail($id);
        $previousPdf = $book->pdf_path;
        $data = $this->validated($request, partial: true);
        $book->update($data);

        if (array_key_exists('pdf_path', $data) && $previousPdf && $previousPdf !== ($data['pdf_path'] ?? null)) {
            Storage::disk('local')->delete($previousPdf);
        }

        return response()->json(['book' => $book->fresh()->toAdminArray()]);
    }

    public function destroy(string $id)
    {
        $book = Book::query()->findOrFail($id);
        if ($book->pdf_path) {
            Storage::disk('local')->delete($book->pdf_path);
        }
        $book->delete();

        return response()->json(['success' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $rules = [
            'title' => [$partial ? 'sometimes' : 'required', 'string', 'max:190'],
            'slug' => ['nullable', 'string', 'max:190'],
            'description' => [$partial ? 'sometimes' : 'required', 'string'],
            'descriptionHtml' => ['nullable', 'string'],
            'thumbnailUrl' => ['nullable', 'string'],
            'pdfPath' => ['nullable', 'string', 'max:500'],
            'published' => ['nullable', 'boolean'],
            'priceCents' => ['nullable', 'integer', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
        ];

        $data = $request->validate($rules);

        $mapped = [
            'title' => $data['title'] ?? null,
            'slug' => $data['slug'] ?? (isset($data['title']) ? Str::slug($data['title']) : null),
            'description' => $data['description'] ?? null,
            'description_html' => $data['descriptionHtml'] ?? null,
            'thumbnail_url' => $data['thumbnailUrl'] ?? null,
            'pdf_path' => $data['pdfPath'] ?? null,
            'published' => $data['published'] ?? null,
            'price_cents' => $data['priceCents'] ?? null,
            'sort_order' => $data['order'] ?? null,
        ];

        if ($partial) {
            return array_filter($mapped, fn ($value) => $value !== null);
        }

        return [
            'title' => $mapped['title'],
            'slug' => $mapped['slug'] ?? Str::slug($mapped['title']),
            'description' => $mapped['description'],
            'description_html' => $mapped['description_html'],
            'thumbnail_url' => $mapped['thumbnail_url'] ?? '',
            'pdf_path' => $mapped['pdf_path'] ?? '',
            'published' => $mapped['published'] ?? false,
            'price_cents' => $mapped['price_cents'] ?? 0,
            'sort_order' => $mapped['sort_order'] ?? 0,
        ];
    }
}
