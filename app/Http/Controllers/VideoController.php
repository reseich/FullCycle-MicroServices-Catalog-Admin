<?php

namespace App\Http\Controllers;

use App\Models\Video;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VideoController extends BasicCrudController
{

    /**
     * @var string[]
     */
    private $rules;

    protected function model()
    {
        return Video::class;
    }

    public function __construct()
    {
        $this->rules = [
            'title' => 'string|required|max:255',
            'description' => 'required',
            'year_launched' => 'required|date_format:Y',
            'opened' => 'boolean',
            'rating' => 'required|in:' . implode(',', Video::RATING_LIST),
            'duration' => 'required|integer',
            'categories_id' => 'required|array|exists:categories,id,deleted_at,NULL',
            'genres_id' => 'required|array|exists:genres,id,deleted_at,NULL',
        ];
    }

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
        return $result;
    }

    protected function handleRelations($model, $request)
    {
        $model->categories()->sync($request->get('categories_id'));
        $model->genres()->sync($request->get('genres_id'));
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
        return $result;
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
