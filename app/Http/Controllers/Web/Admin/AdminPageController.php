<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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

    public function enrollmentsCreate(Request $request)
    {
        return Inertia::render('Admin/Enrollments/Form', [
            'uid' => null,
            'courseId' => $request->query('courseId'),
            'prefillEmail' => $request->query('email'),
            'returnTo' => $request->query('returnTo'),
        ]);
    }

    public function enrollmentsEdit(string $uid, string $courseId)
    {
        return Inertia::render('Admin/Enrollments/Form', ['uid' => $uid, 'courseId' => $courseId]);
    }

    public function mentorshipIndex()
    {
        return Inertia::render('Admin/Mentorship/Index');
    }

    public function mentorshipCreate()
    {
        return Inertia::render('Admin/Mentorship/Form', ['mentorshipId' => null]);
    }

    public function mentorshipEdit(string $id)
    {
        return Inertia::render('Admin/Mentorship/Form', ['mentorshipId' => $id]);
    }

    public function mentorshipAccessIndex()
    {
        return Inertia::render('Admin/MentorshipAccess/Index');
    }

    public function mentorshipAccessCreate()
    {
        return Inertia::render('Admin/MentorshipAccess/Form', ['uid' => null]);
    }

    public function mentorshipAccessEdit(string $uid)
    {
        return Inertia::render('Admin/MentorshipAccess/Form', ['uid' => $uid]);
    }

    public function usersIndex()
    {
        return Inertia::render('Admin/Users/Index');
    }

    public function usersCreate(Request $request)
    {
        return Inertia::render('Admin/Users/Form', [
            'uid' => null,
            'prefill' => [
                'name' => $request->query('name', ''),
                'email' => $request->query('email', ''),
            ],
            'returnTo' => $request->query('returnTo'),
            'afterCreate' => $request->query('afterCreate'),
        ]);
    }

    public function usersEdit(string $uid)
    {
        return Inertia::render('Admin/Users/Form', ['uid' => $uid]);
    }

    public function landingAppSection()
    {
        return Inertia::render('Admin/Landing/AppSection');
    }

    public function generalSettings()
    {
        return Inertia::render('Admin/Settings/General');
    }
}
