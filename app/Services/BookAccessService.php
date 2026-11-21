<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookPurchase;
use App\Models\User;
use App\Support\Roles;

class BookAccessService
{
    public function canRead(?User $user, Book $book): bool
    {
        if (! $user) {
            return false;
        }

        if (Roles::isAdmin($user->roleList())) {
            return true;
        }

        return BookPurchase::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'active')
            ->exists();
    }

    public function accessStatus(?User $user, string $bookId): ?string
    {
        if (! $user) {
            return null;
        }

        if (Roles::isAdmin($user->roleList())) {
            return 'active';
        }

        return BookPurchase::query()
            ->where('user_id', $user->id)
            ->where('book_id', $bookId)
            ->value('status');
    }
}
