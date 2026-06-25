<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'kelas',
        'date_of_birth',
        'region',
        'email_verified_at',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth'     => 'date',
            'email_verified_at' => 'datetime',
            'is_active'         => 'boolean',
            'password'          => 'hashed',
        ];
    }

    // ---- Role helpers ----------------------------------------------------

    public function isStudent(): bool
    {
        return $this->role === 'murid';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isGuardian(): bool
    {
        return in_array($this->role, ['ortu', 'guru'], true);
    }

    // ---- Relasi Murid <-> Pengawas (pivot guardian_student) --------------

    /** Pengawas (ortu/guru) yang memantau murid ini. */
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'guardian_student', 'student_id', 'guardian_id')
            ->withPivot('guardian_type')
            ->withTimestamps();
    }

    /** Murid yang dipantau oleh pengawas ini. */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'guardian_student', 'guardian_id', 'student_id')
            ->withPivot('guardian_type')
            ->withTimestamps();
    }

    // ---- Relasi domain (khusus murid) ------------------------------------

    public function stageProgress(): HasMany
    {
        return $this->hasMany(StageProgress::class);
    }

    public function gameScores(): HasMany
    {
        return $this->hasMany(GameScore::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('earned_at')
            ->withTimestamps();
    }

    public function cycles(): HasMany
    {
        return $this->hasMany(Cycle::class);
    }

    public function assessmentAttempts(): HasMany
    {
        return $this->hasMany(AssessmentAttempt::class);
    }
}
