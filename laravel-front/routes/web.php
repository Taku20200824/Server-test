<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IrisTestController;

Route::get('/', [IrisTestController::class, 'index'])->name('iris.index');
Route::get('/iris-test', [IrisTestController::class, 'index']);

Route::get('/iris-test/ping', [IrisTestController::class, 'ping'])->name('iris.ping');
Route::post('/iris-test/search', [IrisTestController::class, 'search'])->name('iris.search');
Route::post('/iris-test/register', [IrisTestController::class, 'register'])->name('iris.register');
