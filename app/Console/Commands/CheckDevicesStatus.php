<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Device;
use Carbon\Carbon;

class CheckDevicesStatus extends Command
{
    protected $signature = 'devices:check-status';
    protected $description = 'Check and update devices offline status';

    public function handle()
    {
        $threshold = Carbon::now()->subMinutes(5);

        // Update devices that haven't been seen for 5 minutes
        $affected = Device::where('status', '!=', 'inactive')
                         ->where(function($query) use ($threshold) {
                             $query->where('last_seen_at', '<', $threshold)
                                   ->orWhereNull('last_seen_at');
                         })
                         ->update([
                             'status' => 'inactive',
                             'updated_at' => Carbon::now()
                         ]);

        $this->info("Marked {$affected} devices as inactive.");
        return 0;
    }
}
