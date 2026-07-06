<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class IrisNoteStore
{
    public function forUser(string $username): array
    {
        $username = trim($username);

        if ($username === '') {
            return [];
        }

        return $this->allNotes()[$username] ?? [];
    }

    public function putForUser(string $username, array $notes): void
    {
        $username = trim($username);

        if ($username === '') {
            return;
        }

        $all = $this->allNotes();
        $all[$username] = $notes;

        Storage::disk('local')->put(
            $this->path(),
            json_encode($all, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        );
    }

    private function allNotes(): array
    {
        $path = $this->path();

        if (! Storage::disk('local')->exists($path)) {
            return [];
        }

        $notes = json_decode(Storage::disk('local')->get($path), true);

        return is_array($notes) ? $notes : [];
    }

    private function path(): string
    {
        return 'iris_notes.json';
    }
}
