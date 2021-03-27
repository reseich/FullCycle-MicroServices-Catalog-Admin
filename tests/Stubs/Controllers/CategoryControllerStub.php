<?php

namespace Tests\Stubs\Controllers;

use App\Http\Controllers\BasicCrudController;
use Tests\Stubs\Models\UploadFilesStub;

class CategoryControllerStub extends BasicCrudController
{
    protected function model(): string
    {
        return UploadFilesStub::class;
    }

    protected function rulesStore()
    {
        return [
            'name' => 'string|required|max:255',
            'description' => 'nullable',
        ];
    }

    protected function rulesUpdate()
    {
        return [
            'name' => 'string|required|max:255',
            'description' => 'nullable',
        ];
    }
}
