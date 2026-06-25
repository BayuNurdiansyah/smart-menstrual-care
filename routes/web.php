<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
| Semua request yang bukan /api/* diteruskan ke React SPA (Vite build).
| React Router mengambil alih navigasi di sisi klien.
*/

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
