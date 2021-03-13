<?php


namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;


abstract class BasicCrudController extends Controller
{
    protected abstract function model();

    protected abstract function rulesStore();

    protected abstract function rulesUpdate();

    public function index()
    {
        return $this->model()::all();
    }

    public function store(Request $request)
    {
        $validateData = $this->validate($request, $this->rulesStore());
        $result = $this->model()::create($validateData);
        $result->refresh();
        return $result;
    }

    public function findOrFail($id)
    {
        $model = $this->model();
        $keyName = (new $model)->getRouteKeyName();
        return $this->model()::where($keyName, $id)->firstOrFail();
    }

    public function show($id)
    {
        return $this->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $result = $this->findOrFail($id);
        $validateData = $this->validate($request, $this->rulesUpdate());
        $result->update($validateData);
        return $result;
    }

    public function destroy($id)
    {
        $result = $this->findOrFail($id);
        $result->delete();
        return response()->noContent();
    }


}
