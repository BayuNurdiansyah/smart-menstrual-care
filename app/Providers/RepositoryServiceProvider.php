<?php

namespace App\Providers;

use App\Repositories\Contracts\AssessmentRepositoryInterface;
use App\Repositories\Contracts\BadgeRepositoryInterface;
use App\Repositories\Contracts\CycleRepositoryInterface;
use App\Repositories\Contracts\GameRepositoryInterface;
use App\Repositories\Contracts\GameScoreRepositoryInterface;
use App\Repositories\Contracts\MaterialRepositoryInterface;
use App\Repositories\Contracts\OtpRepositoryInterface;
use App\Repositories\Contracts\StageRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Contracts\WheelQuestionRepositoryInterface;
use App\Repositories\Eloquent\AssessmentRepository;
use App\Repositories\Eloquent\BadgeRepository;
use App\Repositories\Eloquent\CycleRepository;
use App\Repositories\Eloquent\GameRepository;
use App\Repositories\Eloquent\GameScoreRepository;
use App\Repositories\Eloquent\MaterialRepository;
use App\Repositories\Eloquent\OtpRepository;
use App\Repositories\Eloquent\StageRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Eloquent\WheelQuestionRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Pemetaan Contract (Interface) -> implementasi Eloquent.
     * Service Layer nanti cukup type-hint interface-nya, container
     * yang me-resolve implementasi konkretnya.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class,       UserRepository::class);
        $this->app->bind(OtpRepositoryInterface::class,        OtpRepository::class);
        $this->app->bind(StageRepositoryInterface::class,      StageRepository::class);
        $this->app->bind(MaterialRepositoryInterface::class,   MaterialRepository::class);
        $this->app->bind(GameScoreRepositoryInterface::class,  GameScoreRepository::class);
        $this->app->bind(GameRepositoryInterface::class,       GameRepository::class);
        $this->app->bind(BadgeRepositoryInterface::class,      BadgeRepository::class);
        $this->app->bind(CycleRepositoryInterface::class,      CycleRepository::class);
        $this->app->bind(AssessmentRepositoryInterface::class, AssessmentRepository::class);
        $this->app->bind(WheelQuestionRepositoryInterface::class, WheelQuestionRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
