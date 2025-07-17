<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RelayLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'action',
        'duration_seconds'
    ];

    public function device()
    {
        return $this->belongsTo(Device::class);
    }
}
