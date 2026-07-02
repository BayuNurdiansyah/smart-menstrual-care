<?php

use App\Http\Controllers\Api\Admin\AssessmentQuestionController;
use App\Http\Controllers\Api\Admin\GuardianLinkController;
use App\Http\Controllers\Api\Admin\MaterialController;
use App\Http\Controllers\Api\Admin\UploadController;
use App\Http\Controllers\Api\Admin\WheelQuestionController;
use App\Http\Controllers\Api\AssessmentController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\CycleController;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\Guardian\SummaryController;
use App\Http\Controllers\Api\StageController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Smart Menstrual
|--------------------------------------------------------------------------
| Prefix otomatis: /api/v1/...
| Hanya mencakup endpoint yang controllernya sudah diimplementasikan
| pada Tahap 4 (Auth, Cycle, Assessment, Game, Material Admin, Summary).
*/

Route::prefix('v1')->group(function () {

    // ── Auth (public) ───────────────────────────────────────────────────────
    // Throttle untuk meredam brute-force pada OTP/login.
    Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
        Route::post('register',   [AuthController::class, 'register']);
        Route::post('login',      [AuthController::class, 'login']);
        Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
    });

    // ── Terautentikasi (Sanctum) ────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {

        // Umum untuk semua role yang sudah login.
        Route::get('auth/me',      [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // ── MURID — tracker, assessment, gamifikasi ─────────────────────────
        Route::middleware('role:murid')->group(function () {
            // Modul pembelajaran — materi per tahap (1-4)
            Route::get('stages/{stage}/materials', [StageController::class, 'materials']);
            // Tandai tahap selesai -> evaluasi & award badge
            Route::post('stages/{stage}/complete', [StageController::class, 'complete']);
            // Soal Roda Keberuntungan (KYB)
            Route::get('stages/{stage}/wheel-questions', [StageController::class, 'wheelQuestions']);

            // Tracker siklus
            Route::get('cycles/current', [CycleController::class, 'getCurrentCycle']);
            Route::get('cycles',         [CycleController::class, 'history']);
            Route::post('cycles',        [CycleController::class, 'startCycle']);
            Route::put('cycles/{cycle}', [CycleController::class, 'editHistory']);

            // Assessment harian (selama menstruasi)
            Route::get('assessments/questions',       [AssessmentController::class, 'questions']);
            Route::get('assessments/daily-status',    [AssessmentController::class, 'dailyStatus']);
            Route::get('assessments/assessed-dates',  [AssessmentController::class, 'assessedDates']);
            Route::get('assessments/answers',         [AssessmentController::class, 'answers']);
            Route::post('assessments',                [AssessmentController::class, 'store']);
            Route::get('assessments/chart',           [AssessmentController::class, 'getChartData']);

            // Gamifikasi
            Route::post('games/score',  [GameController::class, 'submitScore']);
            Route::get('games/badges',  [GameController::class, 'getBadges']);
        });

        // ── ADMIN — CRUD materi, upload gambar, & kelola soal ───────────────
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('materials',              [MaterialController::class, 'index']);
            Route::post('materials',             [MaterialController::class, 'store']);
            Route::get('materials/{material}',   [MaterialController::class, 'show']);
            Route::put('materials/{material}',   [MaterialController::class, 'update']);
            Route::delete('materials/{material}', [MaterialController::class, 'destroy']);

            // Upload gambar (ilustrasi langkah / galeri materi)
            Route::post('uploads', [UploadController::class, 'store']);
            // Upload audio (narasi materi)
            Route::post('uploads-audio', [UploadController::class, 'storeAudio']);

            // Kelola soal Assessment
            Route::apiResource('assessment-questions', AssessmentQuestionController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            // Kelola soal Roda Keberuntungan
            Route::apiResource('wheel-questions', WheelQuestionController::class)
                ->only(['index', 'store', 'update', 'destroy']);

            // Kelola relasi Murid <-> Pengawas (Opsi C)
            Route::get('guardian-links', [GuardianLinkController::class, 'index']);
            Route::post('students/{student}/guardians', [GuardianLinkController::class, 'attach']);
            Route::delete('students/{student}/guardians/{guardian}', [GuardianLinkController::class, 'detach']);
        });

        // ── ORTU / GURU — dashboard ringkasan murid ─────────────────────────
        Route::middleware('role:ortu,guru')->prefix('guardian')->group(function () {
            Route::get('students', [SummaryController::class, 'students']);
            Route::get('students/{student}/summary', [SummaryController::class, 'getStudentSummary']);
        });
    });
});
