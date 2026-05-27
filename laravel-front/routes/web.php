<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\IrisTestController;
use App\Http\Middleware\EnsureIrisAuthenticated;

Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'login'])->name('login.submit');
Route::post('/register-account', [LoginController::class, 'registerAccount'])->name('account.register');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware([EnsureIrisAuthenticated::class])->group(function () {
    Route::get('/', [IrisTestController::class, 'index'])->name('iris.index');
    Route::get('/iris-test', [IrisTestController::class, 'index']);

    Route::get('/iris-test/ping', [IrisTestController::class, 'ping'])->name('iris.ping');
    Route::post('/iris-test/search', [IrisTestController::class, 'search'])->name('iris.search');
    Route::post('/iris-test/register', [IrisTestController::class, 'register'])->name('iris.register');
    Route::post('/iris-test/update', [IrisTestController::class, 'update'])->name('iris.update');
    Route::post('/iris-test/delete', [IrisTestController::class, 'delete'])->name('iris.delete');
    Route::post('/account/settings', [LoginController::class, 'updateAccount'])->name('account.update');
});
