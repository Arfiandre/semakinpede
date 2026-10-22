<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $application = parent::createApplication();
        $configuration = $application->make('config');

        if (
            ! $application->environment('testing') ||
            $configuration->get('database.default') !== 'sqlite' ||
            $configuration->get('database.connections.sqlite.database') !== ':memory:' ||
            ! empty($configuration->get('database.connections.sqlite.url'))
        ) {
            throw new RuntimeException('Tes dihentikan: hanya database SQLite :memory: yang boleh dipakai. Hapus cache konfigurasi sebelum menguji.');
        }

        return $application;
    }
}
