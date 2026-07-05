<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand;

class ServeWithUploadLimitsCommand extends ServeCommand
{
    /**
     * @return array<int, string>
     */
    protected function serverCommand()
    {
        $command = parent::serverCommand();

        array_splice($command, 1, 0, [
            '-d', 'upload_max_filesize=200M',
            '-d', 'post_max_size=210M',
            '-d', 'memory_limit=256M',
            '-d', 'max_execution_time=300',
            '-d', 'max_input_time=300',
        ]);

        return $command;
    }
}
