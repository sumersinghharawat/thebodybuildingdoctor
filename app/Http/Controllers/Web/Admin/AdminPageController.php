<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminPageController extends Controller
{
    public function coursesIndex()
    {
        return Inertia::render('Admin/Courses/Index');
    }

    public function coursesCreate()
    {
        return Inertia::render('Admin/Courses/Form', ['courseId' => null]);
    }

    public function coursesEdit(string $id)
    {
        return Inertia::render('Admin/Courses/Form', ['courseId' => $id]);
    }

    public function coursesShow(string $id)
    {
        return Inertia::render('Admin/Courses/Show', ['courseId' => $id]);
    }

    public function inquiriesIndex()
    {
        return Inertia::render('Admin/Inquiries/Index');
    }

    public function enrollmentsIndex()
    {
        return Inertia::render('Admin/Enrollments/Index');
    }

    public function enrollmentsCreate()
    {
        return Inertia::render('Admin/Enrollments/Form', ['uid' => null, 'courseId' => null]);
    }

    public function enrollmentsEdit(string $uid, string $courseId)
    {
        return Inertia::render('Admin/Enrollments/Form', ['uid' => $uid, 'courseId' => $courseId]);
    }

    public function blogsIndex()
    {
        return Inertia::render('Admin/Blogs/Index');
    }

    public function blogsCreate()
    {
        return Inertia::render('Admin/Blogs/Form', ['blogId' => null]);
    }

    public function blogsEdit(string $id)
    {
        return Inertia::render('Admin/Blogs/Form', ['blogId' => $id]);
    }

    public function blogAccessIndex()
    {
        return Inertia::render('Admin/BlogAccess/Index');
    }

    public function blogAccessCreate()
    {
        return Inertia::render('Admin/BlogAccess/Form', ['uid' => null]);
    }

    public function blogAccessEdit(string $uid)
    {
        return Inertia::render('Admin/BlogAccess/Form', ['uid' => $uid]);
    }

    public function usersIndex()
    {
        return Inertia::render('Admin/Users/Index');
    }

    public function usersCreate()
    {
        return Inertia::render('Admin/Users/Form', ['uid' => null]);
    }

    public function usersEdit(string $uid)
    {
        return Inertia::render('Admin/Users/Form', ['uid' => $uid]);
    }
}
