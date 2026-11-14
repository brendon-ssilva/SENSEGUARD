<?php

declare(strict_types=1);

require __DIR__ . '/../src/bootstrap.php';

use SenseGuard\Core\App;
use SenseGuard\Http\ApiHandler;
use SenseGuard\Http\Request;

App::run(static fn (App $app, Request $request) => (new ApiHandler($app))->handle($request));
