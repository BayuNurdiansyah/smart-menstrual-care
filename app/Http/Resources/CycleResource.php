<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CycleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'start_date'    => $this->start_date?->toDateString(),
            'end_date'      => $this->end_date?->toDateString(),
            'period_length' => $this->period_length,
            'cycle_length'  => $this->cycle_length,
            'status'        => $this->status,
            'auto_closed'   => (bool) $this->auto_closed,
            'notes'         => $this->notes,
        ];
    }
}
