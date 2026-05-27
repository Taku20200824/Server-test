<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    private function adminSession(): array
    {
        return [
            'iris_logged_in' => true,
            'iris_login_user' => 'admin',
            'iris_login_role' => 'admin',
        ];
    }

    private function viewerSession(): array
    {
        return [
            'iris_logged_in' => true,
            'iris_login_user' => 'taku',
            'iris_login_role' => 'viewer',
        ];
    }

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
        $this->assertSame('admin', session('iris_login_role'));
    }

    public function test_login_accepts_viewer_credentials(): void
    {
        config([
            'services.iris_login.viewer_user' => 'taku',
            'services.iris_login.viewer_password' => 'taku1234',
        ]);

        $this->post('/login', [
            'username' => 'taku',
            'password' => 'taku1234',
        ])
            ->assertRedirect(route('iris.index'));

        $this->assertTrue(session('iris_logged_in'));
        $this->assertSame('viewer', session('iris_login_role'));
    }

    public function test_account_registration_uses_id_rule_for_roles(): void
    {
        Storage::fake('local');

        $this->post('/register-account', [
            'username' => '1239',
            'display_name' => 'Boss',
            'password' => 'pass1234',
            'password_confirmation' => 'pass1234',
        ])->assertRedirect();

        $this->post('/login', [
            'username' => '1239',
            'password' => 'pass1234',
        ])->assertRedirect(route('iris.index'));

        $this->assertSame('admin', session('iris_login_role'));
        $this->assertSame('Boss', session('iris_login_name'));
    }

    public function test_account_registration_makes_other_four_digit_ids_viewers(): void
    {
        Storage::fake('local');

        $this->post('/register-account', [
            'username' => '1234',
            'display_name' => 'Guest',
            'password' => 'pass1234',
            'password_confirmation' => 'pass1234',
        ])->assertRedirect();

        $this->post('/login', [
            'username' => '1234',
            'password' => 'pass1234',
        ])->assertRedirect(route('iris.index'));

        $this->assertSame('viewer', session('iris_login_role'));
        $this->assertSame('Guest', session('iris_login_name'));
    }

    public function test_logged_in_user_can_update_account_settings(): void
    {
        Storage::fake('local');

        $this->withSession($this->adminSession())
            ->post('/account/settings', [
                'display_name' => 'Admin Name',
                'password' => 'next1234',
                'password_confirmation' => 'next1234',
            ])
            ->assertRedirect();

        $this->assertSame('Admin Name', session('iris_login_name'));
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
            '127.0.0.1:52773/test/api/search/000008' => Http::response(['found' => false], 200),
            '127.0.0.1:52773/test/api/register' => Http::response(['found' => true, 'message' => 'Registered'], 200),
        ]);

        $response = $this->withSession($this->adminSession())->postJson('/iris-test/register', [
            'barcode' => '*000008',
            'name' => 'SAKURA',
            'kanji' => '桜',
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

        $response = $this->withSession($this->adminSession())->postJson('/iris-test/register', [
            'barcode' => '',
            'name' => 'KAKASHI',
            'kanji' => '案山子',
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

    public function test_iris_register_rejects_duplicate_manual_barcode(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake([
            '127.0.0.1:52773/test/api/search/000008' => Http::response(['found' => true], 200),
        ]);

        $response = $this->withSession($this->adminSession())->postJson('/iris-test/register', [
            'barcode' => '000008',
            'name' => 'SAKURA',
            'kanji' => '桜',
            'katakana' => 'サクラ',
            'address' => '大阪',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'This ID already exists. Please change the ID.')
            ->assertJsonValidationErrors('barcode');

        Http::assertNotSent(fn ($request) => $request->method() === 'POST'
            && $request->url() === 'http://127.0.0.1:52773/test/api/register');
    }

    public function test_iris_register_rejects_wrong_kanji_and_katakana_scripts(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake();

        $response = $this->withSession($this->adminSession())->postJson('/iris-test/register', [
            'barcode' => '000010',
            'name' => 'NARUTO',
            'kanji' => 'NARUTO',
            'katakana' => '拓',
            'address' => '大阪',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'Kanji/Katakana check failed.')
            ->assertJsonValidationErrors(['kanji', 'katakana']);
    }

    public function test_admin_can_update_existing_record(): void
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

        $response = $this->withSession($this->adminSession())->postJson('/iris-test/update', [
            'barcode' => '000008',
            'name' => 'SAKURA EDIT',
            'kanji' => '桜',
            'katakana' => 'サクラ',
            'address' => '大阪',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('request.barcode', '000008')
            ->assertJsonPath('request.name', 'SAKURA EDIT');

        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && $request->url() === 'http://127.0.0.1:52773/test/api/register'
            && $request['barcode'] === '000008'
            && $request['name'] === 'SAKURA EDIT');
    }

    public function test_admin_can_delete_existing_record(): void
    {
        config([
            'services.iris.url' => '127.0.0.1',
            'services.iris.port' => '52773',
            'services.iris.api_path' => '/test',
            'services.iris.user' => 'tester',
            'services.iris.password' => 'secret',
        ]);

        Http::fake([
            '127.0.0.1:52773/test/api/delete' => Http::response(['deleted' => true, 'message' => 'Deleted'], 200),
        ]);

        $response = $this->withSession($this->adminSession())->postJson('/iris-test/delete', [
            'barcode' => '000008',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('request.barcode', '000008')
            ->assertJsonPath('data.message', 'Deleted');

        Http::assertSent(fn ($request) => $request->method() === 'POST'
            && $request->url() === 'http://127.0.0.1:52773/test/api/delete'
            && $request['barcode'] === '000008');
    }

    public function test_viewer_cannot_register_update_or_delete_records(): void
    {
        Http::fake();

        $payload = [
            'barcode' => '000008',
            'name' => 'SAKURA',
            'kanji' => '桜',
            'katakana' => 'サクラ',
            'address' => '大阪',
        ];

        $this->withSession($this->viewerSession())
            ->postJson('/iris-test/register', $payload)
            ->assertStatus(403)
            ->assertJsonPath('message', 'Admin login is required to edit records.');

        $this->withSession($this->viewerSession())
            ->postJson('/iris-test/update', $payload)
            ->assertStatus(403)
            ->assertJsonPath('message', 'Admin login is required to edit records.');

        $this->withSession($this->viewerSession())
            ->postJson('/iris-test/delete', ['barcode' => '000008'])
            ->assertStatus(403)
            ->assertJsonPath('message', 'Admin login is required to edit records.');

        Http::assertNothingSent();
    }
}
