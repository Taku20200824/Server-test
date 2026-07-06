<?php

namespace App\Http\Controllers;

use App\Support\IrisNoteStore;
use Illuminate\Http\Request;

class NotesController extends Controller
{
    private const COLORS = ['lemon', 'mint', 'rose', 'iris'];
    private const MAX_NOTES = 100;
    private const MAX_TEXT = 2000;

    public function index(Request $request)
    {
        $username = (string) $request->session()->get('iris_login_user');

        return response()->json([
            'notes' => (new IrisNoteStore())->forUser($username),
        ]);
    }

    public function sync(Request $request)
    {
        $username = (string) $request->session()->get('iris_login_user');
        $notes = $request->input('notes');

        if (! is_array($notes)) {
            $notes = [];
        }

        $clean = [];

        foreach (array_slice($notes, 0, self::MAX_NOTES) as $note) {
            if (! is_array($note)) {
                continue;
            }

            $clean[] = [
                'id' => mb_substr((string) ($note['id'] ?? ''), 0, 40),
                'x' => max(0, min(100, (float) ($note['x'] ?? 0))),
                'y' => max(0, min(100, (float) ($note['y'] ?? 0))),
                'text' => mb_substr((string) ($note['text'] ?? ''), 0, self::MAX_TEXT),
                'color' => in_array($note['color'] ?? '', self::COLORS, true) ? $note['color'] : 'lemon',
                'rot' => max(-10, min(10, (float) ($note['rot'] ?? 0))),
            ];
        }

        (new IrisNoteStore())->putForUser($username, $clean);

        return response()->json(['ok' => true, 'count' => count($clean)]);
    }
}
