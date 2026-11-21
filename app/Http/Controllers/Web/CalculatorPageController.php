<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CalculatorPageController extends Controller
{
    public function __invoke()
    {
        return Inertia::render('Calculator/Index');
    }
}
