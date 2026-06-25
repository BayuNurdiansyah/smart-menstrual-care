<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GuardianStudent extends Pivot
{
    protected $table = 'guardian_student';

    public $incrementing = true;

    protected $fillable = [
        'student_id',
        'guardian_id',
        'guardian_type', // ortu | guru
    ];
}
