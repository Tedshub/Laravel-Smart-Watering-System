<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'ip_address',
        'api_key'
    ];

    public function sensorLogs()
    {
        return $this->hasMany(SensorLog::class);
    }

    public function relayLogs()
    {
        return $this->hasMany(RelayLog::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
