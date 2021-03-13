<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;

class CategoryController extends BasicCrudController
{
    private $rules = [
        'name' => 'string|required|max:255',
        'description' => 'nullable',
        'is_active' => 'boolean'
    ];

    protected function model()
    {
        return Category::class;
    }

    protected function rulesStore()
    {
        return $this->rules;

    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }
}
