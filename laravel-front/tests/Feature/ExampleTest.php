<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/')
            ->assertRedirect('/login');
    }

    public function test_login_accepts_configured_credentials(): void
    {
        config([
            'services.iris_login.user' => 'admin',
            'services.iris_login.password' => 'secret',
        ]);

        $this->post('/login', [
            'username' => 'admin',
            'password' => 'secret',
        ])
            ->assertRedirect(route('iris.index'));

        $this->assertTrue(session('iris_logged_in'));
    }

    public function test_the_iris_console_returns_a_successful_response(): void
    {
        $response = $this->withSession(['iris_logged_in' => true])->get('/');

        $response
            ->assertStatus(200)
            ->assertSee('IRIS Console');
    }

    public function test_iris_search_gets_the_configured_barcode_endpoint(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake([
            '127.0.0.1:52773/test/api/search/000001' => Http::response(['found' => true], 200),
        ]);

        $response = $this->withSession(['iris_logged_in' => true])->postJson('/iris-test/search', [
            'barcode' => '*000001',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('iris_status', 200)
            ->assertJsonPath('data.found', true);

        Http::assertSent(fn ($request) => $request->method() === 'GET'
            && $request->url() === 'http://127.0.0.1:52773/test/api/search/000001');
    }

    public function test_empty_iris_search_gets_the_record_list_endpoint(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake([
            '127.0.0.1:52773/test/api/list' => Http::response([
                'count' => 1,
                'records' => [
                    ['no' => 1, 'barcode' => '000001', 'name' => 'NARUTO'],
                ],
            ], 200),
        ]);

        $response = $this->withSession(['iris_logged_in' => true])->postJson('/iris-test/search', [
            'barcode' => '',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('iris_status', 200)
            ->assertJsonPath('data.records.0.barcode', '000001');

        Http::assertSent(fn ($request) => $request->method() === 'GET'
            && $request->url() === 'http://127.0.0.1:52773/test/api/list');
    }

    public function test_iris_register_posts_to_the_configured_endpoint(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake([
            '127.0.0.1:52773/test/api/register' => Http::response(['found' => true, 'message' => 'Registered'], 200),
        ]);

        $response = $this->withSession(['iris_logged_in' => true])->postJson('/iris-test/register', [
            'barcode' => '*000008',
            'name' => 'SAKURA',
            'kanji' => 'サクラ',
            'katakana' => 'サクラ',
            'address' => '大阪',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('iris_status', 200)
            ->assertJsonPath('data.message', 'Registered');

        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && $request->url() === 'http://127.0.0.1:52773/test/api/register'
            && $request['barcode'] === '000008'
            && $request['name'] === 'SAKURA');
    }

    public function test_iris_register_generates_the_next_barcode_when_empty(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake([
            '127.0.0.1:52773/test/api/list' => Http::response([
                'count' => 2,
                'records' => [
                    ['no' => 7, 'barcode' => '000007', 'name' => 'NARUTO'],
                    ['no' => 8, 'barcode' => '000008', 'name' => 'SAKURA'],
                ],
            ], 200),
            '127.0.0.1:52773/test/api/register' => Http::response(['message' => 'Registered'], 200),
        ]);

        $response = $this->withSession(['iris_logged_in' => true])->postJson('/iris-test/register', [
            'barcode' => '',
            'name' => 'KAKASHI',
            'kanji' => 'カカシ',
            'katakana' => 'カカシ',
            'address' => '東京',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('request.barcode', '000009')
            ->assertJsonPath('data.message', 'Registered');

        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && $request->url() === 'http://127.0.0.1:52773/test/api/register'
            && $request['barcode'] === '000009'
            && $request['name'] === 'KAKASHI');
    }
}
