<?php

namespace App\Http\Controllers;

use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GenreController extends BasicCrudController
{

    private $rules = [
        'name' => 'string|required|max:255',
        'is_active' => 'boolean',
        'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL'
    ];

    public function store(Request $request)
    {
        $validateData = $this->validate($request, $this->rulesStore());
        $self = $this;
        $result = DB::transaction(function () use ($request, $validateData, $self) {
            $model = $this->model()::create($validateData);
            $self->handleRelations($model, $request);
            return $model;
        });

        $result->refresh();
        $resource = $this->resource();
        return new $resource($result);
    }

    protected function handleRelations($model, $request)
    {
        $model->categories()->sync($request->get('categories_id'));
    }

    public function update(Request $request, $id)
    {
        $validateData = $this->validate($request, $this->rulesUpdate());
        $self = $this;
        $result = DB::transaction(function () use ($request, $validateData, $id, $self) {
            $model = $this->findOrFail($id);
            $model->update($validateData);
            $self->handleRelations($model, $request);
            return $model;
        });
        $result->refresh();
        $resource = $this->resource();
        return new $resource($result);
    }

    protected function model()
    {
        return Genre::class;
    }

    protected function rulesStore()
    {
        return $this->rules;
    }

    protected function rulesUpdate()
    {
        return $this->rules;
    }

    protected function resource()
    {
        return GenreResource::class;
    }

    protected function resourceCollection()
    {
        return $this->resource();
    }
}
