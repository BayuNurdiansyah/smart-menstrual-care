<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'email'          => $this->email,
            'role'            => $this->role,
            'role_label'      => UserRole::tryFrom($this->role)?->label(),
            'kelas'           => $this->kelas,
            'date_of_birth'   => $this->date_of_birth?->toDateString(),
            'region'          => $this->region,
            'is_active'       => (bool) $this->is_active,
            'email_verified'  => $this->email_verified_at !== null,
        ];
    }
}
